// server.js — Integração Express + Supabase (Aula 12: CRUD - Create)
// Tema: Academia & Musculação (Aluno 02)
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================================================
// MIDDLEWARES ESSENCIAIS
// =========================================================================
app.use(cors());
app.use(express.json());

// Rota de saúde da API
app.get('/', (req, res) => {
  res.json({ 
    status: 'API Academia Online 💪', 
    aula: '12 - CRUD Create (POST)' 
  });
});

// =========================================================================
// [R] READ — Rota para listar todos os alunos matriculados
// =========================================================================
app.get('/api/alunos-academia', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('alunos_academia')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return res.status(400).json({ erro: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno ao buscar alunos matriculados.' });
  }
});

// =========================================================================
// [C] CREATE — Rota Principal: Matrícula de novos alunos
// =========================================================================
app.post('/api/alunos-academia', async (req, res) => {
  try {
    // 1. Desempacotando o payload JSON enviado pelo cliente
    const { nome, plano, mensalidade, ativo } = req.body;

    // 2. Validação obrigatória conforme a ficha: nome, plano e mensalidade
    if (!nome || !plano || mensalidade === undefined) {
      return res.status(400).json({
        erro: 'Os campos "nome", "plano" e "mensalidade" são obrigatórios!'
      });
    }

    // 3. Persistindo no Supabase e retornando o registro criado (.select())
    const { data, error } = await supabase
      .from('alunos_academia')
      .insert([
        {
          nome: nome,
          plano: plano,
          mensalidade: mensalidade,
          // Caso 'ativo' não seja enviado, assume true como padrão (igual ao SQL)
          ativo: ativo !== undefined ? ativo : true
        }
      ])
      .select();

    // 4. Tratamento de erro retornado pelo Supabase/PostgreSQL
    if (error) {
      return res.status(400).json({ erro: error.message });
    }

    // 5. Resposta 201 Created com o ID da matrícula
    return res.status(201).json({
      mensagem: 'Matrícula realizada com sucesso!',
      id_matricula: data[0].id,
      registro: data[0]
    });

  } catch (err) {
    console.error('Erro inesperado:', err);
    return res.status(500).json({ erro: 'Falha interna no servidor.' });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor da Academia rodando em http://localhost:${PORT}`);
});