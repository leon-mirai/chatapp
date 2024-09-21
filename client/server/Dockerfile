# Use Node.js 22 with Debian Bookworm
FROM node:22-bookworm

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies with production flag
RUN npm install --production

# Copy the rest of your server code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the application using a process manager like PM2 for better management in production
RUN npm install -g pm2

# Start the server with PM2 (optional but highly recommended for production)
CMD ["pm2-runtime", "server.js"]
