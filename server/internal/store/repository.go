package store

import (
	"coin/pkg/db"
	"database/sql"
	"errors"
	"fmt"
	"math"
)

type StoreRepository struct {
	Storage *db.Storage
}

func NewStoreRepository(storage *db.Storage) *StoreRepository {
	return &StoreRepository{
		Storage: storage,
	}
}

func (repo *StoreRepository) GetClicksStore(telegramID int) (*[]Item, error) {
	var userID int
	err := repo.Storage.DB.QueryRow("SELECT id FROM profile WHERE telegram_id = $1", telegramID).Scan(&userID)
	if err != nil {
		return nil, err
	}

	rows, err := repo.Storage.DB.Query(`
		SELECT c.id, c.name, c.description, c.quality, c.base_value, c.coefficient, COALESCE(u.quantity, 0)
		FROM click_store_item c
		LEFT JOIN user_click_item u ON c.id = u.item_id AND u.user_id = $1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []Item
	for rows.Next() {
		var i Item
		if err := rows.Scan(&i.ID, &i.Name, &i.Description, &i.Quality, &i.BaseValue, &i.Coefficient, &i.Quantity); err != nil {
			return nil, err
		}
		i.Cost = i.BaseValue + i.BaseValue*int(math.Pow(float64(i.Coefficient), float64(i.Quantity)))
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &items, nil
}

func (repo *StoreRepository) GetAutoStore(telegramID int) (*[]Item, error) {
	var userID int
	err := repo.Storage.DB.QueryRow("SELECT id FROM profile WHERE telegram_id = $1", telegramID).Scan(&userID)
	if err != nil {
		return nil, err
	}

	rows, err := repo.Storage.DB.Query(`
		SELECT c.id, c.name, c.description, c.quality, c.base_value, c.coefficient, COALESCE(u.quantity, 0)
		FROM auto_store_item c
		LEFT JOIN user_auto_item u ON c.id = u.item_id AND u.user_id = $1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []Item
	for rows.Next() {
		var i Item
		if err := rows.Scan(&i.ID, &i.Name, &i.Description, &i.Quality, &i.BaseValue, &i.Coefficient, &i.Quantity); err != nil {
			return nil, err
		}
		i.Cost = i.BaseValue + i.BaseValue*int(math.Pow(float64(i.Coefficient), float64(i.Quantity)))
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &items, nil
}

func (repo *StoreRepository) Buy(telegramID int, storeType, name string) error {
	tx, err := repo.Storage.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	var userID int
	if err = tx.QueryRow(
		"SELECT id FROM profile WHERE telegram_id = $1",
		telegramID,
	).Scan(&userID); err != nil {
		return err
	}

	var itemTable, userItemTable string
	switch storeType {
	case "click":
		itemTable = "click_store_item"
		userItemTable = "user_click_item"
	case "auto":
		itemTable = "auto_store_item"
		userItemTable = "user_auto_item"
	default:
		return errors.New("неизвестный тип магазина")
	}

	var item Item
	if err = tx.QueryRow(
		fmt.Sprintf(`
            SELECT c.id, c.name, c.description, c.quality, c.base_value, c.coefficient
            FROM %s c
            WHERE c.name = $1
        `, itemTable),
		name,
	).Scan(&item.ID, &item.Name, &item.Description, &item.Quality, &item.BaseValue, &item.Coefficient); err != nil {
		return err
	}

	var currentQty int
	err = tx.QueryRow(
		fmt.Sprintf(`
            SELECT quantity FROM %s
            WHERE user_id = $1 AND item_id = $2
        `, userItemTable),
		userID, item.ID,
	).Scan(&currentQty)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	item.Quantity = currentQty

	cost := item.BaseValue + item.BaseValue*int(math.Pow(float64(item.Coefficient), float64(item.Quantity)))

	var balance int
	if err = tx.QueryRow(
		"SELECT balance FROM profile WHERE id = $1",
		userID,
	).Scan(&balance); err != nil {
		return err
	}
	if balance < cost {
		return errors.New("недостаточно средств")
	}

	if _, err = tx.Exec(
		"UPDATE profile SET balance = balance - $1 WHERE id = $2",
		cost, userID,
	); err != nil {
		return err
	}

	if _, err = tx.Exec(
		fmt.Sprintf(`
            INSERT INTO %s (user_id, item_id, quantity)
            VALUES ($1, $2, 1)
            ON CONFLICT (user_id, item_id) DO UPDATE
              SET quantity = %s.quantity + 1
        `, userItemTable, userItemTable),
		userID, item.ID,
	); err != nil {
		return err
	}

	return nil
}
