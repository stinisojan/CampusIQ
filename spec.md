Software Design Document — CampusIQ

RAG-Based College Information Chatbot
Version 1.0 | Document Type: Software Design Document (SDD)

1. Introduction
1.1 Purpose

This Software Design Document (SDD) describes the architecture, components, data model, interfaces, and deployment strategy for CampusIQ, a Retrieval-Augmented Generation (RAG) based college information chatbot. It is intended to guide implementation and serve as a reference for reviewers and future maintainers.

1.2 Scope

The system allows students to ask natural-language questions about their college (admissions, departments, courses, fees, exams, academic calendar, hostel, library, clubs, placements, scholarships, policies, and events) and receive answers grounded in documents uploaded by administrators. The system covers authentication, document ingestion, vector-based retrieval, LLM-based answer generation with source citation, conversational chat history, and an admin document-management panel.

1.3 Definitions & Acronyms
Term	Definition
RAG	Retrieval-Augmented Generation — combining a retrieval step over a knowledge base with an LLM generation step.
Chunk	A segment of a source document, sized to fit within embedding/LLM context limits.
Embedding	A numeric vector representation of text used for semantic similarity search.
Vector DB	A database optimized for storing and querying high-dimensional embedding vectors.
JWT	JSON Web Token, used for stateless session authentication.
LLM	Large Language Model, used to generate the final natural-language answer.
1.4 Out of Scope (v1)
Voice input/output, multilingual support, OCR for scanned PDFs (listed as bonus features, not core v1)
Native mobile applications
Payment or transactional features
2. System Overview

CampusIQ is a three-tier web application: a Next.js frontend, an Express/Node.js backend exposing REST and WebSocket APIs, and two data stores — MongoDB for structured application data and a vector database for semantic search over document chunks. An external LLM/embedding provider (OpenAI or Google Generative AI) supplies embeddings and chat completions.

2.1 High-Level Architecture
                 STUDENT / ADMIN
                        |
                        v
            +-----------------------+
            |   Next.js Frontend    |   (Vercel)
            |  Chat UI / Admin UI    |
            +-----------+-----------+
                        | REST + Socket.IO
                        v
            +-----------------------+
            |  Express Backend API   |   (Render)
            |  Auth / RAG / Ingest    |
            +-----+-------------+----+
                  |             |
         MongoDB  |             |  Vector DB
         (Atlas)  v             v  (Pinecone/Chroma)
     +----------------+   +------------------+
     | Users, Docs,   |   | Chunk Embeddings |
     | Chats, Msgs    |   | + Metadata       |
     +----------------+   +------------------+
                  |
                  v
        +-----------------------+
        | Embedding + LLM API    |
        | (OpenAI / Gemini)      |
        +-----------------------+
