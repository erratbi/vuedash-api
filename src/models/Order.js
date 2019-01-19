import { model, Schema } from "mongoose";

const productSchema = new Schema({
  number: String,
  title: String,
});

const buyerSchema = new Schema({
  id: String,
  fullName: String,
  phone: String,
  email: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  zip: String,
  country: String,
});

const schema = new Schema({
  number: { type: Number, unique: true, index: true },
  paypal: { type: String, unique: true, sparse: true, index: true },
  quantity: Number,
  price: Number,
  size: String,
  images: [String],
  poster: String,
  tracking: { type: String, trim: true },
  status: {type: String, enum: ["paid", "sold", "shipped", "confirmed", "canceled"], default: "sold"},
  sold_at: Date,
  paid_at: Date,
  shipped_at: Date,
  supplier: {
    type: Schema.Types.ObjectId,
    ref: "supplier",
  },
  buyer: buyerSchema,
  product: productSchema,
});

module.exports = model("Order", schema);
