# Channel-Based Programming Q&A Tool

A full‑stack Q&A platform where users can ask questions, reply in threaded conversations, vote, attach screenshots, and search. Built with Next.js, Prisma, PostgreSQL, and Docker.

## Features
- **Channels** – browse and create (admin only)
- **Posts** – ask questions, attach images (PNG/JPEG/WebP, ≤5 MB)
- **Threaded replies** – unlimited nesting depth
- **Voting** – up/down on posts and replies (one vote per user, change/remove allowed)
- **Search** – 5 query types (substring, by author, most/least posts, highest ranked) with pagination
- **Admin dashboard** – delete users, channels, posts, replies
- **Authentication** – email/password with bcrypt hashing
- **Docker‑first** – one‑command setup

## Run with Docker (recommended for marking)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Steps
1. Clone the repository  
   ```bash
   git clone https://github.com/OlisaKenneth/fullStackWeb.git
   cd fullStackWeb/qna

2. Create environment file (from example)
   cp .env.example .env
   (No changes needed – the defaults work with Docker.)

3. Build and start the containers
   docker-compose up --build

4. Open your browser at http://localhost:3000

Default admin credentials

Email: admin@example.com
Password: admin123
The database is automatically seeded with this admin user and one default channel (“General”).

Manual seed (if needed)
   npx prisma db seed

Development without Docker
1. Install dependencies

    npm install

2. Set up .env with your local PostgreSQL (e.g., on port 5434)
   DATABASE_URL="postgresql://postgres:password123@localhost:5434/next_launch_kit"
   NEXTAUTH_SECRET=any-secret
   NEXTAUTH_URL=http://localhost:3000

3. Run migrations and seed
   npx prisma db push
   npx prisma db seed

4. Start the Development center
   npm run dev


Project Structure
src/
├── app/                 # Next.js App Router (pages & API routes)
│   ├── api/             # Backend endpoints
│   ├── auth/            # Sign in / sign up pages
│   ├── channels/        # Channel list & single channel view
│   ├── posts/           # Post detail (threaded replies)
│   ├── search/          # Search page
│   └── admin/           # Admin dashboard
├── components/          # Reusable UI (NavBar)
├── lib/                 # Auth helpers
└── types/               # TypeScript declarations
prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Seed script (admin + default channel)
public/uploads/          # Uploaded images (persisted via Docker volume)
docker-compose.yml       # Multi‑container orchestration
Dockerfile               # Production build


Reports & Demo

Design report – DESIGN_REPORT.md
Test report – TEST_REPORT.md
Demo video – [\[Link to your video\]](https://drive.google.com/file/d/1E3lq7J15z3G9VMGcvIzTSlXW4ZB1YFTi/view?usp=sharing) (max 10 min, shows all core flows)
Technologies Used

Next.js 16 (App Router, Turbopack)
Prisma ORM + PostgreSQL
NextAuth.js (Credentials provider)
Tailwind CSS
TypeScript
Docker + docker‑compose
Multer (file upload)
Troubleshooting

“Cannot find module” during Docker build

Make sure you ran docker-compose down -v and then docker-compose up --build – this clears old volumes.

Uploaded images not showing

Check that the file exists in public/uploads/ on your host.
Verify the Docker volume is mounted: docker exec -it qna-app-1 ls -la /app/public/uploads/
Ensure the database screenshot field starts with /api/image/ (the upload API does this automatically).
Admin dashboard redirects to sign in

Log out and sign in again with the admin account (admin@example.com / admin123).




---
