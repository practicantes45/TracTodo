const express = require("express");
const router = express.Router();
const { registrarEvento } = require("../controllers/trackingController");

router.post("/", registrarEvento);

module.exports = router;
