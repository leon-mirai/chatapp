# Stage 1: Build Angular app
FROM node:22-bookworm AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install Angular dependencies
RUN npm install

# Copy the rest of the Angular client code
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy built Angular app from Stage 1 to NGINX's web directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
