const router = require("express").Router();
const controller = require("../controller/url");

router.get("/", (req, res) => {
  res.json({
    message: `Welcome to URL Shortener api!   Available routes: GET /shorturls/:shortcode, POST /shorturls,  GET /:shortcode`,
  });
});

router.post("/shorturls", controller.postShortUrls);

router.get("/shorturls/:shortcode", controller.getShortUrls);

module.exports = router;
