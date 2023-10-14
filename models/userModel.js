const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  password: String,
  cartItems: [],
  address: {
    house_number: Number,
    city: String,
    state: String,
    pinCode: Number,
  },
});
module.exports = new mongoose.model("musicartUser", userSchema);
