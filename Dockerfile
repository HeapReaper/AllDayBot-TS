FROM oven/bun:1.2.8

WORKDIR /app

COPY . .

RUN bun install

WORKDIR /app/src

CMD ["bun", "run", "index.ts"]
