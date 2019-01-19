import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";

const schema = new Schema(
  {
    email: {
      type: String,
      index: true,
      unique: true,
      required: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isModerator: { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.methods.isValidPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

schema.methods.toAuthJson = function toAuthJson() {
  return {
    email: this.email,
    isAdmin: this.isAdmin,
    isModerator: this.isModerator,
    token: this.generateJWT()
  };
};

schema.methods.generateJWT = function() {
  return jwt.sign({ email: this.email }, config.secret);
};

export default model("User", schema);
