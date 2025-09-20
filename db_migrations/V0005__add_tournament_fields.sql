-- Добавляем новые поля для турниров
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS time_control VARCHAR(100),
ADD COLUMN IF NOT EXISTS age_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS start_time_msk TIME;