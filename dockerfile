# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN bun install

# Start the bot
CMD ["bun", "run", "src.index.ts"]
