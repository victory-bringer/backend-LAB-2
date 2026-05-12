import {Router} from "express";
import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const router = Router();


const signToken = (user) => {
    return jwt.sign(
        {sub: user._id, email: user.email, name: user.name},
         process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES}
    )
}


router.post('/register', async (req, res, next) => {
    try {
        const {name, email, password} = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Invalid payload',
            })
        }

        const exists = await User.findOne({email})

        if (exists) {
            return res.status(409).json({
                error: 'Email sudah terdaftar',
            })
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password: hashed})
        return res.status(201).json({
            message: 'Registrasi berhasil',
            id: user._id
        });
    } catch (e) {
        next(e);
    }
});


router.post('/login', async (req, res, next) => {
    try {
        const {email, password} = req.body;


        if (!email || !password) {
            return res.status(400).json({error: 'Invalid payload'});
        }

        const user = await User.findOne({email})

        if (!user) return res.status(401).json({error: 'Email atau password salah'})

        const ok = await bcrypt.compare(password, user.password);


        if (!ok) return res.status(401).json({error: 'Email atau password salah'})

        const token = signToken(user);
        return res.json({token})
    } catch (e) {
        next(e);
    }
});


const auth = (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer') ? h.slice(7) : null;
    if (!token) return res.status(401).json({error: 'Unauthorized'});

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next()
    } catch (e){
        return res.status(401).json({error: 'Invalid token'})
    }
}

router.get('/me', auth, async (req, res) => {
    const u = await User.findById(req.user.sub).select('-password');
    if (!u) return res.status(404).json({error: 'User not found'});
    res.json(u);
});

export default router;
