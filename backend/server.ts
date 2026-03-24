import express = require("express");
import cors = require("cors");
import "dotenv/config";

import checkoutRouter from "./routes/checkout";
import webhookRouter from "./routes/webhook";

const app = express();

app.use(cors());

// IMPORTANT : le webhook Stripe a besoin du body brut — doit être déclaré AVANT express.json()
app.use("/api/checkout", express.raw({ type: "application/json" }), webhookRouter);

// Ensuite seulement le JSON pour tout le reste
app.use(express.json());

// Routes de test 
app.get("/api", (req, res) => {
    res.send("API running");
});

// Routes Stripe 
app.use("/api", checkoutRouter);

app.listen(3300, () => {
    console.log("Backend Graply démarré sur http://localhost:3300");
})