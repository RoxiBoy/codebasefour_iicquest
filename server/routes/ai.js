import express from "express"
import Assessment from "../models/Assessment.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/analyze-assessment", authenticateToken, async (req, res) => {
  try {
    const { assessmentId } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const aiInputData = {
      assessmentType: assessment.type,
      responses: assessment.responses.map((r) => r.userResponse),
      timingData: assessment.aiAnalysisData.timingAnalysis,
      behavioralMetrics: assessment.aiAnalysisData.behavioralMetrics,
    };

    const response = await fetch("http://localhost:8000/analyze-behavior", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiInputData),
    });

    const aiResponse = await response.json();
    console.log("AI Response:", aiResponse);

    // Calculate average score per label
    const labelSums = {};
    const labelCounts = {};

    for (const item of aiResponse.classifiedResponses) {
      const label = item.top_label;
      const score = item.score;

      if (!labelSums[label]) {
        labelSums[label] = 0;
        labelCounts[label] = 0;
      }
      labelSums[label] += score;
      labelCounts[label] += 1;
    }

    const averages = {};
    for (const label in labelSums) {
      averages[label] = labelSums[label] / labelCounts[label];
    }

    // Store averages in skillsAssessed
    assessment.skillsAssessed = Object.entries(averages).map(([skillName, score]) => ({
      skillName,
      score,
      confidence: null, // no confidence in your AI response, set null or omit
    }));

    assessment.isProcessed = true;
    assessment.status = "completed";

    await assessment.save();

    res.json({
      message: "Assessment analyzed successfully",
      results: assessment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.post("/improvement", authenticateToken, async (req, res) => {
  try {
    const promptData = req.body
    const response = await fetch("http://localhost:8000/improvement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promptData),
    });

  const result = await response.json()

  console.log(result)
  res.json(result)
  }catch(err) {
    console.log(err)
    res.status(500).json({ message: "Server error", error: err.message})
  }

})

export default router

