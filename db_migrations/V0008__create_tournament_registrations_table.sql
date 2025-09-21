CREATE TABLE t_p67413675_chess_tournament_org.tournament_registrations (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES t_p67413675_chess_tournament_org.tournaments(id),
    user_id INTEGER NOT NULL REFERENCES t_p67413675_chess_tournament_org.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('pending', 'registered', 'cancelled', 'rejected')),
    registration_date TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);