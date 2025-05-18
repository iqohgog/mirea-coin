package main

import (
	"coin/configs"
	"coin/internal/store"
	"coin/internal/user"
	"coin/pkg/db"
	"coin/pkg/middleware"
	"fmt"
	"net/http"
	"os"
	"time"
)

func App() http.Handler {
	conf := configs.LoadConfig()
	db := db.New(conf)

	go func() {
		ticker := time.NewTicker(time.Second)
		defer ticker.Stop()
		for range ticker.C {
			db.DB.Exec("SELECT increase_max_tokens()")
		}
	}()

	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			db.DB.Exec("SELECT add_auto_income_to_users()")
		}
	}()

	router := http.NewServeMux()

	userRepository := user.NewUserRepository(db)
	storeRepository := store.NewStoreRepository(db)

	user.NewUserHandler(router, user.UserHandler{
		Config:         conf,
		UserRepository: userRepository,
	})

	store.NewStoreHandler(router, store.StoreHandler{
		Config:          conf,
		StoreRepository: storeRepository,
	})

	stack := middleware.Chain(
		middleware.CORS,
	)
	return stack(router)
}

func main() {
	app := App()
	server := http.Server{
		Addr:    string(":" + os.Getenv("SERVER_PORT")),
		Handler: app,
	}
	fmt.Println("Server is listining on port", os.Getenv("SERVER_PORT"))
	server.ListenAndServe()
}
