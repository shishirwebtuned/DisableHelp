import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import { connectDB } from "./config/database.js";
// import { seedAdminUser } from "./utils/seedAdmin.js";
import messageRoutes, { initMessageRoutes } from "./routes/message.routes.js";
import { initChatRoutes } from "./routes/chat.routes.js";
import { initApplicationRoutes } from "./routes/application.routes.js";

const PORT = Number(process.env.PORT) || 5000;

connectDB().then(async () => {
  console.log("✅ Database connected");
  // await seedAdminUser();
  // app.listen(PORT, "0.0.0.0", () => {
  //   console.log(`Server running on http://0.0.0.0:${PORT}`);
  // });

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinUserRoom", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined personal room user:${userId}`);
    });

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });

    socket.on("leaveChat", (chatId) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat ${chatId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  app.use("/api/v1/en/message", initMessageRoutes(io));
  app.use("/api/v1/en/chat", initChatRoutes(io));
  app.use("/api/v1/en/application", initApplicationRoutes(io));

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
