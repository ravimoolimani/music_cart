const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stars: Number, //out of 5,
  color: String,
  type: String,
  company: String,
  details: [],
  inStock: Boolean,
  img_url: [],
});
module.exports = new mongoose.model("productDetails", productSchema);