2.2 Design Goals
Answers must be grounded strictly in retrieved context — never fabricated ("hallucination-resistant" by design)
Every answer is traceable to a source document, page/section, and similarity score
Providers (embedding model, LLM, vector DB) are swappable behind common interfaces
Ingestion status and chat responses are visible in real time via WebSockets
Secrets are never hardcoded or exposed to the client; role-based access separates admin and student capabilities
3. Technology Stack
Layer	Technology
Frontend	Next.js (App Router), React, Tailwind CSS, Zustand, Axios, react-markdown, Socket.IO client, lucide-react
Backend	Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO, multer, helmet, morgan, compression, express-validator, bcryptjs
AI / RAG	LangChain orchestration; OpenAI or Google Generative AI SDK (pluggable) for embeddings and chat completion
Vector Store	Pinecone / Chroma / Weaviate (configurable via env), behind a common interface
Document Parsing	pdf-parse, mammoth (DOCX), recursive character/token-based chunker
File Storage	Local disk (dev) or S3-compatible bucket (prod) for raw uploads
Deployment	Vercel (frontend), Render (backend), MongoDB Atlas (database), GitHub (source control)
4. Functional Requirements
4.1 Core (Must-Have)
Chat interface for students to ask college-related questions
User authentication (registration, login, JWT sessions, role separation)
Document upload (PDF/DOCX) by administrators
Document processing: text extraction and chunking
Embedding generation for each chunk
Vector database storage and semantic similarity search
Full RAG pipeline: retrieve context, then generate answer via LLM
AI-generated answers grounded in the uploaded knowledge base only
Source/reference display for every answer
Clear "unknown / not found" handling when no relevant context exists
Chat history and multi-turn conversation context
Admin document management: upload, update, delete
Persistent database/storage integration
Working frontend–backend integration and a deployed, working application
4.2 Bonus / Stretch Features
Multiple document collections / department-wise knowledge bases
Admin analytics dashboard, document version management
Source highlighting, confidence/relevance score display
Multilingual chatbot, voice input/output, conversation export
Suggested questions, answer feedback (👍/👎)
Automatic document summarization, OCR for scanned documents
Hybrid keyword + semantic search, document re-ranking
Role-based access (beyond admin/student), AI-generated FAQs, streaming responses
5. System Architecture
5.1 Backend Layering
Layer	Responsibility
Routes	HTTP routing, request validation (express-validator), auth/error middleware
Controllers	Request parsing and response shaping only — no direct DB or business logic
Services	Business logic: auth, document lifecycle, embedding calls, retrieval, chunk management, chat lifecycle
RAG Layer	Query agent, retriever agent, context assembler, answer agent — pure logic, no direct HTTP/DB access
Vector Store Layer	Wraps the chosen vector DB SDK behind a common baseVectorStore.js interface
Ingestion Layer	Text extraction and chunking utilities
Config Layer	Centralizes env vars, MongoDB connection, vector DB connection, Socket.IO setup
5.2 Component Diagram
  ChatWindow ---> conversationService ---> RAG pipeline
                                              |
                             +----------------+----------------+
                             |                |                |
                        queryAgent    retrieverAgent   contextAssembler
                             |                |                |
                             +--------> answerAgent <---------+
                                              |
                                        LLM Provider

  DocumentUploader ---> documentService ---> ingestion pipeline
                                              |
                             textExtractor -> chunker -> embeddingService
                                                              |
                                                     vectorStore.upsert()
6. RAG Pipeline Design
6.1 Document Ingestion Pipeline
Text Extraction — extract raw text from PDF/DOCX (pdf-parse / mammoth); flag unreadable/scanned files for OCR (bonus)
Chunking — split text into overlapping chunks (configurable size/overlap) using a recursive character or token-based splitter; preserve page/section metadata
Embedding Generation — generate a vector embedding per chunk via the configured provider (e.g., OpenAI text-embedding-3-small or Google text-embedding-004)
Vector Storage — upsert each embedding with metadata (documentId, filename, page/section, department tag) into the vector database
Status Tracking — persist processingStatus on the Document record: UPLOADED → CHUNKING → EMBEDDING → INDEXED | FAILED, streamed live to the admin UI
6.2 Query Pipeline
Stage	Responsibility
Query Agent	Normalizes/rewrites the user question, resolving references using prior chat turns
Retriever Agent	Embeds the query and performs top-k similarity search against the vector DB, optionally filtered by department/collection
Context Assembler	Deduplicates and ranks retrieved chunks, trims to fit the LLM context window, attaches source metadata
Answer Agent	Sends context + question to the LLM with a system prompt restricting answers to the provided context; returns an explicit "not found" response below a similarity-score threshold
Response Formatter	Attaches a sources[] array (document name, snippet, page/section, relevance score) to the final answer

Every response also reports embeddingProvider, llmProvider, and retrieval similarity scores for debugging and the optional confidence-score feature.

6.3 Unknown-Question Handling

If no retrieved chunk exceeds the configured similarity threshold, the Answer Agent must return an explicit "I don't have information on that in the current knowledge base" message and must not attach fabricated sources. This behavior is enforced at the prompt level and validated by a threshold check prior to generation.

7. Data Design
7.1 Collections / Schemas

Users

Field	Type	Notes
name	String	Required
email	String	Unique, required
password	String	bcrypt hash, cost 12, select: false
role	Enum	admin | student
lastLogin	Date	

Documents

Field	Type	Notes
filename	String	
uploadedBy	ObjectId (User)	
department / collection tag	String	Optional, for bonus filtering
storagePath	String	Local path or bucket key
processingStatus	Enum	UPLOADED | CHUNKING | EMBEDDING | INDEXED | FAILED
chunkCount	Number	
createdAt	Date	

Chunks (optional, if not fully delegated to vector DB)

Field	Type	Notes
documentId	ObjectId (Document)	
chunkIndex	Number	
text	String	
page / section	String	
vectorId	String	Reference to the vector DB entry

Conversations

