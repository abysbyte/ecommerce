FROM node:20-alpine

# Install openssl for Prisma engine resolution
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY . .

RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

CMD ["npm", "start"]
