# Use the official Node.js image as the base image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --verbose

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Mount the volume for database.json
VOLUME [ "/app/database.json" ]

# Start the application
CMD [ "npm", "start" ]