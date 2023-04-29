const { Router } = require("express");
const { login } = require("../controllers/auth.controller");
const router = Router();
router.route("/login").post(login);

module.exports = router;
