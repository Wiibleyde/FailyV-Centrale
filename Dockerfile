FROM node:20

ENV NODE_ENV=

WORKDIR /app

COPY . .

RUN npm i

CMD ["npm", "start"]