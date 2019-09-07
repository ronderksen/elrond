FROM mhart/alpine-node:latest

WORKDIR /app
COPY package.json package-lock.json ./
RUN apk update && \
    apk upgrade && \
    apk add git
RUN npm install --production

FROM mhart/alpine-node:latest
WORKDIR /app
COPY --from=0 /app .
COPY . .

CMD ["node", "elrond.js"]
