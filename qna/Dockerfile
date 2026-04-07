FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (allow legacy peer deps for next-auth compatibility)
RUN npm ci --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Run database push, seed with ts-node, and start the server
CMD ["sh", "-c", "npx prisma db push && npx ts-node prisma/seed.ts && npm start"]
