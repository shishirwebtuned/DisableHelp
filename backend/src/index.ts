import app from "./app.js";
import { connectDB } from "./config/database.js";
import { seedAdminUser } from "./utils/seedAdmin.js";

const PORT = Number(process.env.PORT) || 5000;

connectDB().then(async () => {
  console.log("✅ Database connected");
  // await seedAdminUser();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
