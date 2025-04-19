CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    guild_id BIGINT,
    author_id BIGINT NOT NULL,
    content TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    attachments JSON
);