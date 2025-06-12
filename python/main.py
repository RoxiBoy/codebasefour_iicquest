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

# Initialize the classifier for behavioral analysis
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

@app.post('/technicalanalysis')
def analyze_technical_response_with_gemini(response: str) -> dict:
    """Analyze a technical response using Gemini API"""
    
    labels = ["analytical", "methodical", "intuitive", "systematic"]
    
    prompt = f"""
    Analyze this technical response and classify it into one of these categories: {', '.join(labels)}.
    
    Response to analyze: "{response}"
    
    Categories explained:
    - "analytical": Shows logical breakdown and detailed reasoning
    - "methodical": Follows systematic step-by-step approach
    - "intuitive": Shows pattern recognition or gut instinct
    - "systematic": Shows organized, structured thinking
    
    Based on the response, determine which category best fits and provide a confidence score between 0 and 1.
    
    Return your analysis in this exact JSON format:
    {{
        "top_label": "category_name",
        "score": 0.XX
    }}
    
    Only return the JSON, no additional text.
    """
    
    try:
        response_text = model.generate_content(prompt)
        
        # Try to parse the JSON response
        try:
            result = json.loads(response_text.text.strip())
            # Ensure score is within valid range
            if result.get("score", 0) > 1:
                result["score"] = result["score"] / 100
            return result
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract information
            text = response_text.text.strip()
            
            # Find the most mentioned label
            best_label = "systematic"  # default for technical
            best_score = 0.5
            
            for label in labels:
                if label.lower() in text.lower():
                    best_label = label
                    break
            
            # Try to extract score
            import re
            score_match = re.search(r'(\d+\.?\d*)', text)
            if score_match:
                try:
                    best_score = float(score_match.group(1))
                    if best_score > 1:
                        best_score = best_score / 100
                except:
                    best_score = 0.5
            
            return {
                "top_label": best_label,
                "score": best_score
            }
            
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        # Fallback: return systematic with moderate confidence
        return {
            "top_label": "systematic",
            "score": 0.3
        }

@app.post("/analyze-behavior")
def classify(request: AssessmentRequest):
    """Analyze behavioral patterns from assessment responses"""
    print("Received Assessment:", request)
    
    results = []
    
    if request.assessmentType == 'technical':
        # Use Gemini for technical analysis
        for response in request.responses:
            gemini_result = analyze_technical_response_with_gemini(response)
            results.append({
                "response": response,
                "top_label": gemini_result["top_label"],
                "score": gemini_result["score"]
            })
    else:
        # Use zero-shot classification for behavioral analysis
        labels = ["collaborative", "independent", "adaptive", "rigid"]
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
