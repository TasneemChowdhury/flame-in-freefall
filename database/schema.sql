USE flame_in_freefall;

-- Table 1: NASA investigations
CREATE TABLE IF NOT EXISTS investigations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nasa_id VARCHAR(100) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    facility VARCHAR(255),
    platform VARCHAR(255),

    start_date DATE,
    end_date DATE,

    source_url VARCHAR(2048),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table 2: NASA experiments
CREATE TABLE IF NOT EXISTS experiments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    investigation_id BIGINT UNSIGNED NOT NULL,

    nasa_id VARCHAR(100) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    experiment_date DATE,

    source_url VARCHAR(2048),

    metadata JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_experiments_investigation
        FOREIGN KEY (investigation_id)
        REFERENCES investigations(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
