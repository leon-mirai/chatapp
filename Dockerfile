# Stage 1: Build the Angular Client
FROM node:22-bookworm AS client-build

# Copy package.json and package-lock.json to install Angular dependencies
COPY . .

# Set the working directory inside the container for the client
WORKDIR /client

# Install Angular dependencies
RUN npm install

# Build the Angular app for production (output will go into the /client/dist folder)
RUN npm run build --prod

# Stage 2: Build the Node.js Server
FROM node:22-bookworm AS server-build

# Copy the rest of the Node.js server code
COPY . .

# Set the working directory inside the container for the server
WORKDIR /client/server

# Install dependencies with the production flag for the server
RUN npm install --production

# Copy the Angular production build from client-build stage to the public folder of the Node.js server
# Assuming your Node.js server serves static files from the /server/public directory
COPY --from=client-build /client/dist/client/browser /client/server/public

# Expose the port your Node.js server will run on
EXPOSE 3000

# Install PM2 to manage Node.js server processes
RUN npm install -g pm2

# Start the server using PM2
CMD ["pm2-runtime", "server.js"]
