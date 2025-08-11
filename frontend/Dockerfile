FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

ENV NEXT_PUBLIC_API_URL=http://backend:8000/api/v1

CMD ["npm", "start"]