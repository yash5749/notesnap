# NoteSnap - AI-Powered Study Note Summarizer

> AI-driven exam preparation assistant that analyzes study materials, predicts important topics, and generates practice questions.

NoteSnap helps students upload their study materials (syllabus, notes, previous year questions, textbooks), analyzes them using multi-provider AI (Gemini, Ollama, OpenRouter), extracts important topics with priority scoring, generates predictive exam questions, and produces study summaries with recommendations.

---

## Features

- **Multi-Provider AI Orchestration** — Automatic failover across Google Gemini, Ollama (local), and OpenRouter (DeepSeek)
- **Document Management** — Upload PDF, TXT, or DOCX files categorized as syllabus, notes, PYQ, or textbook
- **Vector Search (RAG)** — Local embeddings via Xenova all-MiniLM-L6-v2 stored in ChromaDB for semantic retrieval
- **Subject Analysis** — Extracts 6–10 important topics with frequency, weightage, trend, and priority scoring
- **Question Prediction** — AI generates 8–12 practice questions with type, marks, difficulty, and estimated time
- **Quick Predict** — Topic-based exam question prediction using ChromaDB similarity search
- **Redis Caching** — Cached analysis results, document status, and predictions with 2–10 minute TTLs
- **Dockerized** — Multi-stage Dockerfile + docker-compose with Redis
- **Security** — JWT auth, bcrypt hashing, rate limiting, Helmet headers, input validation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18+, Docker (node:18-alpine) |
| **Backend** | Express.js 5, Mongoose 9 (MongoDB ODM) |
| **Database** | MongoDB + ChromaDB (vector store) |
| **Caching** | Redis 7 |
| **AI Providers** | Google Gemini, Ollama, OpenRouter (DeepSeek) |
| **Embeddings** | Xenova Transformers (all-MiniLM-L6-v2, 384-dim) |
| **File Processing** | PDF.js, Multer |
| **Frontend** | React 19, TypeScript, Vite 7 |
| **Routing** | React Router DOM 7 |
| **State/Data** | TanStack React Query 5 |
| **Styling** | Tailwind CSS 3, shadcn/ui (Radix primitives) |
| **Auth** | JWT (7-day expiry), bcryptjs (12 rounds) |
| **Logging** | Winston + Morgan |
| **Security** | Helmet, CORS, express-rate-limit |
| **DevOps** | Docker, docker-compose |

---

## System Architecture

```mermaid
C4Context
  title System Context Diagram - NoteSnap

  Person(student, "Student", "User who uploads study materials and gets analysis")

  System_Boundary(notesnap, "NoteSnap System") {
    System(backend, "Backend API", "Express.js REST API handling auth, documents, analysis & predictions")
    System(frontend, "Frontend SPA", "React + TypeScript UI for interacting with the platform")
  }

  System_Ext(mongodb, "MongoDB", "Primary database for users, subjects, documents and analysis records")
  System_Ext(redis, "Redis", "In-memory cache for documents, analysis results and predictions")
  System_Ext(chromadb, "ChromaDB", "Vector database for semantic search over document embeddings")
  System_Ext(gemini, "Google Gemini", "Primary AI provider for analysis and question generation")
  System_Ext(openrouter, "OpenRouter", "Fallback AI provider (DeepSeek)")
  System_Ext(ollama, "Ollama", "Local AI provider fallback")

  Rel(student, frontend, "Interacts with", "HTTPS")
  Rel(frontend, backend, "API calls via Axios", "JSON/HTTPS")
  Rel(backend, mongodb, "Reads/Writes data", "Mongoose")
  Rel(backend, redis, "Caches results", "Redis Protocol")
  Rel(backend, chromadb, "Stores/retrieves embeddings", "HTTP 8000")
  Rel(backend, gemini, "AI requests", "HTTPS")
  Rel(backend, openrouter, "AI fallback", "HTTPS")
  Rel(backend, ollama, "AI fallback", "HTTP 11434")
```

