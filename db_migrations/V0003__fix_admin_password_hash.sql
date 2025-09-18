-- Исправляем пароль администратора для совместимости с системой авторизации
UPDATE users 
SET password_hash = '62b20066defc7b741a6fb6f971341199012b86adab4ece0e29fd0dddc8faf740'
WHERE email = 'admin@chess-tournament.org';

-- Проверяем, что администратор обновлен
SELECT email, role, is_active FROM users WHERE email = 'admin@chess-tournament.org';