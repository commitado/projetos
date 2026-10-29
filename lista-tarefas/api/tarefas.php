<?php
header('Content-Type: application/json; charset=utf-8');
// Libera o React tanto por localhost quanto por 127.0.0.1
$origensPermitidas = ['http://localhost:3000', 'http://127.0.0.1:3000'];
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origem, $origensPermitidas, true)) {
    header("Access-Control-Allow-Origin: $origem");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// O navegador manda um OPTIONS antes do POST para checar a permissão
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Conecta no MySQL: endereço e nome do banco, usuário e senha
// Se a conexão falhar, responde um JSON de erro em vez da página HTML do PHP
try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=commitado;charset=utf8mb4',
        'root',
        '', // no XAMPP o root vem sem senha
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION] // mostra os erros do banco
    );
} catch (PDOException $ex) {
    http_response_code(500);
    echo json_encode(['erro' => 'Não foi possível conectar ao banco: ' . $ex->getMessage()]);
    exit;
}

// GET: lista todas as tarefas
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $linhas = $pdo->query('SELECT id, titulo, concluida FROM tarefas ORDER BY id DESC') // a mais nova primeiro
        ->fetchAll(PDO::FETCH_ASSOC);

    $tarefas = array_map(fn ($t) => [
        'id'        => (int) $t['id'],
        'titulo'    => $t['titulo'],
        'concluida' => (bool) $t['concluida'],
    ], $linhas);

    echo json_encode($tarefas);
    exit;
}

// POST: salva ou exclui, de acordo com a "acao" enviada pelo React
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $acao = $dados['acao'] ?? 'salvar';

    // acao = excluir: apaga a tarefa pelo id
    if ($acao === 'excluir') {
        try {
            $id = (int) ($dados['id'] ?? 0);
            if (!$id) throw new Exception('ID inválido');

            /* Exclui a tarefa dentro de uma transação */
            $pdo->beginTransaction();
            $stmt = $pdo->prepare('DELETE FROM tarefas WHERE id = :id');
            $stmt->execute([':id' => $id]);
            $pdo->commit();

            echo json_encode(['mensagem' => 'Tarefa excluída com sucesso']);
        } catch (Exception $ex) {
            // Se algo deu errado, desfaz a transação
            if ($pdo->inTransaction()) $pdo->rollBack();

            http_response_code(400);
            echo json_encode(['erro' => $ex->getMessage()]);
        }
        exit;
    }

    // acao = salvar: grava uma tarefa nova
    $titulo = trim($dados['titulo'] ?? '');
    $concluida = !empty($dados['concluida']);

    if ($titulo === '') {
        http_response_code(422);
        echo json_encode(['erro' => 'Informe o título da tarefa']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO tarefas (titulo, concluida) VALUES (?, ?)');
    $stmt->execute([$titulo, $concluida ? 1 : 0]);

    http_response_code(201);
    echo json_encode([
        'id'        => (int) $pdo->lastInsertId(),
        'titulo'    => $titulo,
        'concluida' => $concluida,
    ]);
    exit;
}

// Qualquer outro método (PUT, DELETE...) não é aceito
http_response_code(405);
echo json_encode(['erro' => 'Método não permitido']);
