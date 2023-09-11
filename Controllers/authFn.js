const { join } = require("path");
const UserReg = require("../Models/user_auth");
const joi = require("joi");
const bcrypt = require("bcrypt");
const flash = require('express-flash');

const authFn = (req, res) => {
  res.render('signIn', { flashMessages: req.flash() });
};

const signUpFn = async (req, res) => {
  const { email, password, confirm_password } = req.body;
  const userschema = joi
    .object({
      email: joi.string().email({
        minDomainSegments: 2,
      }),
      password: joi
        .string()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=])[a-zA-Z0-9!@#$%^&*()_\-+=]{8,}$/
        ),
      confirm_password: joi.ref("password"),
    })
    .with("password", "confirm_password");

  try {
    //validate form fields
    const value = await userschema.validateAsync({
      email: email,
      password: password,
      confirm_password: confirm_password,
    });
    const userExist = await UserReg.findOne({ email }).exec();
    //check if user exists
    if (userExist) {
      req.flash("error", "User already exist!");
      return res.redirect("/signup"); // Redirect to signup page
    }
    const hashPassword = bcrypt.hashSync(password, 10);
    await UserReg.create({
      email,
      password: hashPassword,
    });
    req.flash("success", "Registration successful, please sign in.");
    return res.redirect("/auth"); // Redirect to signin page
  } catch (err) {
    req.flash("error", "Password must have at least 1 capital letter, 1 small letter, 1 special character, and be at least 8 characters long");
    return res.redirect("/signup"); // Redirect to signup page
  }
};

const signInFn = async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    res
      .status(400)
      .json({ status: "error", message: "Please input your credentials" });
    return;
  }

  try {
    //find the user with the email
    const user = await UserReg.findOne({ email }).exec();
    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/auth"); // Redirect to login page
    }
    const isPasswordMatched = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatched) {
      req.flash("error", "Email or password is not correct.");
      return res.redirect("/auth"); // Redirect to login page
    }
    // Set a session variable to indicate authentication
    req.session.isAuthenticated = true;
    req.session.userEmail = user.email;
    res.redirect("/tenteruv1/home");
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: err.message,
    });
  }
};

module.exports = { authFn, signInFn, signUpFn };
