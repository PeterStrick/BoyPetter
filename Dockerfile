FROM node:20-alpine AS deps
WORKDIR /deps
COPY package.json package-lock.json /deps/
RUN npm i

FROM node:20-alpine
WORKDIR /app
COPY . .
COPY --from=deps /deps/node_modules /app/node_modules
ENTRYPOINT ["node", "."]
