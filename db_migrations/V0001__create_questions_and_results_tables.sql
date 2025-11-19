CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS result_rules (
    id SERIAL PRIMARY KEY,
    min_yes INTEGER NOT NULL,
    max_yes INTEGER NOT NULL,
    result_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO questions (text, position) VALUES
    ('Вы любите работать в команде?', 1),
    ('Вам нравится решать сложные задачи?', 2),
    ('Вы предпочитаете планировать заранее?', 3),
    ('Вы легко адаптируетесь к изменениям?', 4),
    ('Вам важна обратная связь от других?', 5);

INSERT INTO result_rules (min_yes, max_yes, result_text) VALUES
    (5, 5, 'Вы прирожденный лидер! У вас отличные навыки коммуникации и адаптации. Вы умеете работать в команде и находить решения в любых ситуациях.'),
    (3, 4, 'Вы сбалансированная личность! Вы гибки в подходах и умеете находить компромиссы. У вас есть потенциал для роста в разных направлениях.'),
    (1, 2, 'Вы индивидуалист! Вы цените самостоятельность и предпочитаете работать в своем темпе. Это ценное качество для глубокой концентрации на задачах.'),
    (0, 0, 'Вы независимый мыслитель! Вы идете своим путем и не боитесь быть уникальным. Ваша самодостаточность — ваша сила.');