import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { resolve } from "path";
import config from "./config";


import auth from "./routes/auth";
import orders from "./routes/orders";
import upload from "./routes/upload";
import db from "./config/mongoose";


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(resolve(__dirname, "public")));
app.use(cors());


app.use("/api/auth", auth);
app.use("/api/orders", orders);
app.use("/api/upload", upload);


app.get("*", (req, res) => {
  return res.sendFile(resolve(__dirname, "index.html"));
});

app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
