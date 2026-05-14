const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const managerOnly = require("../middleware/managerOnly");
const { getAll, create, validate, remove } = require("../controllers/transferController");

router.get("/",              auth,            getAll);
router.get("/:id",           auth,            getOne);
router.post("/",             auth,            create);
router.post("/:id/validate", auth, managerOnly, validate);
router.delete("/:id", auth, managerOnly, remove);

module.exports = router;