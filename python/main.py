from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


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


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")


@app.post("/analyze-behavior")
def classify(request: AssessmentRequest):
    # Just print to confirm it's working
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

    print(results)
    return {"assessmentType": request.assessmentType, "classifiedResponses": results}

# ------------------- Run Server -------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