```mermaid
C4Container
  title Container Diagram

  Person(student, "Student")

  System_Boundary(be, "Backend") {
    Container(app, "Express App", "Node.js", "Routes, controllers, middleware")
    Container(ai, "AIManager", "JavaScript", "Multi-provider AI orchestrator with failover")
    Container(docproc, "DocumentProcessor", "JavaScript", "PDF/TXT/DOCX text extraction")
    Container(emb, "XenovaEmbeddings", "JavaScript", "Local embedding generation (384-dim)")
    Container(redis_svc, "RedisService", "JavaScript", "Caching layer")
    Container(chroma_svc, "ChromaService", "JavaScript", "Vector store interface")
    Container(qps, "QuestionPredictionService", "JavaScript", "AI topic/question prediction")
  }

  System_Boundary(fe, "Frontend") {
    Container(spa, "React SPA", "React 19 + Vite", "UI components, routing, state management")
  }

  Rel(student, spa, "Uses", "HTTPS")
  Rel(spa, app, "REST API calls", "JSON")
  Rel(app, ai, "Delegates AI tasks")
  Rel(app, docproc, "Extracts text")
  Rel(app, redis_svc, "Cache operations")
  Rel(app, chroma_svc, "Vector operations")
  Rel(app, qps, "Prediction tasks")
  Rel(chroma_svc, emb, "Generates embeddings")
```

---

## UML Class Diagrams

### Domain Model — MongoDB Schemas

```mermaid
classDiagram
  class User {
    +ObjectId _id
    +String email
    +String password
    +String name
    +String subscription
    +Date createdAt
    +Date updatedAt
    +comparePassword(password) bool
  }

  class Subject {
    +ObjectId _id
    +ObjectId userId
    +String name
    +String description
    +String syllabus
    +Boolean isActive
    +Date createdAt
    +Date updatedAt
  }

  class Document {
    +ObjectId _id
    +ObjectId userId
    +ObjectId subjectId
    +String filename
    +String originalName
    +String documentType
    +String mimeType
    +Number size
    +String content
    +Object metadata
    +String processingStatus
    +String filePath
    +Date uploadedAt
    +Date processedAt
    +Date createdAt
    +Date updatedAt
  }

  class Analysis {
    +ObjectId _id
    +ObjectId userId
    +ObjectId subjectId
    +ObjectId[] documentIds
    +String status
    +TopicPriority[] importantTopics
    +GeneratedQuestion[] generatedQuestions
    +Object summary
    +Object metadata
    +Date expiresAt
    +Date createdAt
    +Date updatedAt
  }

  class TopicPriority {
    +String topic
    +Number frequency
    +Number weightage
    +String priority
    +Number confidence
    +String trend
    +Number lastAppeared
    +String recommendedStudyTime
  }

  class GeneratedQuestion {
    +String id
    +String question
    +String type
    +Number marks
    +String difficulty
    +String topic
    +String learningOutcome
    +String modelUsed
    +Number estimatedTime
  }

  User "1" --> "*" Subject : owns
  User "1" --> "*" Document : owns
  User "1" --> "*" Analysis : owns
  Subject "1" --> "*" Document : contains
  Subject "1" --> "*" Analysis : has
  Analysis "*" --> "*" Document : references
  Analysis "1" --> "*" TopicPriority : includes
  Analysis "1" --> "*" GeneratedQuestion : includes
```

### AI Provider Class Hierarchy (Strategy Pattern)

```mermaid
classDiagram
  class BaseProvider {
    <<abstract>>
    +String name
    +generate(prompt) Promise~String~*
  }

  class GeminiProvider {
    +String name
    +generate(prompt) Promise~String~
  }

  class OllamaProvider {
    +String name
    +generate(prompt) Promise~String~
  }

  class OpenRouterProvider {
    +String name
    +generate(prompt) Promise~String~
  }

  class AIManager {
    -BaseProvider[] providers
    +generate(prompt) Promise~{output, provider}~
  }

  BaseProvider <|-- GeminiProvider
  BaseProvider <|-- OllamaProvider
  BaseProvider <|-- OpenRouterProvider
  AIManager o--> BaseProvider : delegates to
```

---

## System Sequence Diagrams

### Authentication Flow (Login)

```mermaid
sequenceDiagram
  actor Student
  participant SPA as React SPA
  participant API as Express API
  participant DB as MongoDB
  participant Token as JWT

  Student->>SPA: Enter email + password
  SPA->>SPA: Validate input (Zod)
  SPA->>API: POST /api/auth/login { email, password }
  API->>API: Validate input (express-validator)
  API->>DB: Find user by email (+password)
  DB-->>API: User document
  API->>API: bcrypt.compare(password, hash)
  API->>Token: jwt.sign({ userId }, secret, { expiresIn: '7d' })
  Token-->>API: JWT string
  API-->>SPA: { user, token }
  SPA->>SPA: Store token in localStorage
  SPA->>SPA: Set AuthContext with user
  SPA-->>Student: Redirect to /home
```

