const app = require("./app");
const { env } = require("./config/env");

const port = env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend running on port ${port}`);
  console.log(`Local: http://localhost:${port}`);
  console.log(`Network: http://YOUR_LAPTOP_IP:${port}`);
});
