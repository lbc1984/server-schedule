FROM oven/bun:latest

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Ho_Chi_Minh

WORKDIR /app

COPY package.json ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --production

COPY . .

EXPOSE 3000

CMD ["bun", "run", "start"]