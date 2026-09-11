FROM node:20-alpine

WORKDIR /app

ENV PORT=8080

COPY package*.json ./
RUN npm install --include=dev

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