### Subject Analysis Flow

```mermaid
sequenceDiagram
  actor Student
  participant SPA as React SPA
  participant API as Express API
  participant DocP as DocumentProcessor
  participant Chroma as ChromaDB
  participant AI as AIManager
  participant Cache as Redis
  participant DB as MongoDB

  Student->>SPA: Select subject + upload documents
  SPA->>API: POST /documents/upload (PDF/TXT/DOCX)
  API->>DB: Save document (status: pending)
  API-->>SPA: Document created

  API->>DocP: Extract text from file
  DocP-->>API: Raw text content
  API->>DB: Update document (status: processing)
  API->>AI: AI-normalize extracted topics
  AI-->>API: Cleaned academic topics
  API->>Chroma: Generate embeddings + store
  API->>DB: Update document (status: completed)

  Student->>SPA: Request subject analysis
  SPA->>API: POST /analysis/subject { subjectId }
  API->>Cache: Check cached analysis
  alt Cache hit
    Cache-->>API: Cached analysis
  else Cache miss
    API->>Chroma: Retrieve relevant chunks
    Chroma-->>API: Similar content
    API->>AI: Generate importantTopics, questions, summary
    AI-->>API: Structured analysis
    API->>DB: Save Analysis document
    API->>Cache: Cache result (2 min TTL)
  end
  API-->>SPA: Analysis ID (status: processing)
  SPA->>API: Poll GET /analysis/:id (every 5s)
  alt Still processing
    API-->>SPA: { status: "processing" }
  else Completed
    API-->>SPA: { status: "completed", topics, questions, summary }
    SPA-->>Student: Display analysis result
  end
```

### Quick Predict Flow

```mermaid
sequenceDiagram
  actor Student
  participant SPA as React SPA
  participant API as Express API
  participant Chroma as ChromaDB
  participant AI as AIManager
  participant Cache as Redis

  Student->>SPA: Enter topic for prediction
  SPA->>API: POST /analysis/quick-predict { topic, subjectId }
  API->>Cache: Check cached prediction
  alt Cache hit
    Cache-->>API: Cached prediction
  else Cache miss
    API->>Chroma: Search similar past questions
    Chroma-->>API: Relevant questions
    API->>AI: Generate predicted questions based on topic + similar past
    AI-->>API: 3 predicted questions
    API->>Cache: Cache result (5 min TTL)
  end
  API-->>SPA: { predictedQuestions, similarPastQuestions, confidence }
  SPA-->>Student: Display predictions
```

---

## Frontend Component Hierarchy

```mermaid
graph TB
  subgraph "Pages"
    Login["/login - Login.tsx"]
    Home["/home - Home.tsx"]
    Docs["/documents - Documents.tsx"]
    SubAnalysis["/analysis/subject - SubjectAnalysis.tsx"]
    AnalysisResult["/analysis/result/:id - AnalysisResult.tsx"]
    QuickPredict["/predict/quick - QuickPredict.tsx"]
  end

  subgraph "Components"
    AppLayout["AppLayout.tsx"]
    ProtectedRoute["ProtectedRoute.tsx"]

    subgraph "Common"
      SubjectSelector["SubjectSelector.tsx"]
      Loader["Loader.tsx"]
      EmptyState["EmptyState.tsx"]
      ErrorState["ErrorState.tsx"]
    end

    subgraph "Documents"
      DocumentList["DocumentList.tsx"]
      UploadDocument["UploadDocument.tsx"]
      UploadDocumentByType["UploadDocumentByType.tsx"]
    end

    subgraph "Subjects"
      CreateSubjectDialog["CreateSubjectDialog.tsx"]
      CreateSubjectForm["CreateSubjectForm.tsx"]
    end

    subgraph "Analysis"
      AnalysisSkeleton["AnalysisSkeleton.tsx"]
      CachedBadge["CachedBadge.tsx"]
    end

    subgraph "UI (shadcn)"
      Badge["badge.tsx"]
      Button["button.tsx"]
      Card["card.tsx"]
      Dialog["dialog.tsx"]
      Input["input.tsx"]
      Select["select.tsx"]
      Textarea["textarea.tsx"]
    end
  end

  subgraph "Data Layer"
    ReactQuery["TanStack React Query"]
    Axios["Axios Client (JWT interceptor)"]
    AuthContext["AuthContext"]
  end

  Router["RouterProvider"] --> Login
  Router --> ProtectedRoute
  ProtectedRoute --> AppLayout
  AppLayout --> Home
  AppLayout --> Docs
  AppLayout --> SubAnalysis
  AppLayout --> AnalysisResult
  AppLayout --> QuickPredict

  Home --> SubjectSelector
  Home --> UploadDocumentByType
  Home --> DocumentList
  Home --> CreateSubjectDialog

  Docs --> DocumentList
  SubAnalysis --> SubjectSelector
  AnalysisResult --> AnalysisSkeleton
  AnalysisResult --> CachedBadge

  QuickPredict --> SubjectSelector
  QuickPredict --> UploadDocument

  Pages --> ReactQuery
  ReactQuery --> Axios
  ReactQuery --> AuthContext
```

