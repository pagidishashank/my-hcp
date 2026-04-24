from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database as db
from agent import get_agent

app = FastAPI(title="HCP Interaction API")
agent = get_agent()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---

class InteractionCreate(BaseModel):
    hcp_name: str
    interaction_type: str = "Meeting"
    date: str = ""
    time: str = ""
    attendees: str = ""
    notes: str = ""
    samples_distributed: str = ""
    sentiment: str = "Neutral"
    outcomes: str = ""
    follow_up_actions: str = ""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    agent_reply: str
    hcp_name: Optional[str] = None
    interaction_type: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None


# --- Startup ---

@app.on_event("startup")
def on_startup():
    db.create_tables()


# --- Endpoints ---

@app.get("/")
def root():
    return {"message": "HCP Interaction API is running"}


@app.post("/interactions")
def create_interaction(interaction: InteractionCreate, session: Session = Depends(db.get_session)):
    record = db.Interaction(
        hcp_name=interaction.hcp_name,
        interaction_type=interaction.interaction_type,
        date=interaction.date,
        time=interaction.time,
        attendees=interaction.attendees,
        notes=interaction.notes,
        samples_distributed=interaction.samples_distributed,
        sentiment=interaction.sentiment,
        outcomes=interaction.outcomes,
        follow_up_actions=interaction.follow_up_actions,
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return {"id": record.id, "message": "Interaction saved successfully"}


@app.get("/interactions")
def list_interactions(session: Session = Depends(db.get_session)):
    interactions = session.query(db.Interaction).order_by(db.Interaction.id.desc()).all()
    return [
        {
            "id": i.id,
            "hcp_name": i.hcp_name,
            "interaction_type": i.interaction_type,
            "date": i.date,
            "time": i.time,
            "notes": i.notes,
            "sentiment": i.sentiment,
            "outcomes": i.outcomes,
            "created_at": str(i.created_at),
        }
        for i in interactions
    ]


@app.post("/chat", response_model=ChatResponse)
def chat_with_agent(request: ChatRequest):
    try:
        user_message = request.messages[-1].content
        result = agent.invoke({
            "messages": [("human", user_message)],
            "extracted_data": {},
        })

        # Get the AI reply
        last_message = result["messages"][-1]
        agent_reply = last_message.content if hasattr(last_message, "content") else str(last_message)

        # Get extracted data
        extracted = result.get("extracted_data", {})

        return ChatResponse(
            agent_reply=agent_reply,
            hcp_name=extracted.get("hcp_name"),
            interaction_type=extracted.get("interaction_type"),
            notes=extracted.get("notes"),
            sentiment=extracted.get("sentiment"),
            outcomes=extracted.get("outcomes"),
            follow_up_actions=extracted.get("follow_up_actions"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
