import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { config } from "./config.js";
import cors from 'cors';
import productRoutes from "./routes/product.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import morgan from "morgan";
import usersRoutes from "./routes/users.routes.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use(cors());
app.use(morgan('dev'));


app.get("/", (req, res) => res.json({ message: "API is running" }));
app.use("/api/products", productRoutes);
app.use("/api", usersRoutes);


app.use(notFound);
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB connected");
}).catch((e) => {
    console.log("MongoDB error:", e);
});    

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
