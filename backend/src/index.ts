import app from "./app.js";
import { connectDB } from "./config/database.js";
import { seedAdminUser } from "./utils/seedAdmin.js";

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  console.log("✅ Database connected");
  // await seedAdminUser();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
