FROM node:20-alpine

WORKDIR /app

COPY package.json package*.json ./
RUN npm install

COPY . .

# Ensure the public API URL is set at build time so the client bundle calls the host-exposed backend
ENV NEXT_PUBLIC_API_URL=http://localhost:12001/api/v1

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]