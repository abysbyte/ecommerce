FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY . .

RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

CMD ["npm", "start"]
