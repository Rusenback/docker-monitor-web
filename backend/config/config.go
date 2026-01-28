package config

import (
	"log"
	"os"

"github.com/joho/godotenv"
)

type Config struct {
	Port				string
	FrontendURL	string

	DBHost			string
	DBPort 			string 
	DBUser			string 
	DBPassword	string 
	DBName			string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variable")
		
  }

	return &Config{
		Port: 		getEnv("PORT", "8080"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),

		DBHost:     getEnv("DB_HOST", "localhost"),
    DBPort:     getEnv("DB_PORT", "5432"),
    DBUser:     getEnv("DB_USER", "postgres"),
    DBPassword: getEnv("DB_PASSWORD", "password"),
    DBName:     getEnv("DB_NAME", "docker_monitor"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != ""{
		return value
	}
	return defaultValue
}
