from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    lifestyle = Column(String)  # e.g., sedentary, active
    preferred_environment = Column(String)  # home, gym
    goals = Column(String)  # health, strength, bulking, leaning
    
    equipment = relationship("UserEquipment", back_populates="user")
    workout_plans = relationship("WorkoutPlan", back_populates="user")

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    asset_url = Column(String) # path to 3d asset
    
class UserEquipment(Base):
    __tablename__ = "user_equipment"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    
    user = relationship("User", back_populates="equipment")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_data = Column(JSON) # AI generated plan stored as JSON for simplicity
    scheduled_date = Column(String) # YYYY-MM-DD
    
    user = relationship("User", back_populates="workout_plans")

class DailyJournalEntry(Base):
    __tablename__ = "daily_journals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String) # YYYY-MM-DD
    notes = Column(String)
    completed_exercises = Column(JSON) # Array of completed exercise names/sets
    
    user = relationship("User")
