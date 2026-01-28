package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rusenback/docker-monitor-web/config"
	"github.com/rusenback/docker-monitor-web/api"
	"github.com/rusenback/docker-monitor-web/services"
)

func main() {

	cfg := config.Load()

	dockerService, err := services.NewDockerService()
	if err != nil {
    log.Fatal("Failed to create Docker service:", err)
	}
	defer dockerService.Close()

	router := gin.Default()

	handler := api.NewHandler(dockerService)

	router.Use(cors.New(cors.Config{
			AllowOrigins: 		[]string{cfg.FrontendURL},
			AllowMethods: 		[]string{"GET", "POST", "PUT", "DELETE"},
			AllowHeaders: 		[]string{"Origin", "Content-type", "Authorization"},
			ExposeHeaders: 		[]string{"Content-Lenght"},
			AllowCredentials: true,
	}))
	
	port := cfg.Port

	router.GET("ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	router.GET("/api/containers", handler.GetContainers)

	router.GET("/api/containers/:id/stats", handler.GetContainerStats)

	log.Println("Docker service initialized succesfully!")
	
	fmt.Println("http://localhost:" + port)
	router.Run(":" + port)
}
