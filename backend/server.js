import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import dataRoutes from "./routes/data.routes.js";
import chartRoutes from "./routes/chart.routes.js";
import { Server } from "socket.io";
import http from "http";
import inviteRoutes from "./routes/invite.routes.js";


// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const roomStates = new Map();

const getStateForRoom = (roomId) => {
  return roomStates.get(roomId) || {
    x: null,
    y: null,
    type: 'bar',
    name: 'Untitled Chart'
  };
};

const updateRoomState = (roomId, updates) => {
  const currentState = getStateForRoom(roomId);
  roomStates.set(roomId, { ...currentState, ...updates });
};

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // When a client joins a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room ${roomId}`);
    
    // Send current state to the new client
    const currentState = getStateForRoom(roomId);
    socket.emit("initial-state", currentState);
  });

  // When receiving chart updates
  socket.on("chart-update", ({ chartId, updates }) => {
    console.log(`Update received for room ${chartId}:`, updates);
    
    // Update the room state
    updateRoomState(chartId, updates);
    
    // Broadcast to all other clients in the room
    socket.to(chartId).emit("receive-update", updates);
  });

  // When a client leaves
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
      console.log("Created uploads directory");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Middleware Stack
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api/ping", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/invite", inviteRoutes);


// Error Handling
app.use(notFound);
app.use(errorHandler);

// Server Initialization
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Server + Socket running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

};

startServer();

// Graceful Shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});