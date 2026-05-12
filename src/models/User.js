import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { required: true, type: String, unique: true, index: true},
    password: { type: String, required: true},
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
