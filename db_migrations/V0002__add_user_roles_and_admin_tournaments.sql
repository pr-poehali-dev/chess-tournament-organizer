-- Добавляем поле роли пользователя
ALTER TABLE t_p67413675_chess_tournament_org.users 
ADD COLUMN role VARCHAR(20) DEFAULT 'player';

-- Добавляем индекс для быстрого поиска по ролям
CREATE INDEX idx_users_role ON t_p67413675_chess_tournament_org.users (role);

-- Добавляем ограничение на возможные роли
ALTER TABLE t_p67413675_chess_tournament_org.users 
ADD CONSTRAINT check_user_role 
CHECK (role IN ('player', 'admin', 'moderator'));

-- Создаем администратора с логином admin и паролем 7gp7yfwx
INSERT INTO t_p67413675_chess_tournament_org.users (
    username,
    email, 
    password_hash,
    full_name,
    user_type,
    role,
    is_active
) VALUES (
    'admin',
    'admin@chess-tournament.org',
    '$2b$12$LQv3c4yqdyOUm.Hiep/gUeN6EzNI05o/XyP8YZyTB2Qc.gEA7q1Kq', -- хеш для пароля 7gp7yfwx  
    'Администратор системы',
    'admin',
    'admin',
    true
);

-- Создаем таблицу турниров для управления
CREATE TABLE IF NOT EXISTS t_p67413675_chess_tournament_org.tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(300),
    max_participants INTEGER DEFAULT 100,
    registration_deadline DATE,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    prize_fund DECIMAL(10,2) DEFAULT 0,
    tournament_type VARCHAR(50) DEFAULT 'swiss',
    time_control VARCHAR(100),
    rounds INTEGER DEFAULT 9,
    status VARCHAR(20) DEFAULT 'planned',
    created_by INTEGER REFERENCES t_p67413675_chess_tournament_org.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_tournament_status CHECK (status IN ('planned', 'registration', 'active', 'completed', 'cancelled')),
    CONSTRAINT check_tournament_type CHECK (tournament_type IN ('swiss', 'round_robin', 'knockout', 'arena'))
);

-- Добавляем индексы для быстрого поиска турниров
CREATE INDEX idx_tournaments_status ON t_p67413675_chess_tournament_org.tournaments (status);
CREATE INDEX idx_tournaments_start_date ON t_p67413675_chess_tournament_org.tournaments (start_date);
CREATE INDEX idx_tournaments_created_by ON t_p67413675_chess_tournament_org.tournaments (created_by);