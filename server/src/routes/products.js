const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAll, getOne, create, update, remove, getCategories
} = require("../controllers/productController");

router.get("/categories", auth, getCategories);
router.get("/", auth, getAll);
router.get("/:id", auth, getOne);
router.post("/", auth, create);
router.put("/:id", auth, update);
router.delete("/:id", auth, remove);

module.exports = router;