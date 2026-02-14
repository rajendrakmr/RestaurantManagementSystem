
# choose a base image 
FROM node:20 AS builder 

WORKDIR /app

COPY . /app

RUN npm install 

# deployer stage

RUN  npm run build 

