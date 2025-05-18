package store

type StoreRequest struct {
	TelegramID int `json:"id"`
}

type StoreBuyRequest struct {
	TelegramID int    `json:"id"`
	Store      string `json:"store"`
	Name       string `json:"name"`
}
