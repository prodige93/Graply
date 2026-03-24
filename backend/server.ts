import express from "express";
import cors from "cors";
import "dotenv/config";

import checkoutRouter from "./routes/checkout";
import webhookRouter from "./routes/webhook";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));

app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookRouter,
);

app.use(express.json());

app.get("/api", (_req, res) => {
  res.send("API running");
});

app.use("/api", checkoutRouter);

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Backend Graply démarré sur http://localhost:${PORT}`);
});
