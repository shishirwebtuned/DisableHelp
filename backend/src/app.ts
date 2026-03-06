import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profile.routes.js";
// import serviceRoutes from "./routes/service.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import jobRoutes from "./routes/job.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import applicationRoutes from "./routes/application.routes.js";
import agreementRoutes from "./routes/agreement.routes.js";
import sessionRoutes from "./routes/session.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const baseApi = "/api/v1/en";

app.use(`${baseApi}/users`, userRoutes);
app.use(`${baseApi}/profile`, profileRoutes);
// app.use(`${baseApi}/service`, serviceRoutes);
app.use(`${baseApi}/admin`, adminRoutes);
app.use(`${baseApi}/job`, jobRoutes);
app.use(`${baseApi}/application`, applicationRoutes);
app.use(`${baseApi}/agreement`, agreementRoutes);
app.use(`${baseApi}/session`, sessionRoutes);

// Error handler
app.use(errorHandler);

export default app;
