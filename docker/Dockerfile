# Use the official Node.js image as a base
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Clear NPM cache and install dependencies
RUN npm cache clean --force
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npx", "nodemon", "index.js"]
