# Interview Admin

Interview Admin is a full-stack web application that streamlines the technical interview process. It allows administrators to create sessions, invite candidates, auto-generate questions using AI, evaluate answers intelligently, and track results in a structured dashboard.

---

## Tech Stack

### Frontend
- **React.js** (with functional components and hooks)
- **React Router** for navigation
- **Axios** for HTTP requests
- **Firebase Authentication**

### Backend
- **FastAPI** for building REST APIs
- **Firebase Admin SDK** for user management and Firestore integration
- **Gemini LLM** (Google Generative AI) for question generation and answer evaluation
- **Firestore** for storing session and user data

---

## Features

-  **Firebase Auth** (Email/Password and Google Sign-In)
- **Admin Panel** to create interview sessions and invite candidates
-**AI Question Generation** using Gemini LLM
- **Smart Answer Evaluation** that mimics real interviewer logic
- **Result Dashboard** with candidate scores and feedback
- **Token refresh logic** with secure frontend state handling

---

## Project Structure

### Frontend (`/frontend`)
```
src/
│
├── components/        # Reusable UI components (Login, Dashboard, etc.)
├── pages/             # Route-level pages
├── firebase.js        # Firebase config and export
├── App.jsx            # Main app routing logic
└── index.js           # App entry point
```

### Backend (`/backend`)
```
backend/
│
├── main.py            # FastAPI app entry point
├── auth.py            # Firebase auth and user validation
├── routes/
│   ├── interview.py   # Interview creation, listing, deletion
│   ├── ai_generate.py # AI-based question generation
│   ├── upload_pdf.py  # PDF upload and parsing
│   ├── invite.py      # Candidate invite logic
│   └── results.py     # Results and evaluation endpoints
├── schemas.py         # Pydantic schemas
├── serviceAccountKey.json # Firebase admin credentials (git-ignored)
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Firebase Project with Firestore enabled
- Gemini API Key (Google Generative AI)

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
# Runs the app at http://localhost:3000
```

---

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# Runs FastAPI server at http://localhost:8000
```

---

## Environment Variables

### Backend (`backend/.env`)
```
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
REACT_APP_API_URL=http://localhost:8000
```

---

##  Token Persistence
On login, the Firebase token is stored and passed via headers for all secure routes. On refresh, a new token is generated and fetched from Firebase to maintain session continuity securely.

---

## Usage

1. **Login:** Use your admin credentials (Firebase Auth).
2. **Create Interview:** Generate questions with AI or upload a PDF.
3. **Invite Candidates:** Add emails to send unique interview links.
4. **Candidate Takes Test:** Candidate answers questions via their link.
5. **Live Evaluation:** After submission, answers are evaluated by AI and results are shown.
6. **View Results:** Admin can view scores, feedback, and statistics.

---

## How It Works

- **Authentication:** Uses Firebase Auth for secure login and session management.
- **Interview Creation:** Admins can use AI to generate questions or upload custom questions via PDF.
- **Inviting Candidates:** Each candidate gets a unique link; their status is tracked.
- **Answer Submission:** Candidates submit answers, which are evaluated by Gemini LLM.
- **Results:** Both candidate and admin can view detailed feedback and scores.

---

## Future Enhancements
- Multiple question types (MCQs, Coding, System Design)
- Timed assessments
- Role-based access control (RBAC)
- Export results as PDF or Excel
- Real-time collaboration for interviewers

---

## Smart Evaluation Logic
Candidate answers are scored based on:
- Keyword relevance (e.g., using Gemini LLM)
- Completeness of explanation
- Real-world applicability

---

## Security Notes
- **Do NOT commit your `serviceAccountKey.json` or `.env` files to public repositories.**
- All sensitive keys and credentials should be kept private.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE)

---

## Contact
For questions or support, open an issue or contact the maintainer. 