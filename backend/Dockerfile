FROM node:20 AS builder 

WORKDIR /app

COPY . ./

COPY package*.json ./
RUN npm ci
# deployer stage 

FROM node:20-alpine 

RUN apk add --no-cache wget

WORKDIR /app 

COPY --from=builder /app /app 

EXPOSE 5000 

CMD [ "node" ,"src/server.js" ]