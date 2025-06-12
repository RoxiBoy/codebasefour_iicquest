from fastapi import FastAPI
import google.generativeai as genai
from pydantic import BaseModel
from typing import List, Optional
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
from typing import Union
import json

# Configure your API key here
GEMINI_API_KEY = "AIzaSyA8_Nef6LmelvUbXDaQ9U5N0mvQdNi-SEI"
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

class TimingData(BaseModel):
    totalTime: int
    averageTimePerQuestion: float
    timeDistribution: List[int]

class BehavioralMetrics(BaseModel):
    hesitationPatterns: List[int]
    changesMade: int
    confidenceLevels: List[int]

class AssessmentRequest(BaseModel):
    assessmentType: str
    responses: List[str]
    timingData: TimingData
    behavioralMetrics: BehavioralMetrics

class InteractionData(BaseModel):
    clickCount: int
    keystrokes: int
    pauseDuration: int
    confidenceLevel: int

class ResponseItem(BaseModel):
    interactionData: InteractionData
    questionId: str
    userResponse: str
    timeTaken: int
    startTime: Union[datetime, str]
    endTime: Union[datetime, str]
    _id: str

class SkillAssessment(BaseModel):
    skillName: str
    score: float
    confidence: Optional[float] = None
    _id: str

class AssessmentPayload(BaseModel):
    responses: List[ResponseItem]
    skillsAssessed: List[SkillAssessment]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the classifier
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

@app.post("/analyze-behavior")
def classify(request: AssessmentRequest):
    """Analyze behavioral patterns from assessment responses"""
    print("Received Assessment:", request)

    labels = ["collaborative", "independent", "adaptive", "rigid"]
    results = []
    
    for response in request.responses:
        result = classifier(response, labels)
        results.append({
            "response": response,
            "top_label": result["labels"][0],
            "score": result["scores"][0]
        })

    print("Classification Results:", results)
    return {"assessmentType": request.assessmentType, "classifiedResponses": results}

@app.post("/improvement")
def improve(request: AssessmentPayload):
    """Generate improvement suggestions based on skill assessment results"""
    try:
        # Prepare skill-only data for prompt
        skill_data = [
            {"skillName": s.skillName, "score": s.score}
            for s in request.skillsAssessed
        ]

        prompt = f"""
I am submitting a user's skill assessment result from a behavioral analysis. The assessment evaluates key personal and professional traits such as adaptability, independence, collaboration, and rigidity. Each trait is scored between 0 and 1, where a higher score indicates a stronger tendency toward that trait.

Based on this data, provide actionable and personalized improvement tips for the user. The goal is to help them grow in areas where their scores are relatively low, while reinforcing strengths. For each skill, if the score is below 0.6, include improvement suggestions. If the score is 0.6 or above, briefly affirm the strength and give advice for continued growth.

**Instructions**:
- If the score is **< 0.6**, provide **2–3 actionable improvement tips**.
- If the score is **≥ 0.6**, affirm the strength and offer **1–2 suggestions** for continued growth.
- Return output in **Markdown format**:

### Skill: [Skill Name]
**Score:** [score]  
_Summary_: [brief interpretation]  
**Tips to Improve:**  
- Tip 1  
- Tip 2  
- Tip 3

Here is the data:
```json
{json.dumps(skill_data, indent=2)}
```
"""

        # Generate content using Gemini
        response = model.generate_content(prompt)

        return {"markdown": response.text}
    
    except Exception as e:
        print(f"Error generating improvement suggestions: {e}")
        return {"error": str(e), "markdown": "Unable to generate improvement suggestions at this time."}

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"message": "Behavioral Assessment API is running"}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
