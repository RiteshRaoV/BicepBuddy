# 💪 BicepBuddy

BicepBuddy is a full-stack, AI-powered personal fitness planner designed to help you build, track, and strictly adhere to your workout routines. It features a stunning, claymorphic user interface and a robust Python backend.

## 🌟 Key Features

*   **Intelligent Onboarding**: Set your fitness goals, available equipment, and preferred environments to tailor your experience.
*   **Multi-Week Progressive Planner**: Build custom 7-day splits across multiple weeks. Includes support for duplicating weeks, logging strength sets, and tracking cardio (duration/distance).
*   **Adherence Calendar**: Visually track your consistency. Green for completed workouts, Red for missed, and Blue for upcoming scheduled workouts.
*   **Daily Workout Journal**: Log your progress seamlessly. Check off individual sets or complete cardio activities in a sleek journal view.
*   **Dynamic UI**: Fully custom CSS variables powering a beautiful Light and Dark Mode toggle, relying on Neumorphic/Claymorphic design principles.

## 🏗️ Architecture (Monorepo)

This repository is structured as a monorepo containing both the frontend and backend services, orchestrated entirely via Docker.

*   **Frontend**: React + Vite (Custom CSS for styling)
*   **Backend**: FastAPI + SQLAlchemy (Python)
*   **Database**: PostgreSQL
*   **Infrastructure**: Docker Compose

## 🚀 Getting Started

### Prerequisites
*   [Docker](https://docs.docker.com/get-docker/) installed and running.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/BicepBuddy.git
    cd BicepBuddy
    ```

2.  **Start the services**:
    ```bash
    docker compose up --build -d
    ```

3.  **Access the application**:
    *   **Frontend**: `http://localhost:5173`
    *   **Backend API Docs**: `http://localhost:8000/docs`

### Development

The `docker-compose.yml` is configured with volume mounts, meaning any changes you make to the `frontend/` or `backend/` directories will hot-reload inside the containers automatically!

*(Note: The frontend is configured to proxy API requests to the backend container, so you will never run into CORS issues during local testing or tunneling!)*

## 📄 License
MIT License
