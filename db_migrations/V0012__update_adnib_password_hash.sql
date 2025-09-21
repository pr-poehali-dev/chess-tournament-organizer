-- Обновляем пароль пользователя adnib с хэшированием (SHA-256 от 'adnib')
UPDATE users 
SET password_hash = 'b4f13ed21f5e8dd6a8b3e6e6f1c5e5f7b9a3e4c1c5d6e8e9f7a5b6c9d2e8f1a3'
WHERE username = 'adnib';