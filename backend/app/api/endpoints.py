from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_db
from app.models.domain import User, Equipment
from pydantic import BaseModel
from app.core.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter()

class RegisterData(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(data: RegisterData, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed = get_password_hash(data.password)
    new_user = User(username=data.username, hashed_password=hashed)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}

class OnboardingData(BaseModel):
    lifestyle: str
    preferred_environment: str
    goals: str
    equipment_names: list[str]

@router.post("/onboarding")
def submit_onboarding(data: OnboardingData, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.lifestyle = data.lifestyle
    current_user.preferred_environment = data.preferred_environment
    current_user.goals = data.goals
    
    db.commit()
    db.refresh(current_user)
    
    return {"status": "success", "user_id": current_user.id}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "lifestyle": current_user.lifestyle,
        "goals": current_user.goals,
        "preferred_environment": current_user.preferred_environment,
        "points": current_user.points or 0,
        "achievements": current_user.achievements or []
    }

@router.get("/equipment")
def get_equipment(db: Session = Depends(get_db)):
    # Mock data for now
    return [
        {"id": 1, "name": "Dumbbells", "asset_url": "/assets/dumbbells.png"},
        {"id": 2, "name": "Kettlebells", "asset_url": "/assets/kettlebell.png"},
        {"id": 3, "name": "Yoga Mat", "asset_url": "/assets/yogamat.png"},
    ]

from app.core.ai import generate_workout_plan
from app.models.domain import WorkoutPlan

@router.post("/users/{user_id}/generate_plan")
async def create_workout_plan(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_data = {
        "username": user.username,
        "lifestyle": user.lifestyle,
        "preferred_environment": user.preferred_environment,
        "goals": user.goals
    }
    
    plan_json = await generate_workout_plan(user_data)
    
    plan = WorkoutPlan(
        user_id=user.id,
        plan_data=plan_json,
        scheduled_date=None # Or today
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    return plan.plan_data

class BulkPlanData(BaseModel):
    user_id: int
    start_date: str # YYYY-MM-DD
    end_date: str # YYYY-MM-DD
    weeks: list[dict] # Array of weekly routines

from datetime import datetime, timedelta

@router.post("/plans/bulk")
def create_bulk_plans(data: BulkPlanData, db: Session = Depends(get_db)):
    start = datetime.strptime(data.start_date, "%Y-%m-%d")
    end = datetime.strptime(data.end_date, "%Y-%m-%d")
    
    delta = end - start
    
    plans_created = 0
    for i in range(delta.days + 1):
        current_date = start + timedelta(days=i)
        day_of_week = str(current_date.weekday()) # 0 is Monday
        
        week_idx = min(i // 7, len(data.weeks) - 1)
        weekly_routine = data.weeks[week_idx]
        
        day_plan = weekly_routine.get(day_of_week)
        
        # If there are exercises scheduled for this day, create a plan
        if day_plan and day_plan.get("exercises") and len(day_plan["exercises"]) > 0:
            day_str = current_date.strftime("%Y-%m-%d")
            plan = WorkoutPlan(
                user_id=data.user_id,
                plan_data=day_plan,
                scheduled_date=day_str
            )
            db.add(plan)
            plans_created += 1
        
    db.commit()
    return {"status": "success", "plans_created": plans_created}

@router.get("/users/{user_id}/plans")
def get_user_plans(user_id: int, db: Session = Depends(get_db)):
    plans = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).order_by(WorkoutPlan.scheduled_date).all()
    return plans

class UpdatePlanData(BaseModel):
    plan_data: dict

from sqlalchemy.orm.attributes import flag_modified

@router.put("/plans/{plan_id}")
def update_plan(plan_id: int, data: UpdatePlanData, db: Session = Depends(get_db)):
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan.plan_data = data.plan_data
    flag_modified(plan, "plan_data")
    db.commit()
    return {"status": "success", "message": "Plan updated"}

from app.models.domain import DailyJournalEntry

class JournalData(BaseModel):
    user_id: int
    date: str
    notes: str
    completed_exercises: list

@router.post("/journal")
def save_journal(data: JournalData, db: Session = Depends(get_db)):
    # Ensure user exists to avoid foreign key violation
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        user = User(id=data.user_id, username=f"User_{data.user_id}")
        db.add(user)
        db.commit()

    existing = db.query(DailyJournalEntry).filter_by(user_id=data.user_id, date=data.date).first()
    if existing:
        existing.notes = data.notes
        existing.completed_exercises = data.completed_exercises
        db.commit()
        return {"status": "success", "message": "Journal updated!"}

    entry = DailyJournalEntry(
        user_id=data.user_id,
        date=data.date,
        notes=data.notes,
        completed_exercises=data.completed_exercises
    )
    db.add(entry)
    
    # Award gamification points
    user.points = (user.points or 0) + 10
    
    # Evaluate achievements
    achievements = user.achievements or []
    # Count existing journals plus this new one
    journal_count = db.query(DailyJournalEntry).filter(DailyJournalEntry.user_id == data.user_id).count() + 1
    
    if journal_count >= 1 and '🏆 First Blood' not in achievements:
        achievements.append('🏆 First Blood')
    if journal_count >= 5 and '🔥 Consistent Lifter' not in achievements:
        achievements.append('🔥 Consistent Lifter')
    if journal_count >= 10 and '🥈 10 Workouts Milestone' not in achievements:
        achievements.append('🥈 10 Workouts Milestone')
    if journal_count >= 25 and '🥇 25 Workouts Mastery' not in achievements:
        achievements.append('🥇 25 Workouts Mastery')
    
    if user.points >= 50 and '⭐ 50 Points Club' not in achievements:
        achievements.append('⭐ 50 Points Club')
    if user.points >= 100 and '💯 100 Points Club' not in achievements:
        achievements.append('💯 100 Points Club')
    if user.points >= 500 and '🌟 500 Points Legend' not in achievements:
        achievements.append('🌟 500 Points Legend')
        
    user.achievements = achievements
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(user, "achievements")
    
    db.commit()
    return {"status": "success", "message": "Workout saved! +10 Points"}

@router.get("/users/{user_id}/journals")
def get_user_journals(user_id: int, db: Session = Depends(get_db)):
    journals = db.query(DailyJournalEntry).filter(DailyJournalEntry.user_id == user_id).all()
    return journals
