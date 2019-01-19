import request from "request-promise";
import cheerio from "cheerio";
import {Router} from "express";
import Order from "../models/Order";
import {basename, resolve} from "path";
import {existsSync, unlinkSync} from "fs";
import authenticate from "../middleware/authenticate";
import {downloadImage} from "../util";


const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const orders = await Order.find();
  return res.json(orders);
});

router.get("/search", async (req, res) => {
  const {page, q, type} = req.query;

  const orders = await Order.find({
    $or: [
      {'product.title': new RegExp(q, "i")},
      {'buyer.id': new RegExp(q, "i")},
      {'buyer.fullName': new RegExp(q, "i")},
    ]
  });
  return res.json(orders);
});

router.post("/:number/tracking", async (req, res) => {
  const {number} = req.params;
  const {tracking} = req.body;

  const order = await Order.findOne({number});
  if (!order) return res.status(404).json({error: true});

  order.tracking = tracking;

  if (order.tracking.trim().length) {
    order.shipped_at = Date.now();
    order.status = "shipped";
  } else {
    order.status = "paid";
    order.shipped_at = null;
  }

  await order.save();

  return res.json({error: false, order});
});

router.post("/:number/confirm", async (req, res) => {
  const {number} = req.params;

  const order = await Order.findOne({number});
  if (!order) return res.status(404).json({error: true});

  order.status = "confirmed";
  await order.save();

  return res.json({error: false, order});
});

router.post("/:number/images/delete", async (req, res) => {
  const {number} = req.params;
  const {image} = req.body;

  const order = await Order.findOne({number});
  if (!order) return res.status(404).json({error: true});

  order.images = order.images.filter(img => {
    const target = basename(image);
    if (!img.includes(target)) return img;
    else {
      const path = resolve(__dirname, "../public/uploads/images", target);
      if (existsSync(path))
        unlinkSync(path);
    }
  });

  await order.save();

  return res.json({error: false, order});
});

router.post("/image/:number", async (req, res) => {
  const {number} = req.params;

  const order = await Order.findOne({number});
  if (!order) return res.status(404).json({error: true});

  const uri = `https://www.ebay.com/itm/${order.product.number}`;

  try {
    const image = await request({
      uri, transform: body => {
        const $ = cheerio.load(body);
        const img = $("#icImg");
        if (!img.length) return null;

        const src = img.attr("src");
        return src.replace(/https:\/\/i.ebayimg.com\/images\/g\/(.+?)\/.+/gi, "https://i.ebayimg.com/images/g/$1/s-l1000.jpg");
      }
    });
    if (!image) return res.status(404).json({error: true});

    order.poster = await downloadImage(image, resolve(__dirname, "../public/uploads/images"));

    order.save();

    return res.json({error: false, image: order.poster});

  } catch (e) {
    return res.status(404).json({error: true});
  }
});

export default router;
