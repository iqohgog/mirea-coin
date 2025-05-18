package user

import (
	"coin/pkg/db"
	"database/sql"

	_ "github.com/lib/pq"
)

type UserRepository struct {
	Storage *db.Storage
}

func NewUserRepository(storage *db.Storage) *UserRepository {
	return &UserRepository{
		Storage: storage,
	}
}

func (repo *UserRepository) Create(user *User) (*User, error) {
	userExists, _ := repo.GetByID(user.TelegramID)
	if userExists != nil {
		return userExists, nil
	}
	stmt, err := repo.Storage.DB.Prepare(`
	INSERT INTO profile(
		telegram_id, name
	)
	VALUES($1, $2)
	`)
	if err != nil {
		return nil, err
	}
	err = stmt.QueryRow(user.TelegramID, user.Name).Scan()
	if err != sql.ErrNoRows && err != nil {
		return nil, err
	}
	user.Balance = 0
	user.MaxTokens = 10000
	user.Description = nil
	return user, nil
}

func (repo *UserRepository) GetByID(id int) (*User, error) {
	stmt, err := repo.Storage.DB.Prepare(`
		SELECT telegram_id, name, description, balance, max_tokens  FROM profile
		WHERE telegram_id = $1
	`)
	if err != nil {
		return nil, err
	}
	row := stmt.QueryRow(id)
	var user User
	err = row.Scan(&user.TelegramID, &user.Name, &user.Description, &user.Balance, &user.MaxTokens)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (repo *UserRepository) ChangeDescription(id int, description string) (*User, error) {
	stmt, err := repo.Storage.DB.Prepare("UPDATE profile SET description = $2 WHERE telegram_id = $1")
	if err != nil {
		return nil, err
	}
	_, err = stmt.Exec(id, description)
	if err != nil {
		return nil, err
	}
	return repo.GetByID(id)
}

func (repo *UserRepository) GetTopByBalance() ([]*User, error) {
	stmt, err := repo.Storage.DB.Prepare(`
		SELECT telegram_id, name, description, balance, max_tokens
		FROM profile
		ORDER BY balance DESC
		LIMIT 10
	`)
	if err != nil {
		return nil, err
	}
	rows, err := stmt.Query()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.TelegramID, &u.Name, &u.Description, &u.Balance, &u.MaxTokens); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, nil
}

func (repo *UserRepository) UseClicks(telegramID int, clicks int) (*User, error) {
	user, err := repo.GetByID(telegramID)
	if err != nil {
		return nil, err
	}
	if clicks > user.MaxTokens {
		clicks = user.MaxTokens
		user.MaxTokens = 0
	} else {
		user.MaxTokens -= clicks
	}
	user.Balance += clicks
	_, err = repo.Storage.DB.Exec(`
		UPDATE profile
		SET balance = $1, max_tokens = $2
		WHERE telegram_id = $3
	`, user.Balance, user.MaxTokens, telegramID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (repo *UserRepository) CostClicks(telegramID int) (int, error) {
	var userID int
	err := repo.Storage.DB.QueryRow(`
		SELECT id FROM profile WHERE telegram_id = $1
	`, telegramID).Scan(&userID)
	if err != nil {
		return 0, err
	}

	var totalClicksQuality int
	err = repo.Storage.DB.QueryRow(`
		SELECT COALESCE(SUM(ci.quality * uci.quantity), 0)
		FROM click_store_item ci
		JOIN user_click_item uci ON ci.id = uci.item_id
		WHERE uci.user_id = $1
	`, userID).Scan(&totalClicksQuality)
	if err != nil {
		return 0, err
	}

	return totalClicksQuality, nil
}

func (repo *UserRepository) CostAuto(telegramID int) (int, error) {
	var userID int
	err := repo.Storage.DB.QueryRow(`
		SELECT id FROM profile WHERE telegram_id = $1
	`, telegramID).Scan(&userID)
	if err != nil {
		return 0, err
	}

	var incomePerSecond int
	err = repo.Storage.DB.QueryRow(`
		SELECT get_user_income_per_second($1)
	`, userID).Scan(&incomePerSecond)
	if err != nil {
		return 0, err
	}

	return incomePerSecond, nil
}
