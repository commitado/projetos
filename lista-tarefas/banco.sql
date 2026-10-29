CREATE DATABASE commitado;
USE commitado;

CREATE TABLE tarefas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(120) NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO tarefas (titulo, concluida) VALUES
  ('Estudar React', TRUE),
  ('Configurar o MySQL', FALSE);

SELECT * FROM tarefas;
