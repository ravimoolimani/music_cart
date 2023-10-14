const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userDetailCollection = require("../models/userModel");

const validateUser = async (req, res, next) => {
  // console.log('In validate user');
  try {
    //check for name, email, mobile and password.
    //Since we will be having onwe will valily one user date if the user is duplicate or not by email & mobile
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
      res.status(400).send("Empty Input Feilds");
    }
    //Check redundancy
    const isEmailExist = await userDetailCollection.findOne({ email });
    const ismobileExist = await userDetailCollection.findOne({ mobile });

    if (isEmailExist || ismobileExist) {
      res.status(400).send("Mobile or Email already exists!");
    } else {
      next();
    }
  } catch (err) {
    res.status(400).send(`Error in validating user, ${err}`);
  }
};

const createUser = async (req, res) => {
  try {
    let encryptedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new userDetailCollection({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: encryptedPassword,
    });
    const result = await newUser.save();
    res.send("User registered sucessfully! Head on to login page");
  } catch (err) {
    res.status(400).send(`Error in creating user, ${err}`);
  }
};

const matchCredentials = async (userDetailObj) => {
  try {
    const { email, mobile, password } = userDetailObj;
    let user = {};
    if (email) {
      user = await userDetailCollection.findOne({ email });
    } else if (mobile) {
      user = await userDetailCollection.findOne({ mobile });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Error in matchCredentials Helper", err);
    return false;
  }
};
const generateToken = async (userDetailObj) => {
  try {
    const { email, mobile } = userDetailObj;

    if (email) {
      user = await userDetailCollection.findOne({ email });
    } else {
      user = await userDetailCollection.findOne({ mobile });
    }
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );
    return token;
  } catch (err) {
    // console.log('error in generating token: ', err);
    return {
      name: "",
      _id: null,
      token: null,
    };
  }
};
const getUserDetails = async (userDetailObj) => {
  const { email, mobile } = userDetailObj;
  let user = "";
  if (email) user = await userDetailCollection.findOne({ email });
  else user = await userDetailCollection.findOne({ mobile });
  return user;
};

const loginUser = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    let detailsOK = false;
    if (!password || (!email && !mobile)) {
      res.status(400).send("Empty user inputs!");
      return;
    }
    //Check weather user is logging with email or mobile.
    if (email) {
      //logging with email
      const isEmailExist = await userDetailCollection.findOne({ email });

      if (isEmailExist) {
        detailsOK = await matchCredentials({ email, password });
      } else {
        res.status(400).send("Email does not exist!");
        return;
      }
    } else {
      //logging with mobile
      const isMobileExist = await userDetailCollection.findOne({ mobile });
      if (isMobileExist) {
        detailsOK = await matchCredentials({ mobile, password });
      } else {
        res.status(400).send("Mobile number does not exist!");
        return;
      }
    }

    if (detailsOK) {
      const token = await generateToken(req.body);
      const userdetails = await getUserDetails(req.body);
      const { name, _id } = userdetails;
      res.send({
        _id,
        name,
        token,
      });
    } else {
      res.status(400).send("Wrong Email or Password!");
      return;
    }
  } catch (err) {
    res.status(400).send(`Error in login user: ${err}`);
    return;
  }
};

const verifyToken = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) res.status(400).send("Token not received");
  else {
    try {
      token = token.slice(7);
      // console.log('checking token', token);
      const decodedToken = await jwt.verify(token, process.env.TOKEN_KEY);
      next();
    } catch (err) {
      res.status(400).send(`Error in verification, ${err}`);
    }
  }
};

const addItemToCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const productId = req.body.body.productId;
    const currUser = await userDetailCollection.findOne({ _id: userId });
    const userCart = currUser.cartItems;
    userCart.push(productId);

    await userDetailCollection.updateOne(
      { _id: userId },
      {
        $set: {
          cartItems: userCart,
        },
      }
    );

    res.send("Item added to cart");
  } catch (err) {
    res.status(400).send(`Error in adding item to cart ${err}`);
  }
};
const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const productId = req.body.productId; //userId
    const currUser = await userDetailCollection.findOne({ _id: userId });
    const userCart = currUser.cartItems;
    if (productId == "0000") {
      //remove all items from cart
      await userDetailCollection.updateOne(
        { _id: userId },
        {
          $set: {
            cartItems: [],
          },
        }
      );
    } else {
      //remove specific item from cart
      const removed = 0;
      const newCart = userCart.filter((item) => {
        if (item != productId && !removed) {
          removed = 1;
          return item;
        }
      });
      await userDetailCollection.updateOne(
        { _id: userId },
        {
          $set: {
            cartItems: newCart,
          },
        }
      );
    }
    res.send("Deletion from cart sucess");
  } catch (err) {
    res.status(400).send(`Error in removing items, ${err}`);
  }
};
const getUserCart = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await userDetailCollection.findOne({ _id });
    res.status(200).send(`${JSON.stringify(user.cartItems)}`);
  } catch (err) {
    res.status(400).send(`Error in getting cart, ${err}`);
  }
};

module.exports = {
  validateUser,
  createUser,
  loginUser,
  verifyToken,
  addItemToCart,
  getUserCart,
  removeItemFromCart,
};
