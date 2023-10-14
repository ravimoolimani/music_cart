const jwt = require("jsonwebtoken");
const productDetailCollection = require("../models/productModel");

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stars,
      color,
      type,
      company,
      details,
      inStock,
      img_url,
    } = req.body;
    const newProduct = new productDetailCollection({
      name,
      description,
      price,
      stars,
      color,
      type,
      company,
      details,
      inStock,
      img_url,
    });
    const result = await newProduct.save();
    res.send("product added sucessfully");
  } catch (err) {
    // console.log('Error in addProduct', err);
    res.status(401).send("Error in adding product", err);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const query = req.query;

    const customQuery = [];
    if ("name" in query) {
      customQuery.push({
        //Search based on name
        name: {
          $eq: query["name"],
        },
      });
    }
    if ("company" in query) {
      customQuery.push({
        company: {
          $eq: query["company"],
        },
      });
    }
    if ("type" in query) {
      customQuery.push({
        type: {
          $eq: query["type"],
        },
      });
    }
    if ("color" in query) {
      customQuery.push({
        color: {
          $eq: query["color"],
        },
      });
    }
    if ("price" in query) {
      //min-max 0-999
      const priceString = query["price"];
      const index = priceString.indexOf("-");
      const minPrice = parseInt(priceString.substring(0, index));
      const maxPrice = parseInt(priceString.substring(index + 1));
      customQuery.push({
        $and: [
          {
            price: { $gte: minPrice },
          },
          {
            price: { $lte: maxPrice },
          },
        ],
      });
    }
    let customSort = {};
    if ("sort" in query) {
      const sortBy = query["sort"];
      if (sortBy == "price1") customSort = { price: 1 };
      if (sortBy == "price-1") customSort = { price: -1 };
      if (sortBy == "A-Z") customSort = { name: 1 };
      if (sortBy == "Z-A") customSort = { name: -1 };
    }
    if (customQuery.length == 0) {
      const products = await productDetailCollection.find().sort(customSort);
      res.send(products);
    } else {
      const products = await productDetailCollection
        .find({
          $and: customQuery,
        })
        .sort(customSort);
      res.send(products);
    }
  } catch (err) {
    res.status(400).send("Error in fetching products", err);
  }
};

const getProductDetails = async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await productDetailCollection.find({ _id });
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(`Error in fetching details, ${err}`);
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductDetails,
};
