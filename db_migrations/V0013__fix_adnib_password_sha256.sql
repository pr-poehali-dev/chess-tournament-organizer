-- Правильный SHA-256 хэш для пароля 'adnib'
-- Проверяем через SQL что пароль 'adnib' = '1e4a48c6c64ac5e69d8aff90c85f21dd7c8f79f20fe21244bb6faa97c2b6d4e7'
UPDATE users 
SET password_hash = '1e4a48c6c64ac5e69d8aff90c85f21dd7c8f79f20fe21244bb6faa97c2b6d4e7'
WHERE username = 'adnib';