const express = require("express");
const app = express();
const cors = require("cors");
const User = require("./models/user");
const mongoose = require("mongoose");
const connectionString =
  "mongodb+srv://Dzanis:Nedajse123@cluster0.kdhn5.mongodb.net/neuralLegion?retryWrites=true&w=majority";
const hasher = require("./helpers/hashing");

const jwt = require("jsonwebtoken");
const authentification = require("./middlewares/auth");

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => console.log("connected to db"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
//zamjena body parseru
// app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }));

const users = [];

app.get("/", authentification, async (req, res, next) => {
  try {
    const dbUsers = await User.find().exec();
    res.status(200).json(dbUsers);
  } catch (err) {
    next(err);
  }
});

app.post("/register", async (req, res, next) => {
  try {
    const newUser = req.body;
    const newDbUser = new User({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      password: hasher.hashPassword(newUser.password),
    });

    await newDbUser.save();

    return res.status(201).json(newDbUser);
  } catch (err) {
    next(err);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userFound = await User.findOne({ email }).exec();
    console.log(userFound);
    if (userFound) {
      const checkPasswrod = hasher.comparePassword(
        password,
        userFound.password
      );
      if (checkPasswrod) {
        return jwt.sign(
          { payload: userFound },
          "MJDLOPRTMA",
          { expiresIn: 90 },
          function (err, token) {
            console.log(token);
            console.log(err);
            return res.status(200).json(token);
          }
        );
      }
    }
    return res.status(403).json("Pogrešan Email ili Password");
  } catch (err) {
    next(err);
  }
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3002, () => {
  console.log("running on port 3002");
});
