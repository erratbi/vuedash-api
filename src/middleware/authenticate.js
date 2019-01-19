import jwt from "jsonwebtoken";
import config from "../config";


export default (req, res, next) => {
  const {authorization} = req.headers;

  if (!authorization) return res.status(401).json({errors: {global: "Not authorized"}});

  let token = authorization.replace("Bearer ", "");

  if (!token.length) return res.status(401).json({errors: {global: "Not authorized"}});

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return res.status(401).json({errors: {global: "Invalid Token"}});
    else {
      req.user = decoded;
      return next();
    }
  });
}
