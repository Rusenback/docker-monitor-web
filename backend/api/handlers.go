package api

import (
	"github.com/rusenback/docker-monitor-web/services"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	dockerService *services.DockerService
}

func NewHandler(dockerService *services.DockerService) *Handler {
	return &Handler{dockerService: dockerService}
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
