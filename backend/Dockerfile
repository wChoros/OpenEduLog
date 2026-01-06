FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application
COPY . .

EXPOSE 2137

# Default command, can be overridden by docker-compose
CMD ["npm", "run", "dev"]
