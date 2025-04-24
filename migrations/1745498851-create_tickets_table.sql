CREATE TABLE tickets (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status ENUM('open', 'in_progress', 'closed', 'on_hold') NOT NULL DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    created_by_user_id BIGINT NOT NULL,
    assigned_to_user_id BIGINT DEFAULT NULL,
    thread_id BIGINT DEFAULT NULL,
    due_date DATETIME,
    category VARCHAR(100)
);
