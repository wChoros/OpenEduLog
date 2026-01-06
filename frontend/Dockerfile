FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Default command for development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
