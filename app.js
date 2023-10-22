import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import dotEnv from "dotenv";
import User from "./model/users.js";
import session from "express-session";
import passport from "passport";
import bodyParser from "body-parser";
import GoogleStrategy from "passport-google-oauth20";
import findOrCreate from "mongoose-findorcreate";

dotEnv.config();

const DB_HOST = process.env.DB_HOST;
const app = express();

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json())

app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(DB_HOST, console.log("DB connected"));

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

app.get("/secrets", (req, res) => {
  User.find({ secret: { $ne: null } })
    .then((userWithSecrets) => {
      console.log(userWithSecrets);
      res.render("secrets", { userWithSecrets });
    })
    .catch((err) => console.log(err));
});

app.get("/submit", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", (req, res) => {
  const { secret } = req.body;
  User.findById(req.user.id)
    .then((user) => {
      if (user) {
        user.secret = secret;
        user
          .save()
          .then((result) => {
            res.redirect("/secrets");
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (error, user) => {
      if (error) {
        console.log(error);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.logIn(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
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
