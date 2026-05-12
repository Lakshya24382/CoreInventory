const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getAll, create, validate } = require("../controllers/adjustmentController");

router.get("/", auth, getAll);
router.post("/", auth, create);
router.post("/:id/validate", auth, validate);

module.exports = router;