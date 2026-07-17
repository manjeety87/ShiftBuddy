const express = require("express");
const { env } = require("../config/env");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    env: env.nodeEnv,
    hasGeminiKey: Boolean(env.geminiApiKey),
    model: env.geminiModel,
  });
});

module.exports = router;
