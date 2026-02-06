package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rusenback/docker-monitor-web/api"
	"github.com/rusenback/docker-monitor-web/config"
	"github.com/rusenback/docker-monitor-web/services"
)

func main() {

	cfg := config.Load()

	hub := services.NewHub()
	go hub.Run()

	dockerService, err := services.NewDockerService()
	if err != nil {
    log.Fatal("Failed to create Docker service:", err)
	}
	defer dockerService.Close()

	router := gin.Default()

	tsdb, err := services.NewTimeSeriesDB(
    cfg.DBHost,
    cfg.DBPort,
    cfg.DBUser,
    cfg.DBPassword,
    cfg.DBName,
	)
	if err != nil {
    log.Printf("Warning: Could not connect to database: %v", err)
    log.Println("Continuing without database persistence...")
    tsdb = nil
	} else {
    // Only defer close if connection succeeded
    defer tsdb.Close()
	}

	handler := api.NewHandler(dockerService, tsdb)
	log.Printf("DEBUG: Created handler with tsdb=%v", tsdb != nil)  // Add this



	router.Use(cors.New(cors.Config{
			AllowOrigins: 		[]string{cfg.FrontendURL},
			AllowMethods: 		[]string{"GET", "POST", "PUT", "DELETE"},
			AllowHeaders: 		[]string{"Origin", "Content-type", "Authorization"},
			ExposeHeaders: 		[]string{"Content-Lenght"},
			AllowCredentials: true,
	}))
	
	port := cfg.Port

	ctx := context.Background()
	go dockerService.BroadcastStats(ctx, hub, tsdb , 2*time.Second)


	router.GET("ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	router.GET("/api/containers", handler.GetContainers)

	router.GET("/api/containers/:id/stats", handler.GetContainerStats)

	router.GET("/ws", func(c *gin.Context) {
		services.ServeWs(hub, c.Writer, c.Request)
	})

	router.GET("/api/containers/:id/history", handler.GetContainerHistory)

	router.GET("/api/containers/:id/logs", handler.GetContainerLogs)

	log.Println("Docker service initialized succesfully!")
	
	fmt.Println("http://localhost:" + port)
	router.Run(":" + port)
}
