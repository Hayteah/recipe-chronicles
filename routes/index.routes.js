const express = require("express");
const { isLoggedIn } = require("../middleware/route-guard");
const router = express.Router();

/* GET home page */
router.get("/", isLoggedIn, (req, res, next) => {
  res.render("index");
});

module.exports = router;
