# E-Learning Portal

## Project Description

The E-Learning Portal is a comprehensive online learning platform focused on skill development and career advancement. It offers expert-led courses in various domains including Cybersecurity, Ethical Hacking, Computer Networking, Python programming, and more. The platform features interactive content, hands-on labs, AI-powered tutoring, and comprehensive assessment systems to provide an immersive learning experience.

### Key Features

- **Interactive Course Content**: Structured chapters with engaging multimedia content
- **AI-Powered Tutor**: 24/7 personalized guidance and explanations
- **Hands-On Labs**: Simulated environments for practical learning (e.g., WhiteHat Hacking Lab)
- **Assessment Engine**: Practice tests and progress tracking across multiple subjects
- **AI Learning Path**: Personalized learning recommendations
- **Real-World Focus**: Courses designed for practical application

### Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Custom components with Framer Motion animations
- **Icons**: Heroicons
- **Routing**: React Router
- **Backend**: Django REST Framework (referenced in elearning_backend)
- **Database**: SQLite/PostgreSQL

## Project Structure

```
app_demo/elearning_portal/
├── README.md                    # Project documentation
├── ui/                          # Frontend React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── course_summary.js
│   │   │   └── ...
│   │   ├── pages/               # Main page components
│   │   │   ├── CoursePageView.tsx    # Course content viewer
│   │   │   ├── Courses.jsx           # Course listing
│   │   │   ├── AITutor.tsx           # AI tutoring interface
│   │   │   ├── EnhancedAITutor.tsx   # Advanced AI tutor
│   │   │   ├── ExerciseEnvironment.tsx # Interactive exercises
│   │   │   ├── HackingLab.tsx         # Cybersecurity lab
│   │   │   └── ...
│   │   ├── assessments/         # Assessment and testing components
│   │   │   ├── AllResultsPage.jsx
│   │   │   ├── ResultPage.jsx
│   │   │   ├── TestOptionPageWorking.jsx
│   │   │   ├── TestOptionsPage.jsx
│   │   │   ├── TimedTestPage.jsx
│   │   │   └── ...
│   │   ├── api.js               # API utilities
│   │   └── index.js             # App entry point
│   ├── public/                  # Static assets
│   ├── package.json             # Frontend dependencies
│   └── tsconfig.json            # TypeScript configuration
├── backend/                     # Backend API (if included)
├── docs/                        # Documentation
├── tests/                       # Test files
└── requirements.txt             # Python dependencies (if applicable)
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Python 3.8+ (for backend)
- Django (for backend API)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app_demo/elearning_portal
   ```

2. **Install frontend dependencies**
   ```bash
   cd ui
   npm install
   ```

3. **Install backend dependencies** (if applicable)
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the development server**
   ```bash
   # Frontend
   npm start

   # Backend (in separate terminal)
   python manage.py runserver
   ```

### Usage

- Navigate to the courses section to browse available learning paths
- Select a course to access interactive content and exercises
- Use the AI Tutor for personalized assistance
- Access labs for hands-on practice
- Take assessments to track progress

## Course Categories

- Cybersecurity & Ethical Hacking
- Computer Networking
- Programming (Python, etc.)
- Data Science
- And more...

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
