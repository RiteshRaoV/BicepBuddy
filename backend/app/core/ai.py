import os
import json
import httpx
from typing import Dict, Any

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def generate_workout_plan(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls the Groq API to generate a workout plan based on user data.
    If no API key is provided, returns a realistic mock plan.
    """
    prompt = f"""
    You are a professional fitness trainer. Generate a single workout routine for a user.
    Return ONLY valid JSON.
    
    User details:
    - Name: {user_data.get('username')}
    - Lifestyle: {user_data.get('lifestyle')}
    - Environment: {user_data.get('preferred_environment')}
    - Goal: {user_data.get('goals')}
    
    JSON Schema to follow:
    {{
        "workout_name": "String",
        "estimated_duration_minutes": "Number",
        "exercises": [
            {{
                "name": "String",
                "sets": "Number",
                "reps": "String (e.g., '10-12')",
                "rest_seconds": "Number"
            }}
        ]
    }}
    """
    
    if not GROQ_API_KEY:
        # Fallback to mock data if no API key is provided during dev
        print("WARNING: GROQ_API_KEY not set, using mock AI data.")
        return {
            "workout_name": f"{user_data.get('goals', 'Custom')} Full Body Routine",
            "estimated_duration_minutes": 45,
            "exercises": [
                {
                    "name": "Bodyweight Squats" if user_data.get('preferred_environment') == 'home' else "Barbell Squats",
                    "sets": 3,
                    "reps": "12-15",
                    "rest_seconds": 60
                },
                {
                    "name": "Push-ups",
                    "sets": 3,
                    "reps": "8-12",
                    "rest_seconds": 60
                }
            ]
        }
        
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama3-8b-8192",
                "messages": [
                    {"role": "system", "content": "You are a JSON-only API. You must strictly output valid JSON and nothing else."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3
            },
            timeout=15.0
        )
        
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            print("Failed to parse JSON from AI response:", content)
            return {"error": "Invalid JSON from AI"}
