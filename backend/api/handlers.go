package api

import (
	"bytes"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/docker/docker/pkg/stdcopy"
	"github.com/rusenback/docker-monitor-web/services"
)

type Handler struct {
	dockerService *services.DockerService
	tsdb 					*services.TimeSeriesDB
}

func NewHandler(dockerService *services.DockerService, tsdb *services.TimeSeriesDB) *Handler {
	return &Handler{
		dockerService: 	dockerService,
		tsdb: 					tsdb,
	}
}

func (h *Handler) GetContainers(c *gin.Context) {
	containers, err := h.dockerService.ListContainers(c.Request.Context())
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, containers)
}

func (h *Handler) GetContainerStats(c *gin.Context) {
	containerID := c.Param("id")
	containerStats, err := h.dockerService.GetContainerStats(c.Request.Context(), containerID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, containerStats)
}

func (h *Handler) GetContainerHistory(c *gin.Context) {
		log.Printf("DEBUG: h.tsdb is nil? %v", h.tsdb == nil)  // Add this
    // Check FIRST before using h.tsdb
    if h.tsdb == nil {
        c.JSON(503, gin.H{"error": "Database not connected"})
        return
    }
    
    containerID := c.Param("id")
    timeRange := c.DefaultQuery("range", "1h")
    
    history, err := h.tsdb.QueryHistory(containerID, timeRange)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, history)
}

func (h *Handler) GetContainerLogs(c *gin.Context) {
	containerID := c.Param("id")
	lines := c.DefaultQuery("lines", "100")

	linesInt, err := strconv.Atoi(lines)
	if err != nil {
		linesInt = 100
	}

	logs, err := h.dockerService.StreamLogs(c.Request.Context(), containerID, linesInt)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	defer logs.Close()

	buf := new(bytes.Buffer)
	_, err = stdcopy.StdCopy(buf, buf, logs)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return 
	}

	c.JSON(200, gin.H{
		"logs": buf.String(),
	})
}
