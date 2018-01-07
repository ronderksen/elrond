FROM mhart/alpine-node:8.9.4

WORKDIR /app
COPY package.json package-lock.json ./
RUN apk update && \
    apk upgrade && \
    apk add git
RUN npm install --production

FROM mhart/alpine-node:base-8.9.4
WORKDIR /app
COPY --from=0 /app .
COPY . .

CMD ["node", "elrond.js"]