Field	Type	Notes
owner	ObjectId (User)	
title	String	
createdAt	Date	
lastMessageAt	Date	

Messages

Field	Type	Notes
conversationId	ObjectId (Conversation)	
role	Enum	user | assistant
content	String	
sources[]	Array	documentId, snippet, score
feedback	Enum	up | down | none (bonus)

QueryLogs (bonus analytics)

Field	Type	Notes
question	String	
matchedDocuments	Array	
wasAnswered	Boolean	
timestamp	Date	
8. API Design
8.1 Health & Auth
Method	Endpoint	Description
GET	/api/health	System heartbeat
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Authenticate and issue JWT
GET	/api/auth/me	Fetch current user profile
8.2 Documents (Admin only)
Method	Endpoint	Description
GET	/api/documents	List documents with processing status
POST	/api/documents	Upload a document (multipart)
POST	/api/documents/:id/reindex	Re-run the ingestion pipeline
DELETE	/api/documents/:id	Delete document, chunks, and vectors
8.3 Chat
Method	Endpoint	Description
GET	/api/conversations	List the user's conversations
POST	/api/conversations	Start a new conversation
GET	/api/conversations/:id	Fetch messages for a conversation
POST	/api/conversations/:id/messages	Send a message; triggers RAG pipeline, streams via Socket.IO
POST	/api/messages/:id/feedback	Submit 👍/👎 feedback (bonus)
8.4 Analytics (Bonus)
Method	Endpoint	Description
GET	/api/admin/analytics/overview	Query volume, top questions, feedback ratio
GET	/api/admin/analytics/unanswered	Log of unanswered / low-confidence queries
8.5 Real-Time Events (Socket.IO)
message:token — streamed token chunks for an in-progress answer
message:complete — final answer with sources[] payload
document:status — ingestion status updates (UPLOADED, CHUNKING, EMBEDDING, INDEXED, FAILED)
9. Frontend Design
Route	Purpose
/	Landing page, example questions, CTA to login/register
/login	Email/password login form
/register	Registration form
/chat	Main chat interface: message list, streaming bubbles, source citations, suggested questions, history sidebar
/admin/documents	Upload dropzone, document table, delete/reindex actions
/admin/dashboard	Usage analytics (bonus)
/settings	Profile, role details, theme settings
9.1 UI/UX Requirements
Clean chat-console aesthetic built with Tailwind CSS, fully responsive
Loading and streaming states for AI responses (typing indicator, token-by-token render)
Expandable source citations beneath each answer bubble
Document dropzone with upload progress and live status
Searchable conversation sidebar
10. Security Design
Passwords hashed with bcrypt at cost factor 12; never stored or logged in plaintext
JWT-based sessions signed/verified with a server-side JWT_SECRET; tokens never exposed to third parties
CORS restricted to the deployed FRONTEND_URL for both REST and Socket.IO
Rate limiting on authentication and chat endpoints
Request body validation on every endpoint via express-validator
Document upload/delete restricted to the admin role; enforced server-side, not just hidden in the UI
Raw storage paths and vector DB internals never exposed to non-admin clients
Security headers via helmet; secrets read only from process.env, never hardcoded or committed
11. Non-Functional Requirements
Category	Requirement
Reliability	Unknown questions must fail safely (explicit "not found") rather than hallucinate
Performance	Answer streaming should begin within a few seconds of query submission under normal load
Scalability	Vector store and embedding provider are abstracted so they can be swapped or scaled independently
Maintainability	Thin controllers, pure RAG agents, and a common vector-store interface keep providers swappable
Auditability	Every answer retains its source chunks and similarity scores for traceability
Availability	Ingestion failures are tracked per-document (FAILED status) rather than silently dropped
12. Folder Structure
12.1 Frontend (client/)
client/src/
  components/  ChatWindow, MessageBubble, SourceCitation,
               DocumentUploader, ProtectedRoute
  app/         page.js, login/, register/, chat/,
               admin/documents/, settings/
  store/       authStore.js, chatStore.js
  services/    api.js, socket.js
12.2 Backend (server/)
server/src/
  config/       env.js, db.js, vectorStore.js, socket.js
  routes/       authRoutes.js, documentRoutes.js, conversationRoutes.js
  controllers/  authController.js, documentController.js,
                conversationController.js
  services/     authService.js, documentService.js,
                embeddingService.js, conversationService.js
  rag/          queryAgent.js, retrieverAgent.js,
                contextAssembler.js, answerAgent.js
  ingestion/    textExtractor.js, chunker.js
  vectorstore/  baseVectorStore.js, pineconeStore.js
  models/       User.js, Document.js, Conversation.js, Message.js
