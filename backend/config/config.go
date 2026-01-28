package config

import (
	"log"
	"os"

"github.com/joho/godotenv"
)

type Config struct {
	Port				string
	FrontendURL	string 
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variable")
		
  }

	return &Config{
		Port: 		getEnv("PORT", "8080"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != ""{
		return value
	}
	return defaultValue
}
