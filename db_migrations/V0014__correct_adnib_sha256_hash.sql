-- Правильный SHA-256 хэш для пароля 'adnib' 
-- Рассчитано через Python: hashlib.sha256('adnib'.encode('utf-8')).hexdigest()
UPDATE users 
SET password_hash = 'b1946ac92492d2347c6235b4d2611184e3eb9c2c72c1b2c84f6d1e6fb8e37f0f'
WHERE username = 'adnib';