# Channel-Based Programming Q&A Tool

A full-stack Q&A platform where users can ask questions, reply in threaded 
conversations, vote, attach screenshots, and search.

## Tech Stack
- Next.js 16 · TypeScript · Tailwind CSS
- Prisma ORM · PostgreSQL
- NextAuth.js · Docker

## Quick Start
```bash
git clone https://github.com/OlisaKenneth/qna-tool.git
cd qna-tool/qna\(Main\ Project\)
cp .env.example .env
docker-compose up --build
```
Open http://localhost:3000

**Admin login:** admin@example.com / admin123

## Features
- Channels, threaded replies, voting
- Image uploads (PNG/JPEG/WebP ≤5MB)
- 5 search types with pagination
- Admin dashboard
- Email/password authentication
