const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method')); 

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'unlock', 
  database: 'meubanco'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.stack);
    return;
  }
  console.log('Conectado ao MySQL com o ID:', db.threadId);
});

// --- Configuração do Multer para Upload de PDFs ---
const createUploadDirectory = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storageProjetos = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/projetos';
        createUploadDirectory(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const storagePublicacoes = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/publicacoes';
        createUploadDirectory(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const uploadProjeto = multer({ storage: storageProjetos });
const uploadPublicacao = multer({ storage: storagePublicacoes });

// --- Rotas do Portfólio (Existentes e Modificadas) ---

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



// Listar todos os projetos para a página de projetos EJS
app.get('/projetos', (req, res) => {
  db.query('SELECT * FROM projetos', (err, results) => {
    if (err) {
        console.error('Erro ao buscar projetos:', err);
        return res.status(500).send('Erro ao buscar projetos.');
    }
    res.render('projetos', { titulo: 'Meus Projetos', projetos: results });
  });
});

// Formulário para criar novo projeto
app.get('/projetos/novo', (req, res) => {
    res.render('novo-projeto', { titulo: 'Adicionar Novo Projeto' });
});

// Criar novo projeto com upload de PDF
app.post('/projetos', uploadProjeto.single('pdfProjeto'), (req, res) => {
  const { nome, descricao, tecnologias } = req.body;
  const pdf_path = req.file ? `/uploads/projetos/${req.file.filename}` : null; 
  const sql = 'INSERT INTO projetos (nome, descricao, tecnologias, pdf_path) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome, descricao, tecnologias, pdf_path], (err, result) => {
    if (err) {
        console.error('Erro ao inserir projeto:', err);
        return res.status(500).send('Erro ao inserir projeto.');
    }
    res.redirect('/projetos'); // Redireciona para a lista de projetos após a criação
  });
});

// Buscar um projeto específico 
app.get('/projetos/:id', (req, res) => {
  db.query('SELECT * FROM projetos WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
        console.error('Erro ao buscar projeto por ID:', err);
        return res.status(500).send('Erro ao buscar projeto.');
    }
    if (result.length === 0) return res.status(404).send('Projeto não encontrado');

    res.render('detalhes-projeto', { titulo: result[0].nome, projeto: result[0] });
  });
});

// NOVO: Rota para exibir o formulário de edição de projeto
app.get('/projetos/:id/editar', (req, res) => {
    db.query('SELECT * FROM projetos WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Erro ao buscar projeto para edição:', err);
            return res.status(500).send('Erro ao buscar projeto para edição.');
        }
        if (result.length === 0) return res.status(404).send('Projeto não encontrado para edição');

        res.render('editar-projeto', { titulo: `Editar Projeto: ${result[0].nome}`, projeto: result[0] });
    });
});


app.post('/projetos/:id', uploadProjeto.single('pdfProjeto'), (req, res) => {
    const { nome, descricao, tecnologias } = req.body;
    const projectId = req.params.id;
    let sql = 'UPDATE projetos SET nome = ?, descricao = ?, tecnologias = ? WHERE id = ?';
    let params = [nome, descricao, tecnologias, projectId];

    // Verifica se um novo PDF foi enviado
    if (req.file) {
        const pdf_path = `/uploads/projetos/${req.file.filename}`;
        sql = 'UPDATE projetos SET nome = ?, descricao = ?, tecnologias = ?, pdf_path = ? WHERE id = ?';
        params = [nome, descricao, tecnologias, pdf_path, projectId];
    }

    db.query(sql, params, (err) => {
        if (err) {
            console.error('Erro ao atualizar projeto:', err);
            return res.status(500).send('Erro ao atualizar projeto.');
        }
        res.redirect(`/projetos/${projectId}`); // Redireciona para os detalhes do projeto após a atualização
    });
});

// DELETE Projeto
app.delete('/projetos/:id', (req, res) => {
  db.query('DELETE FROM projetos WHERE id = ?', [req.params.id], (err) => {
    if (err) {
        console.error('Erro ao excluir projeto:', err);
        return res.status(500).send('Erro ao excluir projeto.');
    }
    res.redirect('/projetos'); // Redireciona de volta para a lista de projetos
  });
});


// --- Rotas para Gerenciamento de Publicações ---

// Listar todas as publicações para a página de publicações EJS
app.get('/publicacoes', (req, res) => {
  db.query('SELECT * FROM publicacoes', (err, results) => {
    if (err) {
        console.error('Erro ao buscar publicações:', err);
        return res.status(500).send('Erro ao buscar publicações.');
    }
    res.render('publicacoes', { titulo: 'Minhas Publicações', publicacoes: results });
  });
});

// GET - Formulário para criar nova publicação
app.get('/publicacoes/nova', (req, res) => {
    res.render('nova-publicacao', { titulo: 'Adicionar Nova Publicação' });
});

// POST - Criar nova publicação com upload de PDF
app.post('/publicacoes', uploadPublicacao.single('pdfPublicacao'), (req, res) => {
  const { titulo, descricao } = req.body;
  const pdf_path = req.file ? `/uploads/publicacoes/${req.file.filename}` : null;
  const sql = 'INSERT INTO publicacoes (titulo, descricao, pdf_path) VALUES (?, ?, ?)';
  db.query(sql, [titulo, descricao, pdf_path], (err, result) => {
    if (err) {
        console.error('Erro ao inserir publicação:', err);
        return res.status(500).send('Erro ao inserir publicação.');
    }
    res.redirect('/publicacoes');
  });
});

// DELETE Publicação
app.delete('/publicacoes/:id', (req, res) => {
  db.query('DELETE FROM publicacoes WHERE id = ?', [req.params.id], (err) => {
    if (err) {
        console.error('Erro ao excluir publicação:', err);
        return res.status(500).send('Erro ao excluir publicação.');
    }
    res.redirect('/publicacoes'); // Redireciona de volta para a lista de publicações
  });
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

// Rota para página de contato (mantida estática)
app.get('/contato', (req, res) => {
    const contato = {
        email: 'ramonads.42@gmail.com',
        linkedin: 'linkedin.com/in/ramonamorimdasilva',
        github: 'github.com/ramonads42'
    };

    res.render('contato', { titulo: 'Contato', contato });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});