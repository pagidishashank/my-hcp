from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL - defaults to SQLite for easy local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./interactions.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- Models ---

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hcp_name = Column(String(255), nullable=False)
    interaction_type = Column(String(100), default="Meeting")
    date = Column(String(50), default="")
    time = Column(String(50), default="")
    attendees = Column(Text, default="")
    notes = Column(Text, default="")
    samples_distributed = Column(Text, default="")
    sentiment = Column(String(50), default="Neutral")
    outcomes = Column(Text, default="")
    follow_up_actions = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


# --- Helpers ---

def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


def get_session():
    """Dependency for FastAPI to get a database session."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
