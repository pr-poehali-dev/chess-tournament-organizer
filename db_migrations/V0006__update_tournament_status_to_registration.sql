-- Обновляем статус турниров с planned на registration для тестирования
UPDATE t_p67413675_chess_tournament_org.tournaments 
SET status = 'registration' 
WHERE status = 'planned' AND start_date >= CURRENT_DATE;