# AI CRM Mobile App

A full-stack intelligent customer relationship management platform that leverages OpenAI's LLM capabilities to automate lead scoring, generate personalized outreach, and provide real-time conversation insights. Built with a React Native mobile client and a Django REST API backend.

## Live Demo

- 🔗 [Live Demo](https://your-demo-url.com)
- 📱 [APK Download](https://your-apk-url.com)
- 🐙 [GitHub Repo](https://github.com/your-org/ai-crm-mobile)

## Core Features

| Feature | AI Integration |
|---------|---------------|
| **Smart Lead Scoring** | OpenAI API analyzes lead data + engagement history to auto-prioritize prospects |
| **AI Email/SMS Composer** | Generates context-aware follow-ups based on conversation history and tone analysis |
| **Voice-to-Text Notes** | Whisper API transcribes meeting recordings into structured CRM entries |
| **Predictive Churn Alerts** | GPT-4 identifies at-risk accounts from interaction patterns |
| **Intelligent Search** | Natural language queries across contacts, deals, and tasks ("Show me hot leads from last week") |

## Tech Stack

### Frontend (Mobile)
- React Native (Expo)
- TypeScript
- Redux Toolkit + RTK Query
- React Native Paper (UI)
- React Native Voice (speech-to-text)

### Backend
- Django 4.2 + Django REST Framework
- PostgreSQL (primary) + Redis (caching/sessions)
- Celery + Redis (async task queue for AI processing)
- OpenAI API (GPT-4, Whisper, Embeddings)
- JWT authentication (djangorestframework-simplejwt)

### DevOps
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Nginx reverse proxy
- Deployed on AWS EC2 / Railway

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (React Native)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │
│  │  Leads  │ │ Deals   │ │ Tasks   │ │  AI Composer    │   │
│  │  Screen │ │ Screen  │ │ Screen  │ │  Search Screen  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────────┬────────┘   │
│       └─────────────┴──────────┴────────────────┘            │
│                         Redux Store                          │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS / WebSocket
┌─────────────────────────────┴───────────────────────────────┐
│                         Nginx Proxy                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    Django REST API                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │
│  │  Auth   │ │  Leads  │ │  AI     │ │  WebSocket      │   │
│  │  API    │ │  API    │ │  API    │ │  Notifications  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────────┬────────┘   │
│       └─────────────┴──────────┴────────────────┘            │
│                    Celery Task Queue                         │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
        │ PostgreSQL │   │  Redis    │   │  OpenAI   │
        │  + pgvector│   │           │   │   API     │
        └────────────┘   └───────────┘   └───────────┘
```

## Key Implementation Highlights

### RAG Pipeline
Customer data is embedded and stored in PostgreSQL (with pgvector support), enabling semantic search across historical interactions. Embeddings are generated using OpenAI's `text-embedding-3-small` model.

### Real-time Sync
WebSocket layer (`/ws/notifications/`) delivers instant AI-suggested replies during client calls and push notifications for churn alerts, task assignments, and deal updates.

### Offline-First
The mobile app uses Redux with persistence planning for SQLite on-device storage with background sync when connectivity returns.

### Rate Limiting
Token bucket algorithm implemented in Python for OpenAI API cost control, configurable via `OPENAI_RATE_LIMIT_RPM` and `OPENAI_RATE_LIMIT_TPM` environment variables.

### Multi-tenant
Row-level security through organization-scoped queries. All models include `organization` foreign key with automatic filtering based on authenticated user's organization.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for mobile development)
- Python 3.11+ (for backend development)
- OpenAI API key

### Backend Setup

```bash
# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Start services with Docker
docker-compose up -d db redis

# Run migrations
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

### Full Docker Deployment

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT token pair
- `POST /api/token/refresh/` - Refresh access token

### Leads
- `GET /api/leads/` - List leads (with filtering, search, ordering)
- `POST /api/leads/` - Create lead
- `GET /api/leads/<id>/` - Retrieve lead
- `PATCH /api/leads/<id>/` - Update lead
- `GET /api/leads/<id>/activities/` - List lead activities

### AI Services
- `POST /api/ai/leads/<id>/score/` - Trigger async lead scoring
- `POST /api/ai/leads/<id>/compose/` - Generate follow-up message
- `POST /api/ai/leads/<id>/churn/` - Predict churn risk
- `POST /api/ai/transcribe/` - Transcribe audio (Whisper)
- `POST /api/ai/search/` - Natural language search
- `POST /api/ai/suggest/` - Real-time reply suggestion

### Contacts, Deals, Tasks
- Standard CRUD endpoints at `/api/contacts/`, `/api/deals/`, `/api/tasks/`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Debug mode | `True` |
| `DB_NAME` | PostgreSQL database name | `ai_crm` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | GPT model | `gpt-4` |
| `OPENAI_RATE_LIMIT_RPM` | Rate limit (requests/min) | `60` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:19006` |

## Testing

### Backend
```bash
cd backend
pytest
# or
python manage.py test
```

### Mobile
```bash
cd mobile
npm run typecheck
npm run lint
```

## Project Structure

```
.
├── backend/
│   ├── crm/                    # Django project config
│   ├── apps/
│   │   ├── accounts/           # Users, organizations, teams
│   │   ├── leads/              # Lead management
│   │   ├── contacts/           # Contact management
│   │   ├── deals/              # Deal pipeline
│   │   ├── tasks/              # Task management
│   │   ├── ai_services/        # OpenAI integration & tasks
│   │   └── notifications/      # WebSocket notifications
│   ├── requirements.txt
│   └── Dockerfile
├── mobile/
│   ├── src/
│   │   ├── screens/            # App screens
│   │   ├── store/              # Redux slices
│   │   ├── services/           # API client
│   │   ├── navigation/         # Navigation config
│   │   └── types/              # TypeScript types
│   ├── App.tsx
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- OpenAI for GPT-4, Whisper, and Embeddings APIs
- Django REST Framework team
- Expo and React Native communities
