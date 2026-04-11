FROM node:22-alpine

WORKDIR /app

# Install build tools for better-sqlite3 native module
RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install --omit=dev

COPY . .

# Data directory for SQLite database
RUN mkdir -p /app/data

EXPOSE 4000

CMD ["node", "index.js"]
