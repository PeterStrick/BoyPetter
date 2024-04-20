FROM node:20-alpine AS deps
WORKDIR /deps
COPY package.json package-lock.json /deps/
RUN apk add --update python3 make g++ jpeg-dev cairo-dev giflib-dev pango-dev libtool autoconf automake
RUN npm i


FROM node:20-alpine
WORKDIR /app
COPY . .
COPY --from=deps /deps/node_modules /app/node_modules
ENTRYPOINT ["node", "."]
