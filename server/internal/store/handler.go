package store

import (
	"coin/configs"
	"coin/pkg/req"
	"coin/pkg/res"
	"net/http"
)

type StoreHandler struct {
	*configs.Config
	StoreRepository *StoreRepository
}

func NewStoreHandler(router *http.ServeMux, deps StoreHandler) {
	handler := deps
	router.HandleFunc("GET /store/clicks", handler.StoreClick())
	router.HandleFunc("GET /store/auto", handler.StoreAuto())
	router.HandleFunc("GET /store/buy", handler.Buy())
}

func (handler *StoreHandler) StoreClick() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[StoreRequest](w, r)
		if err != nil {
			return
		}
		items, err := handler.StoreRepository.GetClicksStore(body.TelegramID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res.Json(w, items, 200)
	}
}

func (handler *StoreHandler) StoreAuto() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[StoreRequest](w, r)
		if err != nil {
			return
		}
		items, err := handler.StoreRepository.GetAutoStore(body.TelegramID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res.Json(w, items, 200)
	}
}

func (handler *StoreHandler) Buy() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[StoreBuyRequest](w, r)
		if err != nil {
			return
		}
		err = handler.StoreRepository.Buy(body.TelegramID, body.Store, body.Name)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res.Json(w, "Успешная покупка!", 200)
	}
}
