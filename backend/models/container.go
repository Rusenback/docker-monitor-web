package models 

type ContainerInfo struct {
		ID     string `json:"id"`
  	Name   string `json:"name"`
    Image  string `json:"image"`
    State  string `json:"state"`
    Status string `json:"status"`
}

type ContainerStats struct {
	ContainerID string		`json:"container_id"`
	CPUPercent float64		`json:"cpu_percent"`
	MemoryUsage uint64 		`json:"memory_usage"`
	MemoryLimit uint64 		`json:"memory_limit"`
	MemoryPercent float64 `json:"memory_percent"`
}
