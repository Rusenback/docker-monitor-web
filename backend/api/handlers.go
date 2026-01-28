package api

import (
	"log"
	"github.com/gin-gonic/gin"
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
	container_stats, err := h.dockerService.GetContainerStats(c.Request.Context(), containerID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, container_stats)
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
