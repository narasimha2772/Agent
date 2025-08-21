FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
RUN npm i -g pnpm && pnpm i
EXPOSE 4000
CMD ["pnpm","start"]
