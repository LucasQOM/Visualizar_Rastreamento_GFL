let express = require("express");
let router = express.Router();
let trackController = require("../controllers/trackController");
let trackAzulController = require("../controllers/trackAzulController");

router.post("/track", function (req, res) {
  trackController.track(req, res);
});

router.post("/trackAzul", function (req, res) {
  trackAzulController.track(req, res);
});

module.exports = router;
