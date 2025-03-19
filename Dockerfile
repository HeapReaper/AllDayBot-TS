FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN bun install

WORKDIR /app/src

CMD ["bun", "run", "index.ts"]
