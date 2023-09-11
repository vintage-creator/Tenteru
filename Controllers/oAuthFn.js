require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../Models/user_auth");

passport.use(
  new GoogleStrategy(
    {
      // Google OAuth configuration
      clientID: process.env.Client_ID,
      clientSecret: process.env.Client_Secret,
      callbackURL: "http://localhost:5500/auth/google/callback",
      scope: ["profile", "email"], // Add 'email' scope to request access to the user's email
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Access the user's email
        const email = profile.emails[0].value; // Assuming the first email in the list is the primary email
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        }

        // If user doesn't exist, create a new one and store in the database
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: email, // Store the email in your database
        });
        return done(null, user);
      } catch (error) {
        // Handle specific error case: duplicate key error
        if (error.code === 11000) {
          // This means the email is already in use
          return done(null, false, { message: "Email is already in use." });
        }
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const user = await User.findOne({ email });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Handle the Google OAuth authentication
exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Callback after Google redirects back
exports.googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/auth",
  successRedirect: "/tenteruv1/home",
});
