const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

const connectDB = require("./config/Db");
const userController = require("./controllers/authController");
const productController = require("./controllers/productController");

//path
//const path = require("path");
//const { fileURLToPath } = require("url");

//const _filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(_filename);
//rest object
const app = express();
dotenv.config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors({
//     // origin: "http://localhost:3000"
//     origin: "https://musicapp-2zyg.onrender.com"
// }))
app.use(cors());
//static files
//app.use(express.static(path.join(__dirname, "../client/build")));

//app.use("*", function (req, res) {
//res.sendFile(path.join(__dirname, "../client/build/index.html"));
//});

const port = process.env.PORT || 8080;
connectDB();

customCheck = (req, res, next) => {
  // console.log('I am here yo', req.body, req.query);

  next();
};

app.get("/", (req, res) => {
  res.send("Backend Working fine");
});
app.post(
  "/user/register",
  userController.validateUser,
  userController.createUser
);
app.post("/user/login", userController.loginUser);
app.patch(
  "/user/cart/add/:id",
  customCheck,
  userController.verifyToken,
  userController.addItemToCart
);
app.get(
  "/user/cart/:id",
  customCheck,
  userController.verifyToken,
  userController.getUserCart
);
app.patch(
  "/user/cart/delete/:id",
  userController.verifyToken,
  userController.removeItemFromCart
);

app.post("/products/add", productController.addProduct);
app.get("/products/view", customCheck, productController.getAllProducts);
app.get("/products/detail/:id", productController.getProductDetails);

app.listen(port, () => {
  console.log("Listening to port", port);
});
