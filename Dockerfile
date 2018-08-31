FROM node:alpine

RUN apk update
RUN apk upgrade
RUN apk add bash
RUN apk add git

RUN mkdir -p /hwboard2
WORKDIR /hwboard2
COPY . .

RUN npm ci --production