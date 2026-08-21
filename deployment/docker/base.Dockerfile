FROM node:22.4.1-alpine AS base

RUN apk add --no-cache python3 make g++ curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