---

## Deployment Architecture

```mermaid
graph TB
  subgraph "Docker Host"
    subgraph "Docker Network"
      subgraph "app Container (node:18-alpine)"
        BE["Express.js Server<br/>Port 3000"]
        FS["File System<br/>uploads/ logs/"]
      end

      subgraph "redis Container (redis:7-alpine)"
        RD["Redis Server<br/>Port 6379"]
        RDV["Redis Volume<br/>appendonly.aof"]
      end
    end

    UV["Uploads Volume"]
    LV["Logs Volume"]
    RV["Redis Data Volume"]
  end

  subgraph "External Services"
    MDB["MongoDB Atlas / Local<br/>Port 27017"]
    CDB["ChromaDB (Python)<br/>Port 8000"]
    GI["Google Gemini API"]
    OR["OpenRouter API"]
    OL["Ollama (Local)<br/>Port 11434"]
  end

  subgraph "Client"
    BR["Browser<br/>React SPA (Vite)<br/>Port 5173"]
  end

  BR -->|HTTPS :3000| BE
  BE -->|Mongoose| MDB
  BE -->|Redis Protocol| RD
  BE -->|HTTP :8000| CDB
  BE -->|HTTPS| GI
  BE -->|HTTPS| OR
  BE -->|HTTP :11434| OL
  BE -->|Read/Write| UV
  BE -->|Write| LV
  RD --> RDV
```

---

## Directory Structure

```
noteSnap/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express entry point
│   │   ├── config/
│   │   │   ├── database.js           # Mongoose connection
│   │   │   └── env.js               # Environment validation
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Subject.js
│   │   │   ├── Document.js
│   │   │   └── Analysis.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── subjects.js
│   │   │   ├── documents.js
│   │   │   └── analysis.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── subjectController.js
│   │   │   ├── documentController.js
│   │   │   └── analysisController.js
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   ├── upload.js             # Multer config
│   │   │   ├── validation.js         # express-validator rules
│   │   │   └── errorHandler.js       # Global error handler
│   │   ├── services/
│   │   │   ├── ChromaService.js      # ChromaDB interface
│   │   │   ├── DocumentProcessor.js  # PDF/TXT/DOCX extraction
│   │   │   ├── XenovaEmbeddings.js   # Local embeddings
│   │   │   ├── RedisService.js       # Caching layer
│   │   │   ├── QuestionPredictionService.js
│   │   │   ├── AnalysisService.js
│   │   │   └── OllamaService.js
│   │   ├── ai/
│   │   │   ├── AIManager.js          # Multi-provider orchestrator
│   │   │   ├── index.js             # Provider factory
│   │   │   └── providers/
│   │   │       ├── BaseProvider.js
│   │   │       ├── GeminiProvider.js
│   │   │       ├── OllamaProvider.js
│   │   │       └── OpenRouterProvider.js
│   │   └── utils/
│   │       ├── ApiError.js
│   │       ├── ApiResponse.js
│   │       ├── asyncHandler.js
│   │       ├── constants.js
│   │       ├── logger.js
│   │       └── normalizeGeneratedQuestions.js
│   ├── uploads/
│   ├── logs/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                  # Entry point
│   │   ├── app/
│   │   │   ├── App.tsx              # Root component
│   │   │   └── router.tsx           # Route definitions
│   │   ├── auth/
│   │   │   ├── auth.api.ts
│   │   │   ├── AuthContext.tsx
│   │   │   └── useAuthActions.ts
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance + JWT interceptor
│   │   │   ├── subject.api.ts
│   │   │   ├── document.api.ts
│   │   │   ├── analysis.api.ts
│   │   │   ├── quickPredict.api.ts
│   │   │   └── predict.api.ts
│   │   ├── hooks/
│   │   │   ├── useSubjects.ts
│   │   │   ├── useCreateSubject.ts
│   │   │   ├── useDocuments.ts
│   │   │   ├── useUploadDocument.ts
│   │   │   ├── useUploadDocumentByType.ts
│   │   │   ├── useDeleteDocument.ts
│   │   │   ├── useStartAnalysis.ts
│   │   │   ├── useAnalysisResult.ts
│   │   │   └── useQuickPredict.ts
│   │   ├── components/
│   │   │   ├── layout/AppLayout.tsx
│   │   │   ├── common/ (SubjectSelector, Loader, EmptyState, ErrorState)
│   │   │   ├── subjects/ (CreateSubjectDialog, CreateSubjectForm)
│   │   │   ├── documents/ (DocumentList, UploadDocument, UploadDocumentByType)
│   │   │   ├── analysis/ (AnalysisSkeleton, CachedBadge)
│   │   │   └── ui/ (shadcn primitives)
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── SubjectAnalysis.tsx
│   │   │   ├── AnalysisResult.tsx
│   │   │   └── QuickPredict.tsx
│   │   ├── types/
│   │   ├── schemas/
│   │   └── lib/
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
└── python-services/
    └── chroma/                       # ChromaDB persistent data
```

