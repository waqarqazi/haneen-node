# Use an official Node.js runtime as the base image
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code to the container image
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Run the web service on container startup
CMD [ "npm", "start" ]
