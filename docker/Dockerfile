# Use the official Node.js image as a base
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# List files to ensure package.json is present
RUN ls -la /usr/src/app

# Clear NPM cache and install dependencies
RUN npm cache clean --force

# Debug: Ensure npm install output is captured
RUN npm install && echo "NPM install succeeded" || echo "NPM install failed"

# List node_modules to ensure packages are installed
RUN ls -la /usr/src/app/node_modules

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npx", "nodemon", "index.js"]
