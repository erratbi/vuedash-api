import {Router} from "express";
import User from "../models/User";

const router = Router();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

router.post("/", async (req, res) => {
  const {email, password} = req.body;

  const user = await User.findOne({email});

  if (user && user.isValidPassword(password))
    return res.json(user.toAuthJson());

  return res.status(400).json({errors: {global: "Invalid credentials"}});
});

export default router;
