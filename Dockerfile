FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Set environment variables
ARG PORT
ARG MONGO_URI
ARG JWT_SECRET
ENV PORT=${PORT}
ENV MONGO_URI=${MONGO_URI}
ENV JWT_SECRET=${JWT_SECRET}

EXPOSE 8080
CMD [ "node", "index.js" ]
