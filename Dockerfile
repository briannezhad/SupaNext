FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy app files
COPY . .

EXPOSE 3000

# For development, we'll use npm run dev
# For production, uncomment the build step and use npm start
CMD ["npm", "run", "dev"]

