require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { join } = require("path");
const runRoute = require("./Routes/tenteruAPI");
const authRoute = require("./Routes/auth");
const session = require('express-session');
const passport = require('passport');
const mongoose = require("mongoose");
const ejs = require("ejs");
const flash = require('express-flash');
const tenteruDB = require("./Config/mongoDB");
tenteruDB();

// Set the view engine to EJS
app.set("view engine", "ejs");
//Middlewares
app.use(session({ 
    secret: process.env.Secret_ID, 
    resave: true, 
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      secure: false, // Set to true if your app is running over HTTPS
  }, 
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use("/views", express.static(join(__dirname, "views")));
app.use("/auth", authRoute);
app.use("/tenteruv1", runRoute);
app.use(passport.initialize());
app.use(passport.session());


const port = process.env.NODE_ENV === "production" ? process.env.PORT : 5500;

app.get("/signup(.html)?", (req, res) => {
  res.render('signup', { flashMessages: req.flash() });
});

app.get("/tenteruv1/home", (req, res) => {
    if (!req.isAuthenticated() && !req.session.isAuthenticated) {
        return res.redirect('/auth');
    }
    req.flash("success", "Sign in successful!");
  res.render('index', { flashMessages: req.flash() });
});

// Specific routes are defined above the catch-all handler
// Catch-all handler should be the last route
app.all("*", (req, res) => {
  res.sendFile(join(__dirname, "views/404.html"));
});

mongoose.connection.once("open", async () => {
  const chalk = (await import("chalk")).default;
  console.log(chalk.blue("Connected to Database."));
  app.listen(port, async (err) => {
    if (err) {
      throw new Error("Error connecting to the server");
    }
    console.log(chalk.bgRed(`Server is running on http://localhost:${port}`));
  });
});

mongoose.connection.on("error", async (err) => {
  const chalk = (await import("chalk")).default; // Import chalk dynamically
  console.error(chalk.red("MongoDB connection error:", err));
  process.exit(1);
});
