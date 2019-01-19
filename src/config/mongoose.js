import config from "./index";
import mongoose from "mongoose";


mongoose.connect(
  config.db,
  { useNewUrlParser: true, useCreateIndex: true },
);

const db = mongoose.connection;

db.once("open", () => console.log("Connected to database"));

export default db;
