-- Добавляем новые поля профиля пользователей
ALTER TABLE users ADD COLUMN IF NOT EXISTS fsr_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS coach VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS educational_institution VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;