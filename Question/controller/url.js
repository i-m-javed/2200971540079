const shortid = require("shortid");
const dayjs = require("dayjs");
const validator = require("validator");

const urlMap = {};

exports.postShortUrls = (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url || !validator.isURL(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const duration = parseInt(validity);
  if (isNaN(duration) || duration <= 0) {
    return res.status(400).json({ error: "Validity must be a positive integer" });
  }

  const now = new Date().toISOString();
  const expiry = dayjs(now).add(duration, "minute").toISOString();

  const finalCode = shortcode || shortid.generate();

  if (urlMap[finalCode]) {
    return res.status(409).json({ error: "Shortcode already exists. Choose another." });
  }

  urlMap[finalCode] = {
    originalUrl: url,
    createdAt: now,
    expiry,
    clicks: []
  };

  res.status(201).json({
    shortLink: `${process.env.BASE_URL || "http://localhost:3000"}/${finalCode}`,
    expiry
  });
};

exports.getShortUrls = (req, res) => {
  const { shortcode } = req.params;
  const data = urlMap[shortcode];

  if (!data) {
    return res.status(404).json({ error: "Shortcode not found" });
  }

  const now = new Date();
  const expiryDate = new Date(data.expiry);
  if (now > expiryDate) {
    return res.status(410).json({ error: "Short URL has expired" });
  }

  data.clicks.push({
    timestamp: now.toISOString(),
    referrer: req.get("Referrer") || "Direct",
    geo: "India" 
  });

  res.status(200).json({
    shortcode,
    originalUrl: data.originalUrl,
    createdAt: data.createdAt,
    expiry: data.expiry,
    totalClicks: data.clicks.length,
    clicks: data.clicks
  });
};
