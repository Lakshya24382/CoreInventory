const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth",        require("./routes/auth"));
app.use("/api/products",    require("./routes/products"));
app.use("/api/dashboard",   require("./routes/dashboard"));
app.use("/api/receipts",    require("./routes/receipts"));
app.use("/api/deliveries",  require("./routes/deliveries"));
app.use("/api/transfers",   require("./routes/transfers"));
app.use("/api/adjustments", require("./routes/adjustments"));

app.get("/", (req, res) => res.json({ message: "CoreInventory API is running" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));