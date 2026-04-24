import os
from typing import TypedDict, List, Annotated, Optional, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import json

load_dotenv()


# --- State Definition ---

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]
    extracted_data: Dict[str, Any]


# --- System Prompt ---

SYSTEM_PROMPT = """You are an AI assistant for logging Healthcare Professional (HCP) interactions.
Your job is to help the user record details about their meetings with doctors and healthcare professionals.

When the user describes an interaction, you should:
1. Acknowledge what they told you
2. Extract key details like:
   - HCP Name (the doctor/professional's name)
   - Interaction Type (Meeting, Phone Call, Email, Conference, Virtual Meeting)
   - Topics Discussed / Notes
   - Sentiment (Positive, Neutral, Negative)
   - Outcomes (key results or agreements)
   - Follow-up Actions (next steps)
3. Ask clarifying questions if important details are missing
4. Summarize what you've captured

Always be professional, concise, and helpful. If the user's message doesn't relate to logging an interaction, 
respond helpfully but guide them back to interaction logging.

IMPORTANT: At the end of your response, include a JSON block with extracted data in this exact format:
```json
{"hcp_name": "...", "interaction_type": "...", "notes": "...", "sentiment": "...", "outcomes": "...", "follow_up_actions": "..."}
```
Only include fields you could extract. Use null for fields you couldn't determine."""


# --- LLM Setup ---

def get_llm():
    api_key = os.getenv("GROQ_API_KEY", "")
    return ChatGroq(
        model="gemma2-9b-it",
        api_key=api_key,
        temperature=0.3,
        max_tokens=1024,
    )


# --- Graph Nodes ---

def chat_node(state: AgentState) -> AgentState:
    """Process the user message and generate a response with data extraction."""
    llm = get_llm()
    
    messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
    response = llm.invoke(messages)
    
    # Try to parse extracted data from the response
    extracted_data = state.get("extracted_data", {})
    try:
        content = response.content
        if "```json" in content:
            json_str = content.split("```json")[1].split("```")[0].strip()
            parsed = json.loads(json_str)
            # Only update fields that are not null
            for key, value in parsed.items():
                if value is not None and value != "null" and value != "":
                    extracted_data[key] = value
            # Clean the response by removing the JSON block
            clean_content = content.split("```json")[0].strip()
            response = AIMessage(content=clean_content)
    except (json.JSONDecodeError, IndexError):
        pass
    
    return {
        "messages": [response],
        "extracted_data": extracted_data,
    }


# --- Build the Graph ---

def get_agent():
    """Create and return the LangGraph agent."""
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("chat", chat_node)
    
    # Set entry point
    workflow.set_entry_point("chat")
    
    # Add edge to END
    workflow.add_edge("chat", END)
    
    # Compile
    return workflow.compile()
