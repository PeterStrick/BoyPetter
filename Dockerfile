FROM node:20-alpine AS deps
WORKDIR /deps
COPY package.json package-lock.json /deps/
RUN apk add --update python3 g++ build-base cairo-dev jpeg-dev pango-dev librsvg-dev musl-dev giflib-dev pixman-dev pangomm-dev libjpeg-turbo-dev freetype-dev && npm i

FROM node:20-alpine
WORKDIR /app
COPY . .
COPY --from=deps /deps/node_modules /app/node_modules
RUN apk add --update cairo-dev jpeg-dev pango-dev librsvg-dev musl-dev giflib-dev pixman-dev pangomm-dev libjpeg-turbo-dev freetype-dev
ENTRYPOINT ["node", "."]
