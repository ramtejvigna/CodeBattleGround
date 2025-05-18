# Use Node.js as the base image
FROM node:18-alpine

# Install Docker client for code execution
RUN apk add --no-cache docker-cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm i

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create temp directory for code execution
RUN mkdir -p /app/tmp

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Expose port
EXPOSE 3000

# Start the application
CMD npm run dev