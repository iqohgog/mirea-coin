package user

type UserRequest struct {
	TelegramID int    `json:"id"`
	Name       string `json:"username"`
}

type UserResponse struct {
	Description any `json:"description"`
	Balance     int `json:"balance"`
	MaxTokens   int `json:"max_tokens"`
}

type UserDescriptionRequest struct {
	TelegramID  int    `json:"id"`
	Description string `json:"description"`
}

type UserClickRequest struct {
	TelegramID int `json:"id"`
	Clicks     int `json:"clicks"`
}
