FROM node:20-alpine

WORKDIR /app

COPY package.json package*.json ./
RUN npm install

COPY . .

# Usar ruta relativa para evitar problemas de cookies y orígenes cruzados
ENV NEXT_PUBLIC_API_URL=/api/v1

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]