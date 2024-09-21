# Use Node.js 22 with Debian Bookworm for Angular
FROM node:22-bookworm

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install Angular dependencies
RUN npm install

# Copy the rest of the Angular client code
COPY . .

# Build the Angular app (this will create static files in the dist folder)
RUN npm run build --prod

# Expose the default Angular development server port
EXPOSE 4200

# Start the Angular development server
CMD ["npm", "start"]
