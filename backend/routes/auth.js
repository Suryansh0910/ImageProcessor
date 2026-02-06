const express = require("express");

// Import auth functions directly
const { signup } = require("../auth/signup");
const { login } = require("../auth/login");
const { verifyToken } = require("../auth/verify");

const router = express.Router();


// ============ AUTH ROUTES ============
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", verifyToken);


module.exports = router;