13. Development Phases
Phase	Deliverable
1	Project setup: Next.js, Express, MongoDB, JWT auth, Zustand auth store
2	Document upload + ingestion pipeline (extraction, chunking, embedding, vector storage, status tracking)
3	Core RAG query pipeline (retriever, context assembler, answer agent, unknown-question handling)
4	Chat UI with conversation history and persistence
5	Socket.IO streaming for token-by-token answers and live ingestion status
6	Admin document management panel + bonus features as time allows
14. Deployment Architecture

The application follows the standard vibe-coded deployment pattern: source code on GitHub, frontend on Vercel, backend on Render, database on MongoDB Atlas, plus a separate managed vector database service.

                 USER
                   |
                   v
          +-----------------+
          |     VERCEL      |
          |    Frontend      |
          | Next.js (App Rtr)|
          +--------+--------+
                   | REST + Socket.IO
                   v
          +-----------------+
          |     RENDER      |
          |     Backend      |
          |  Node / Express  |
          +----+--------+---+
               |        |
     MongoDB   |        |  Vector DB
     queries   v        v  upsert/query
     +----------------+  +------------------+
     | MongoDB Atlas  |  | Pinecone/Chroma/  |
     | Users,Docs,    |  | Weaviate           |
     | Chats,Messages |  | Chunk Embeddings   |
     +----------------+  +------------------+
14.1 Environment Variables

Backend (Render)

MONGODB_URI=...
JWT_SECRET=...
OPENAI_API_KEY=...        # or GEMINI_API_KEY
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=...
FRONTEND_URL=https://your-project.vercel.app
PORT=process.env.PORT (Render-assigned)

Frontend (Vercel)

NEXT_PUBLIC_API_URL=https://your-project.onrender.com
14.2 Deployment-Specific Considerations
Render's disk storage is ephemeral on free/starter tiers — uploaded PDFs may be lost on redeploy unless routed to S3-compatible storage
The vector database (Pinecone/Chroma/Weaviate) is a fourth infrastructure component not covered by the generic Mongo/Supabase deployment guide, and must be provisioned separately with an index matching the embedding model's dimensionality
CORS must be configured on both the REST layer (Express cors middleware) and the Socket.IO server, both pointed at FRONTEND_URL
WebSocket support on Render should be verified in production, since local dev can mask connection-upgrade issues behind a reverse proxy
Secrets (.env) are excluded from GitHub via .gitignore and set directly in Render/Vercel environment variable dashboards
14.3 Deployment Checklist
Verify all pages, CRUD flows, auth, and API responses work locally
Push source to GitHub with .env excluded via .gitignore
Provision MongoDB Atlas (or Supabase) and configure network access
Provision the vector database and create an index matching the embedding dimension
Deploy backend to Render; set all environment variables; verify the start script and PORT binding
Test deployed backend endpoints directly (health check, auth, document, chat routes)
Configure CORS on the backend to allow the Vercel frontend origin
Deploy frontend to Vercel with NEXT_PUBLIC_API_URL pointing at the Render backend
Run full production testing: auth flows, chat streaming, document upload, deletion, error handling, mobile responsiveness, browser console checks
Enable continuous deployment from the main GitHub branch to both Vercel and Render
15. Implementation Guidelines
Build phase by phase, following the folder structure strictly
Keep controllers thin; all business logic lives in services
Keep RAG agents pure — no direct HTTP or database calls, only vector store and LLM calls
Wrap the vector database behind baseVectorStore.js so providers remain swappable
Treat every secret as process.env; never hardcode credentials
Never fabricate sources for unanswered questions — enforce the similarity threshold before generation
Report files created or changed at the end of every development phase
16. Final Expected Outcome

A student logs in, asks a question in plain English, and receives an answer grounded in real college documents with visible sources — or a clear "not found" response when the knowledge base doesn't cover the topic. Admins keep the knowledge base current by uploading and removing documents, with full visibility into ingestion status. The result is a genuinely retrieval-grounded assistant, deployed end-to-end across Vercel, Render, MongoDB Atlas, and a managed vector database.