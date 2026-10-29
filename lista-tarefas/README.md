# Gerenciador de tarefas — PHP + React + TypeScript + MySQL

Projeto de exemplo do canal **Commitado**.

```
lista-tarefas/
├── banco.sql              ← cria o banco e as tarefas iniciais
├── api/
│   └── tarefas.php        ← API em PHP (GET lista, POST salva/exclui)
└── frontend/              ← React + TypeScript com Vite
    ├── index.html         ← título da aba: Projeto Commitado
    ├── vite.config.ts     ← porta 3000
    └── src/
        ├── main.tsx       ← ponto de entrada: monta o App na página
        ├── types.ts
        ├── App.tsx
        └── index.css
```

## Como rodar

1. Instale o **XAMPP** (https://www.apachefriends.org/) e, no XAMPP Control Panel, clique em **Start** no **Apache** e no **MySQL**.
2. Copie esta pasta `lista-tarefas` para dentro de `htdocs` (no Windows: `C:\xampp\htdocs\lista-tarefas`).
3. Abra `http://localhost/phpmyadmin`, vá na aba **SQL**, cole o conteúdo de `banco.sql` e execute.
4. Em `api/tarefas.php`, a senha do banco já vem vazia (`''`), que é o padrão do XAMPP. Só mude se o seu MySQL tiver senha.
5. Confira a API abrindo `http://localhost/lista-tarefas/api/tarefas.php` — deve aparecer um JSON com 2 tarefas.
6. Com o Node.js instalado, rode o front-end:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. Abra `http://localhost:3000/`.

## Resultado esperado

- Header: **Aprendendo PHP+React+MySQL** e "Projeto de exemplo do canal Commitado · 2 tarefas, 1 concluída"
- Linha 1: **Configurar o MySQL** — Pendente
- Linha 2: **Estudar React** — Concluída
- Salvar uma tarefa nova coloca ela no topo; a lixeira exclui do banco e da tela.

## Problemas comuns

- **Apache não liga:** outro programa está usando a porta 80. Feche-o ou troque a porta no botão *Config* do XAMPP e ajuste o endereço da API em `frontend/src/App.tsx` (ex.: `http://localhost:8080/lista-tarefas/api/tarefas.php`).
- **Aviso vermelho "Não foi possível carregar as tarefas":** a API não conseguiu falar com o banco. Confira se o MySQL está ligado no XAMPP e a senha do passo 4; a mensagem do aviso diz o motivo.
- **Sem Apache, teste rápido:** dentro de `api`, rode `php -S localhost:8000` e troque o endereço da API no `App.tsx` para `http://localhost:8000/tarefas.php`.
