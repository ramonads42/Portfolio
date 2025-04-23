const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

// Rota página inicial
app.get('/', (req, res) => {
    const dados = {
        titulo: 'Ramon Amorim da Silva',
        nome: 'Ramon Amorim da Silva',
        descricao: 'Olá! Sou Ramon Amorim da Silva, estudante de Análise e Desenvolvimento de Sistemas na FATEC de São José dos Campos. Procuro aprofundar meus conhecimentos técnicos em desenvolvimento de software, explorando diferentes linguagens de programação, metodologias e tecnologias que são essenciais no mercado atual. Profissionalmente, busco oportunidades que me permitam aplicar essas habilidades em ambientes reais.',
        apresentacao: {
            titulo: 'Apresentação',
            descricao: 'Sou Ramon Amorim da Silva, atualmente cursando Análise e Desenvolvimento de Sistemas na FATEC de São José dos Campos. Busco oportunidades para aplicar e expandir meus conhecimentos técnicos na área de desenvolvimento de software.'
        },
        formacao: [
            {  status: 'Cursando', curso:  'Análise e Desenvolvimento de Sistemas - FATEC São José dos Campos' },
            {  status: 'Incompleto', curso: 'Logística - FATEC São José dos Campos' }
        ],
        habilidades: {
            programacao: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Node.js'],

            ferramentas: ['VS Code', 'Jira'],
            frameworks: ['Express', 'Bootstrap']
        },
        projetoDestaque: {
            nome: 'Projeto Integrador (API) - Aeroporto SJK',
            descricao: 'Mapeamento de potenciais cargas para movimentação no aeroporto SJK'
        }
    };
    res.render('index', dados);
});

// Rota projetos
app.get('/projetos', (req, res) => {
  const projetos = [
      { 
          nome: 'Projeto Integrador (API)', 
          descricao: 'O projeto integrador (API) é um projeto pedagógico, onde o ensino é focado no desenvolvimento de um produto que auxilia visualizar e mapear potenciais cargas para movimentação no aeroporto SJK com base em dados de importações de municípios da região do Vale do Paraíba e Litoral Norte no ano de 2024.',
          tecnologias: ['GitHub', 'Jira Software', 'Power BI', 'Slack'],

      },
      { 
          nome: 'Projeto 1', 
          descricao: 'Descrição do projeto 1',
          tecnologias: ['HTML', 'CSS', 'JavaScript'] 
      },
      { 
          nome: 'Projeto 2', 
          descricao: 'Descrição do projeto 2',
          tecnologias: ['Node.js', 'Express', 'MongoDB'] 
      }
  ];
  res.render('projetos', { titulo: 'Meus Projetos', projetos });
  
});

// Rota publicações
app.get('/publicacoes', (req, res) => {
    const publicacoes = [
        {
            titulo: 'A Logística de Suprimentos',
            descricao: 'Um relato sobre os processos da logistica de suprimentos.'
        },


    ];
    res.render('publicacoes', { titulo: 'Minhas Publicações', publicacoes });
});

// Rota projetos
app.get('/projetos', (req, res) => {
    res.render('projetos', { titulo: 'Meus Projetos', projetos });
    
  });

// Rota detalhes projeto API logística
app.get('/projetos/api', (req, res) => {
    res.render('projeto-api', { titulo: 'Projeto Integrador (API) - Aeroporto SJK' });
});

// Rota para página de habilidades
app.get('/habilidades', (req, res) => {
    const habilidades = {
        programacao: [
            { nome: 'HTML', nivel: 85 },
            { nome: 'CSS', nivel: 75 },
            { nome: 'JavaScript', nivel: 70 },
            { nome: 'Node.js', nivel: 60 }
        ],
        ferramentas: ['GitHub', 'VS Code', 'Jira Software', 'Power BI', 'Slack'],
        frameworks: ['Express', 'Bootstrap']
    };
    
    res.render('habilidades', { titulo: 'Minhas Habilidades', habilidades });
});

// Rota para página de contato
app.get('/contato', (req, res) => {
    const contato = {
        email: 'ramonads.42@gmail.com',
        linkedin: 'linkedin.com/in/ramonamorimdasilva',
        github: 'github.com/ramonads42'
    };
    
    res.render('contato', { titulo: 'Contato', contato });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