---

## API Reference

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Server health check |

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/profile` | Yes | Current user profile |

### Subjects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/subjects` | Yes | Create subject |
| GET | `/api/subjects` | Yes | List subjects |
| GET | `/api/subjects/:id` | Yes | Get subject with stats |
| PUT | `/api/subjects/:id` | Yes | Update subject |
| DELETE | `/api/subjects/:id` | Yes | Soft-delete subject |

### Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/documents` | Yes | List (query: subjectId) |
| POST | `/api/documents/upload` | Yes | Generic upload |
| POST | `/api/documents/upload/:type` | Yes | Typed upload (syllabus\|notes\|pyq\|textbook) |
| GET | `/api/documents/single/:id` | Yes | Get document |
| GET | `/api/documents/:id/status` | Yes | Processing status |
| DELETE | `/api/documents/:id` | Yes | Delete document |
| GET | `/api/documents/stats/document-stats` | Yes | Document statistics |
| GET | `/api/documents/stats/vector` | Yes | Vector store stats |

### Analysis
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/analysis/subject` | Yes | Start subject analysis |
| GET | `/api/analysis` | Yes | List analyses (query: subjectId) |
| GET | `/api/analysis/:id` | Yes | Get analysis result |
| POST | `/api/analysis/generate-questions` | Yes | Generate practice questions |
| POST | `/api/analysis/quick-predict` | Yes | Quick topic-based prediction |

---

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis 7+
- Python 3.9+ with ChromaDB (for vector search)
- (Optional) ChromaDB server running on port 8000

### Backend Setup

```bash
cd backend
cp .env.example .env   # Configure your environment variables
npm install
npm run dev            # Starts with nodemon on port 3000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev            # Starts Vite dev server on port 5173
```

### Docker Deployment

```bash
cd backend
docker-compose up -d   # Builds and starts app + redis
# App on :3000, Redis on :6379
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `PORT` | No | Server port (default: 3000) |
| `REDIS_URL` | No | Redis connection (default: redis://localhost:6379) |
| `AI_PROVIDER_ORDER` | No | Comma-separated provider priority (default: gemini,openrouter,ollama) |
| `OPENROUTER_API_KEY` | No | OpenRouter API key |
| `OLLAMA_BASE_URL` | No | Ollama server URL (default: http://localhost:11434) |
| `NODE_ENV` | No | Environment (development/production) |

---

## AI Provider Configuration

The system supports multiple AI providers with automatic failover. Configure via `AI_PROVIDER_ORDER`:

```
# Try Gemini first, fallback to OpenRouter, then Ollama
AI_PROVIDER_ORDER=gemini,openrouter,ollama
```

Each provider requires its own API credentials:
- **Gemini** — `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/)
- **OpenRouter** — `OPENROUTER_API_KEY` from [OpenRouter](https://openrouter.ai/)
- **Ollama** — Local installation with model served on `OLLAMA_BASE_URL`

---

## Testing

```bash
cd backend
npm test              # Jest test suite
```
