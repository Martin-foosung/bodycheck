FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY src ./src
EXPOSE 8787
CMD ["sh","-c","npx prisma migrate deploy && npm start"]
