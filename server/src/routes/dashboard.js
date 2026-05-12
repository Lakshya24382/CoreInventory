const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getKPIs } = require("../controllers/dashboardController");

router.get("/kpis", auth, getKPIs);

module.exports = router;