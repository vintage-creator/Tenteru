const express = require("express");
const router = express.Router();
const tenteruFn = require("../Controllers/tenteruFn");


router.post("/events", tenteruFn);

module.exports = router;
