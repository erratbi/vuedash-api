import {Router} from "express";
import {unlinkSync, existsSync} from "fs";
import {resolve, extname, basename} from "path";
import Order from "../models/Order";
import multer from "multer";
import parser from "../util/parser";
import authenticate from "../middleware/authenticate";

const router = Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: resolve(__dirname, "../public/uploads/images"),
  filename: (req, file, cb) => cb(null, `pic-${Date.now()}${extname(file.originalname)}`),
});

const upload = multer({
  dest: resolve(__dirname, "../public/uploads")
});

const uploadImages = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/gi;
    const ext = fileTypes.test(extname(file.originalname).toLowerCase());
    const mime = fileTypes.test(file.mimetype);

    if (mime && ext) return cb(null, true);
    else {
      req.fileValidationError = "Images only!";
      return cb(null, false, req.fileValidationError);
    }
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  const {file: {mimeType, path}} = req;
  const {file} = req;


  if (!file || mimeType === "text/csv")
    return res.status(400).json({error: true, message: "Please upload a csv file!!!"});

  const records = await parser(path);

  unlinkSync(path);

  const orders = await Promise.all(records.map(async record => {
    const existing = await Order.findOne({number: record.number});
    if (existing) {
      existing.status = record.status;
      existing.paypal = record.paypal;
      existing.paid_at = record.paid_at;
      existing.shipped_at = record.shipped_at;
      await existing.save();
      return existing;
    } else {
      const order = new Order(record);
      await order.save();
      return order;
    }
  }));


  return res.json(orders);
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

router.post("/images", uploadImages.array("images", 5), async (req, res) => {
  if (req.fileValidationError) return res.status(400).json({errors: {global: req.fileValidationError}});

  const {files} = req;
  const {number} = req.body;

  try {
    const order = await Order.findOne({number});

    if (!order) throw new Error("Invalid order number");

    const cur = 5 - order.images.length - files.length;

    if (cur < 0) {
      for (let i = 0; i < -cur; i++) {
        const img = order.images.pop();
        const name = basename(img);
        const path = resolve(__dirname, "../public/uploads/images", name);
        if (existsSync(path))
          unlinkSync(path);
      }
    }

    files.map(file => order.images.push(`/uploads/images/${file.filename}`));

    await order.save();

    return res.json({images: order.images});

  } catch (err) {
    files.forEach(file => {
      if (file) unlinkSync(file.path);
    });

    console.log(err);

    return res.status(400).json({error: {global: err}});
  }


});

export default router;
