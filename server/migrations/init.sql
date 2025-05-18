CREATE TABLE profile (
  id           SERIAL PRIMARY KEY,
  telegram_id   BIGINT   UNIQUE NOT NULL,
  name          TEXT     NOT NULL,
  description   TEXT,
  balance       BIGINT DEFAULT 0,
  max_tokens BIGINT DEFAULT 10000
);

CREATE TABLE click_store_item (
  id             SERIAL PRIMARY KEY,
  name           TEXT     NOT NULL,
  description    TEXT,
  quality        INTEGER,
  base_value     INTEGER NOT NULL,  
  coefficient    INTEGER NOT NULL   
);

CREATE TABLE auto_store_item (
  id             SERIAL PRIMARY KEY,
  name           TEXT     NOT NULL,
  description    TEXT,
  quality        INTEGER,
  base_value     INTEGER NOT NULL,  
  coefficient    INTEGER NOT NULL   
);

CREATE TABLE user_click_item (
  user_id        INTEGER   NOT NULL
    REFERENCES profile(id) ON DELETE CASCADE,
  item_id        INTEGER   NOT NULL
    REFERENCES click_store_item(id) ON DELETE CASCADE,
  quantity       INTEGER   NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE user_auto_item (
  user_id        INTEGER   NOT NULL
    REFERENCES profile(id) ON DELETE CASCADE,
  item_id        INTEGER   NOT NULL
    REFERENCES auto_store_item(id) ON DELETE CASCADE,
  quantity       INTEGER   NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_id)
);


CREATE OR REPLACE FUNCTION increase_max_tokens()
RETURNS void AS $$
BEGIN
  UPDATE profile
  SET max_tokens = LEAST(max_tokens + 10, 10000)
  WHERE max_tokens < 10000;
END;
$$ LANGUAGE plpgsql;



-- click_store_item
INSERT INTO click_store_item (name, description, quality, base_value, coefficient) VALUES
  ('Tralalelo Tapper',    'Каждый клик звучит: "тра-ла-ле-ло тра-ла-ла!"',           1,  1, 2),
  ('Ballerina Clicker',   'Легкость движений и кликов, словно балерина на сцене',      2,  5, 3),
  ('Golubio Click',     'Щелчки бодрят, как утренний капучино',                      3, 10, 3),
  ('Crocodilo Bobm',         'Ударный мем-контент: кликай',             4, 20, 3),
  ('Br-br Patapim',        'Каждый клик мощный, как древо',                 5, 25, 2);

-- auto_store_item
INSERT INTO auto_store_item (name, description, quality, base_value, coefficient) VALUES
  ('Automated Tralalelo',        'Тралалело-трэш: сама настраивает ритм кликов',              1, 50, 2),
  ('Ballerina Bot',       'Плавные па робота — автоклики без усилий',                  2, 75, 3),
  ('Golubio Invisible',  'Тайные клики агента',         3,100, 4),
  ('Bombombini Gussini',      'Взрывные автоклики',             4, 150, 5),
  ('Tung Sahur',   'Держит в страхе и заставляет вносить взносы',          5,200, 6);



CREATE OR REPLACE FUNCTION get_user_income_per_second(p_user_id INTEGER)
RETURNS BIGINT AS $$
DECLARE
  total_income BIGINT := 0;
BEGIN
  SELECT COALESCE(SUM(usi.quantity * asi.quality), 0)
  INTO total_income
  FROM user_auto_item usi
  JOIN auto_store_item asi ON usi.item_id = asi.id
  WHERE usi.user_id = p_user_id;

  RETURN total_income;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION add_auto_income_to_users()
RETURNS void AS $$
DECLARE
  u RECORD;
  income BIGINT;
BEGIN
  FOR u IN SELECT id FROM profile LOOP
    income := get_user_income_per_second(u.id);
    UPDATE profile SET balance = balance + income WHERE id = u.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
