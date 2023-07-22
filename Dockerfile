# syntax=docker/dockerfile:1

FROM node:20-alpine
ENV NODE_ENV=production

WORKDIR /iris

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD ["npm", "start"]