-- Создание пользователя adnib с правами администратора
INSERT INTO users (username, email, password_hash, full_name, role) 
VALUES ('adnib', 'adnib@example.com', 'adnib', 'Admin User', 'admin');