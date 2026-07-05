FROM node:20-alpine

# Install openssl for Prisma engine resolution
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY . .

# Generate Prisma client if it exists in this service (we'll run it just in case, or we can check if prisma exists)
# Let's run it conditionally or we can handle it if it fails. Actually it's better to check if prisma schema exists.
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

CMD ["npm", "start"]
