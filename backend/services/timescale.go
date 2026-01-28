package services

import (
    "database/sql"
    "fmt"
    "log"
		"time"
    
    _ "github.com/lib/pq"
    "github.com/rusenback/docker-monitor-web/models"
)

type TimeSeriesDB struct {
    db *sql.DB
}

func NewTimeSeriesDB(host, port, user, password, dbname string) (*TimeSeriesDB, error) {
    connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname)
    
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        return nil, fmt.Errorf("failed to open database: %w", err)
    }
    
    if err := db.Ping(); err != nil {
        return nil, fmt.Errorf("failed to ping database: %w", err)
    }
    
    // Create table if it doesn't exist
    if err := createTables(db); err != nil {
        return nil, fmt.Errorf("failed to create tables: %w", err)
    }
    
    log.Println("TimescaleDB connected successfully")
    return &TimeSeriesDB{db: db}, nil
}

func createTables(db *sql.DB) error {
    _, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS container_metrics (
            time         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            container_id TEXT NOT NULL,
            cpu_percent  DOUBLE PRECISION,
            memory_usage BIGINT,
            memory_limit BIGINT,
            memory_percent DOUBLE PRECISION
        );
        
        -- Try to create hypertable (only works with TimescaleDB extension)
        -- If it fails (plain PostgreSQL), table still works, just not optimized
        SELECT create_hypertable('container_metrics', 'time', if_not_exists => TRUE);
    `)
    
    // Ignore error if not TimescaleDB - table still works
    if err != nil {
        log.Printf("Note: Hypertable creation skipped (use TimescaleDB for optimization): %v", err)
    }
    
    return nil
}

func (ts *TimeSeriesDB) InsertMetrics(stats models.ContainerStats) error {
    _, err := ts.db.Exec(`
        INSERT INTO container_metrics 
        (container_id, cpu_percent, memory_usage, memory_limit, memory_percent)
        VALUES ($1, $2, $3, $4, $5)
    `, stats.ContainerID, stats.CPUPercent, stats.MemoryUsage, stats.MemoryLimit, stats.MemoryPercent)
    
    return err
}

func (ts *TimeSeriesDB) Close() error {
    return ts.db.Close()
}

type MetricPoint struct {
    Time          time.Time `json:"time"`
    CPUPercent    float64   `json:"cpu_percent"`
    MemoryPercent float64   `json:"memory_percent"`
}

func (ts *TimeSeriesDB) QueryHistory(containerID string, timeRange string) ([]MetricPoint, error) {
    // Parse time range (1h, 24h, 7d, 30d)
    var interval string
    switch timeRange {
    case "1h":
        interval = "1 hour"
    case "24h":
        interval = "24 hours"
    case "7d":
        interval = "7 days"
    case "30d":
        interval = "30 days"
    default:
        interval = "1 hour"
    }
    
    query := `
        SELECT time, cpu_percent, memory_percent
        FROM container_metrics
        WHERE container_id = $1
          AND time > NOW() - INTERVAL '%s'
        ORDER BY time ASC
    `
    
    rows, err := ts.db.Query(fmt.Sprintf(query, interval), containerID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var metrics []MetricPoint
    for rows.Next() {
        var m MetricPoint
        if err := rows.Scan(&m.Time, &m.CPUPercent, &m.MemoryPercent); err != nil {
            return nil, err
        }
        metrics = append(metrics, m)
    }
    
    return metrics, nil
}
