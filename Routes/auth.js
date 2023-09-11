const express = require("express");
const router = express.Router();
const {authFn, signUpFn, signInFn} = require("../Controllers/authFn");
const oAuthFn = require("../Controllers/oAuthFn");


router.get("/", authFn);
router.post("^/signup(.html)?", signUpFn);
router.post("^/signin(.html)?", signInFn);
router.get("/google", oAuthFn.googleAuth);
router.get("/google/callback", oAuthFn.googleAuthCallback);

module.exports = router;
