import { useEffect, useState } from 'react';
import type { Tarefa } from './types';

// Endereço da API em PHP
const API = 'http://localhost/lista-tarefas/api/tarefas.php';

export default function App() {
  // Estados: a lista de tarefas e os dois campos do formulário
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [titulo, setTitulo] = useState('');
  const [concluida, setConcluida] = useState(false);
  // Mensagem de erro mostrada na tela quando a API falha
  const [erro, setErro] = useState('');

  // Quando a tela abre, busca as tarefas no PHP (GET)
  useEffect(() => {
    fetch(API)
      .then(async (resposta) => {
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro ?? 'Erro ao buscar as tarefas');
        setTarefas(dados);
      })
      .catch((e) => setErro(`Não foi possível carregar as tarefas: ${e.message}`));
  }, []);

  // Envia a nova tarefa para o PHP (POST com acao 'salvar') e coloca na tabela
  async function salvar() {
    if (!titulo.trim()) return;

    try {
      const resposta = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'salvar', titulo, concluida }),
      });
      const dados = await resposta.json();
      // Só coloca na tabela se o PHP confirmou que salvou
      if (!resposta.ok) throw new Error(dados.erro ?? 'Erro ao salvar a tarefa');

      const nova: Tarefa = dados;
      setTarefas((atuais) => [nova, ...atuais]); // a mais nova vai para o topo
      setTitulo('');
      setConcluida(false);
      setErro('');
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  // Pede ao PHP para excluir (POST com acao 'excluir') e tira a linha da tabela
  async function excluir(id: number) {
    try {
      const resposta = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'excluir', id }),
      });
      const dados = await resposta.json();
      // Só tira da tabela se o PHP confirmou que excluiu
      if (!resposta.ok) throw new Error(dados.erro ?? 'Erro ao excluir a tarefa');

      setTarefas((atuais) => atuais.filter((t) => t.id !== id));
      setErro('');
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  // Quantas tarefas já estão concluídas (para o contador do header, com singular e plural)
  const concluidas = tarefas.filter((t) => t.concluida).length;

  return (
    <main>
      {/* Header com o nome do projeto e o contador */}
      <header>
        <h1>Aprendendo PHP+React+MySQL</h1>
        <p>Projeto de exemplo do canal Commitado · {tarefas.length} {tarefas.length === 1 ? 'tarefa' : 'tarefas'}, {concluidas} {concluidas === 1 ? 'concluída' : 'concluídas'}</p>
      </header>

      {/* Aviso de erro: só aparece quando a API falha */}
      {erro && <p className="erro">{erro}</p>}

      {/* Formulário: o preventDefault evita que a página recarregue */}
      <form onSubmit={(e) => { e.preventDefault(); salvar(); }}>
        <input
          placeholder="Nova tarefa"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={concluida}
            onChange={(e) => setConcluida(e.target.checked)}
          />
          Concluída
        </label>
        <button>Salvar</button>
      </form>

      {/* Tabela com as tarefas que vieram do banco */}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tarefas.map((tarefa, indice) => (
            <tr key={tarefa.id}>
              {/* Número da linha pela posição na lista: 1, 2, 3... */}
              <td>{indice + 1}</td>
              <td>{tarefa.titulo}</td>
              {/* A classe "concluida" deixa o status verde */}
              <td className={tarefa.concluida ? 'status concluida' : 'status'}>
                {tarefa.concluida ? 'Concluída' : 'Pendente'}
              </td>
              {/* Botão de lixeira: exclui esta tarefa */}
              <td>
                <button className="lixeira" onClick={() => excluir(tarefa.id)} aria-label="Excluir tarefa">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
