# Design Report – Channel-Based Q&A Tool

**Student:** Olisa Emeka Kenneth  
**Date:** April 7, 2026  

## 1. Architecture Overview
The application is built with **Next.js 16 (App Router)** and follows a client‑server architecture.  
- **Frontend:** React components with Tailwind CSS for responsive UI.  
- **Backend API:** Next.js API routes (REST) inside the `app/api/` folder.  
- **Database:** PostgreSQL (ACID compliant, supports nested replies and voting constraints).  
- **ORM:** Prisma – provides type‑safe database access and auto‑generated migrations.  
- **Authentication:** NextAuth.js with Credentials provider (email/password, bcrypt hashing).  
- **File Storage:** Local filesystem (`public/uploads/`) with MIME validation (PNG, JPEG, WebP, ≤5 MB). Images are served via a dedicated API route `/api/image/[filename]` to bypass Next.js static serving limitations.  
- **Containerisation:** Docker + docker‑compose for reproducible grading.

## 2. Database Choice & Schema
**Why PostgreSQL?**  
- Required by the assignment “SQL or NoSQL” – PostgreSQL is relational and supports the needed indexes for search and voting.  
- Handles self‑referencing replies (`parentId`) and unique constraints (`@@unique([userId, postId])`).  

**Main models:** `User`, `Channel`, `Post`, `Reply`, `Vote`.  
- `Reply.parentId` enables unlimited threaded nesting.  
- `Vote` table ensures one vote per user per target (post/reply) and allows changing/removing votes.

## 3. API Endpoints (selected)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/channels` | List channels | public |
| POST | `/api/channels` | Create channel | admin only |
| GET | `/api/posts?channelId=...` | Paginated posts in channel | public |
| POST | `/api/posts` | Create post | required |
| GET | `/api/posts/[id]` | Single post + vote score | public |
| GET | `/api/replies?postId=...` | All replies for a post (threaded) | public |
| POST | `/api/replies` | Create reply (with optional parentId) | required |
| POST | `/api/vote` | Up/down/remove vote | required |
| POST | `/api/upload` | Upload screenshot (validation + filesystem) | required |
| GET | `/api/image/[filename]` | Serve uploaded images | public |
| GET | `/api/search?type=...` | 5 search query types + pagination | public |
| DELETE | `/api/admin/users/[id]` | Delete user | admin |
| DELETE | `/api/admin/channels/[id]` | Delete channel | admin |
| DELETE | `/api/admin/posts/[id]` | Delete post | admin |
| DELETE | `/api/admin/replies/[id]` | Delete reply | admin |

## 4. Screenshot Storage & Serving
- Files are uploaded via `/api/upload` using `multipart/form-data`.  
- Allowed types: `image/png`, `image/jpeg`, `image/webp`. Max size: 5 MB.  
- Files are saved to `public/uploads/` with a unique name (`timestamp-random.extension`).  
- The upload endpoint returns a URL like `/api/image/filename.jpg`.  
- The dedicated image API route (`/api/image/[filename]`) reads the file from `public/uploads/` and streams it with the correct `Content-Type`.  
- In Docker, the folder is persisted via a volume `./public/uploads:/app/public/uploads`.

## 5. Key Packages & Why
| Package | Purpose |
|---------|---------|
| `next`, `react`, `react-dom` | Framework & UI |
| `@prisma/client` | Database ORM |
| `next-auth` | Authentication (email/password) |
| `bcryptjs` | Password hashing |
| `multer` | File upload handling (in `/api/upload`) |
| `tailwindcss` | Styling (utility classes) |
| `typescript` | Type safety |
| `docker-compose` | Multi‑container orchestration |

## 6. Security & Validation
- Passwords hashed with bcrypt (10 rounds).  
- All write routes protected by `getServerSession()`; admin routes require `role === 'ADMIN'`.  
- File uploads validate MIME type and extension; served via a controlled API route (no direct execution).  
- Input sanitisation via Prisma (prevents SQL injection) and React (escapes XSS).  
- `.env` variables are never committed; `.env.example` provided.