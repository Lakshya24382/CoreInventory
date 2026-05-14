const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const managerOnly = require("../middleware/managerOnly");
const { getAll, getOne, create, validate, remove } = require("../controllers/transferController");
router.get("/:id", auth, getOne);
router.get("/",              auth,             getAll);
router.post("/",             auth,             create);
router.post("/:id/validate", auth, managerOnly, validate);
router.delete("/:id",        auth, managerOnly, remove);

module.exports = router;