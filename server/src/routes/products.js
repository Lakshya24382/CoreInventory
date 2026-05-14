const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const managerOnly = require("../middleware/managerOnly");
const {
  getAll, getOne, create, update,
  remove, getCategories, getArchived, restore
} = require("../controllers/productController");

router.get("/categories", auth, getCategories);
router.get("/archived",   auth, managerOnly, getArchived);
router.get("/",           auth, getAll);
router.get("/:id",        auth, getOne);
router.post("/",          auth, managerOnly, create);
router.put("/:id",        auth, managerOnly, update);
router.delete("/:id",     auth, managerOnly, remove);
router.put("/:id/restore", auth, managerOnly, restore);

module.exports = router;