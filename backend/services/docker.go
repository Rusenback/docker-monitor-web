package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"runtime"
	"strings"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/rusenback/docker-monitor-web/models"
)

type DockerService struct {
	client *client.Client
}

type statsJSON struct {
    CPUStats struct {
        CPUUsage struct {
            TotalUsage  uint64   `json:"total_usage"`
            PercpuUsage []uint64 `json:"percpu_usage"`
        } `json:"cpu_usage"`
        SystemCPUUsage uint64 `json:"system_cpu_usage"`
        OnlineCPUs uint64     `json:"online_cpus"`
    } `json:"cpu_stats"`
    
    PreCPUStats struct {
        CPUUsage struct {
            TotalUsage uint64 `json:"total_usage"`
        } `json:"cpu_usage"`
        SystemCPUUsage uint64 `json:"system_cpu_usage"`
    } `json:"precpu_stats"`
    
    MemoryStats struct {
        Usage uint64 `json:"usage"`
        Limit uint64 `json:"limit"`
    } `json:"memory_stats"`
}

func NewDockerService() (*DockerService, error){
	cli, err := client.NewClientWithOpts(
		client.FromEnv,
		client.WithAPIVersionNegotiation(),
	)
	if err != nil {
		log.Printf("Failed to create Docker client: %v", err)
		return nil, err 
	}
	return &DockerService{client: cli}, nil

}

func (s DockerService) Close() error{
	return s.client.Close()
}

func (s DockerService) ListContainers(ctx context.Context) ([]models.ContainerInfo, error){
	containerList, err := s.client.ContainerList(ctx, container.ListOptions{})
	if err != nil {
		log.Printf("Failed to list containers: %v", err)
		return nil, err
	}
	
	result := make([]models.ContainerInfo, 0, len(containerList))
	
	for _, c := range containerList{

		name := ""
		if len(c.Names) > 0 {
			name = strings.TrimPrefix(c.Names[0], "/")
		}
		info := models.ContainerInfo{
			ID: 		c.ID,
			Name: 	name,
			Image: 	c.Image,
			State:  c.State,
			Status: c.Status,
		}
		result = append(result, info)
	}
	return result, nil
}

func (s *DockerService) GetContainerStats(ctx context.Context, containerID string) (*models.ContainerStats, error){
	stats, err := s.client.ContainerStats(ctx, containerID, false)
	if err != nil {
		return nil, err
	}
	defer stats.Body.Close()
	
	decoder := json.NewDecoder(stats.Body)

	var statsJSON statsJSON

	err = decoder.Decode(&statsJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to decode stats: %w", err)
	}

	cpuDelta := statsJSON.CPUStats.CPUUsage.TotalUsage - statsJSON.PreCPUStats.CPUUsage.TotalUsage

	systemDelta := statsJSON.CPUStats.SystemCPUUsage - statsJSON.PreCPUStats.SystemCPUUsage

  numCPUs := int(statsJSON.CPUStats.OnlineCPUs)
	if numCPUs == 0 {
		numCPUs = len(statsJSON.CPUStats.CPUUsage.PercpuUsage)
	}
	if numCPUs == 0 {
		numCPUs = runtime.NumCPU()
	}

	var cpuPercent = 0.0

	if systemDelta > 0 && cpuDelta > 0 {
		cpuPercent = (float64(cpuDelta) / float64(systemDelta) * float64(numCPUs) * 100)
	}

	if cpuPercent > 100.0 * float64(numCPUs){
		cpuPercent = 100.0
	}

	memoryUsage := statsJSON.MemoryStats.Usage 
	memoryLimit := statsJSON.MemoryStats.Limit 

	var memoryPercent = 0.0 
		if memoryLimit > 0 {
		memoryPercent = (float64(memoryUsage) / float64(memoryLimit)) * 100.0
	}
	
	result := &models.ContainerStats{
		ContainerID: containerID,
		CPUPercent: cpuPercent,
		MemoryUsage: memoryUsage,
		MemoryLimit: memoryLimit,
		MemoryPercent: memoryPercent,
	}

	return result, nil
}

func (s *DockerService) BroadcastStats(ctx context.Context, hub *Hub, tsdb *TimeSeriesDB, interval time.Duration){
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <- ticker.C:
			containers, err := s.ListContainers(ctx)
			if err != nil {
				log.Printf("Error listing containers: %v", err)
				continue
			}
		
			var allStats []models.ContainerStats
			for _, container := range containers{
				stats, err := s.GetContainerStats(ctx, container.ID)
				if err != nil {
					continue
			}
			allStats = append(allStats, *stats)
		}
			for _, stat := range allStats {
    if tsdb != nil {
        if err := tsdb.InsertMetrics(stat); err != nil {
            log.Printf("Failed to save metrics: %v", err)
        }
    }
}

					data, err := json.Marshal(allStats)
			if err != nil {
				log.Printf("Error marshalin stats: %v", err)
				continue
			}
		
			hub.broadcast <- data
		
		case <- ctx.Done():
			return
		}
	}
}

func (s *DockerService) StreamLogs(ctx context.Context, containerID string, lines int) (io.ReadCloser, error) {
	options := container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:			false,
		Tail: 			fmt.Sprintf("%d", lines),
		Timestamps: true,
	}

	logs, err := s.client.ContainerLogs(ctx, containerID, options)
	if err != nil {
		return nil, err
	}

	return logs, nil
}
