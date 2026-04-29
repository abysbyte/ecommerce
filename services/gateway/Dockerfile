FROM node:20-alpine

WORKDIR /app

# We are building independently, so we just copy the service's package.json
COPY package.json ./

RUN npm install --omit=dev

COPY . .

CMD ["npm", "start"]
