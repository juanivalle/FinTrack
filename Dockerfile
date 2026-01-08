# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
# using ci (clean install) for better reproducibility
RUN npm ci

# Bundle app source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the app to the /dist folder
RUN npm run build

# Expose the listening port
EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"]
