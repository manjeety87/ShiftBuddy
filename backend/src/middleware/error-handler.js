function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Uploaded image is too large" });
  }

  return res.status(500).json({
    error: err.message || "Internal server error",
  });
}

module.exports = errorHandler;
