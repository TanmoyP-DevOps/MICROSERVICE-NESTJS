FROM gb-base:latest AS base

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

FROM gb-base:latest AS runtime

WORKDIR /app
COPY --from=base /app/dist ./dist
CMD ["npm", "run", "start:prod:gateway:rest"]
