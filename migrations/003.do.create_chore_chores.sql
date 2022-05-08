CREATE TABLE chore_chores (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    house_id INTEGER REFERENCES chore_houses(id) ON DELETE CASCADE NOT NULL,
    assigned INTEGER REFERENCES chore_users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    done BOOLEAN NOT NULL
)