FROM node:20.13.1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

# Use nodemon for development
CMD ["npx", "nodemon", "index.js"]
