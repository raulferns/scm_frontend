const express = require("express");
const router = express.Router();
const { queryAI } = require("../controllers/aiController");

router.post("/chat", queryAI);

module.exports = router;