require("dotenv").config();
const { connectDB } = require("./config/db"); // Updated import
const app = require("./app");

const PORT = process.env.BACK_PORT || 5000;

app.listen(PORT, async () => {
  try {
    await connectDB(); // Ensure DB connection before starting
    console.log(`Connected to port 443`);
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
});
