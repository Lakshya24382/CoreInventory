const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getAll, getOne, create, validate } = require("../controllers/receiptController");

router.get("/", auth, getAll);
router.get("/:id", auth, getOne);
router.post("/", auth, create);
router.post("/:id/validate", auth, validate);

module.exports = router;