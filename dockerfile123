# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json) to leverage Docker cache
COPY package*.json ./

# Install dependencies, including 'typescript' and any other build tools
RUN npm cache clean --force && npm install 

# Copy the rest of your app's source code
COPY . .

RUN npm install -g nodemon

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable for the port, if your application uses it
ENV PORT=3000

# Command to run your app using the compiled JavaScript
CMD ["npm", "run", "start"]
