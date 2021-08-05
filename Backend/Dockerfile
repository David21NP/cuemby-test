# Get node slim docker img
FROM node:stretch-slim

# Set the workdir to copy docs there
WORKDIR /usr/src/app

# Copy package.json there
COPY package.json .

# Install dependencies
RUN yarn install --production

# Copy all docs except the ones ignored --> .dockerignore
COPY . .

# Set ENV vat PORT to 3000
ENV PORT=3000

# EXPOSE port 3000 outside the container
EXPOSE 3000

# Command to run when the container starts
CMD [ "yarn", "start" ]