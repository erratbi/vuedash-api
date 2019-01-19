import dotenv from "dotenv";
import { resolve } from "path";

const rootPath = resolve(__dirname, "..");

dotenv.config();

const { DB, PORT, SECRET } = process.env;

export default {
  db: DB || "mongodb://localhost/test",
  port: PORT || 3333,
  secret: SECRET || "top secret",
  rootPath
};
