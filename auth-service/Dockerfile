# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
# This leverages Docker's layer caching to speed up builds
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run your app
CMD [ "node", "server.js" ]