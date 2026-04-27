const { askGemini } = require("../services/geminiService");
const { getFallbackResponse } = require("../data/aiFallback");

exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    let answer;

    try {
      
      answer = await askGemini(question);
    } catch (err) {
      console.error("Gemini failed, using fallback");
      answer = getFallbackResponse(question);
    }

    res.json({ answer });

  } catch (err) {
    // 🔥 Guaranteed fallback
    const fallback = getFallbackResponse(req.body.question || "");
    res.json({ answer: fallback });
  }
};