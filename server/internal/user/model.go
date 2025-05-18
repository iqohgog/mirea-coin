package user

type User struct {
	TelegramID  int
	Name        string
	Description any
	Balance     int
	MaxTokens   int
}
