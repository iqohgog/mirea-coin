package user

import (
	"coin/configs"
	"coin/pkg/req"
	"coin/pkg/res"
	"net/http"
)

type UserHandler struct {
	*configs.Config
	UserRepository *UserRepository
}

func NewUserHandler(router *http.ServeMux, deps UserHandler) {
	handler := deps
	router.HandleFunc("GET /user", handler.Auth())
	router.HandleFunc("POST /user/description", handler.Description())
	router.HandleFunc("GET /user/leaderboard", handler.Leaderboard())
	router.HandleFunc("POST /user/click", handler.Click())
	router.HandleFunc("GET /user/cost", handler.Cost())
	router.HandleFunc("GET /user/auto", handler.Auto())
}

// Получеие информции о юзере + автоизация
func (handler *UserHandler) Auth() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[UserRequest](w, r)
		if err != nil {
			return
		}
		userTemp := &User{
			TelegramID: body.TelegramID,
			Name:       body.Name,
		}
		user, err := handler.UserRepository.Create(userTemp)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		response := UserResponse{
			Balance:     user.Balance,
			MaxTokens:   user.MaxTokens,
			Description: user.Description,
		}
		res.Json(w, response, 200)
	}
}

// Запрос на изменение описания
func (handler *UserHandler) Description() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[UserDescriptionRequest](w, r)
		if err != nil {
			return
		}
		user, err := handler.UserRepository.ChangeDescription(body.TelegramID, body.Description)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res.Json(w, user, 200)
	}
}

// Получение топа
func (handler *UserHandler) Leaderboard() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		users, err := handler.UserRepository.GetTopByBalance()
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res.Json(w, users, 200)
	}
}

// Отправка накликанного
func (handler *UserHandler) Click() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[UserClickRequest](w, r)
		if err != nil {
			return
		}
		user, err := handler.UserRepository.UseClicks(body.TelegramID, body.Clicks)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res.Json(w, user, 200)
	}
}

func (handler *UserHandler) Cost() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[UserRequest](w, r)
		if err != nil {
			return
		}
		cost, err := handler.UserRepository.CostClicks(body.TelegramID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res.Json(w, cost+1, 200)
	}
}

func (handler *UserHandler) Auto() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[UserRequest](w, r)
		if err != nil {
			return
		}
		cost, err := handler.UserRepository.CostAuto(body.TelegramID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res.Json(w, cost, 200)
	}
}
