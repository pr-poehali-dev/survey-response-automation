CREATE TABLE IF NOT EXISTS result_patterns (
    id SERIAL PRIMARY KEY,
    result_text TEXT NOT NULL,
    answer_pattern JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO result_patterns (result_text, answer_pattern, priority) VALUES
    ('Результат 1: Вы выбрали "Да" только на первый вопрос', '{"1": true, "2": false, "3": false, "4": false, "5": false}', 1),
    ('Вы прирожденный лидер! У вас отличные навыки коммуникации и адаптации.', '{"1": true, "2": true, "3": true, "4": true, "5": true}', 2),
    ('Результат по умолчанию: спасибо за прохождение опросника!', '{}', 999);