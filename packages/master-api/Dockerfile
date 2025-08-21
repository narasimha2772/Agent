FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm i -g pnpm && pnpm i && pnpm build || true
EXPOSE 3000
CMD ["pnpm","start"]
