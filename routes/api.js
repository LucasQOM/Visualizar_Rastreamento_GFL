let express = require("express");
let router = express.Router();
let trackController = require("../controllers/trackController");

//get into function insite trackController
router.post("/track", function (req, res) {
  trackController.track(req, res);
});

module.exports = router;
