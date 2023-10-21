import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import dotEnv from "dotenv";
import User from "./model/users.js";
// import md5 from "md5";
import bcrypt from "bcrypt";

dotEnv.config();
const saltRounds = 10;

const DB_HOST = process.env.DB_HOST;
const app = express();

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// app.use(express.json())

mongoose.connect(DB_HOST, console.log("DB connected"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  bcrypt
    .hash(password, saltRounds)
    .then((hash) => {
      const newUser = new User({
        email,
        password: hash,
      });

      newUser
        .save()
        .then((result) => {
          if (result) {
            res.render("secrets");
          }
        })
        .catch((err) => console.log("saving", err));
    })
    .catch((err) => console.log("hashing", err));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        // You should add password validation here
        // if (md5(password) === user.password) {
        // if (password === user.password) {
        bcrypt.compare(password, user.password).then((result) => {
          if (result) {
            res.status(200).render("secrets");
          } else { 
            res.status(401).send("Invalid password"); // Password doesn't match
          }
        });
      } else {
        res.status(401).send("User not found"); // User with the given email not found
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error"); // Handle other errors
    });
});

app.put("/register", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((result) => {
      if (result) res.send(result);
    })
    .catch((err) => res.send(err));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
