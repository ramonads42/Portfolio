const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'unlock',
  database: 'meubanco'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.stack);
    process.exit(1); 
  }
  console.log('Conectado ao MySQL com sucesso!');
  mainInsertProcess();
});

// inserir Projeto
async function _insertProjectInternal(nome, descricao, tecnologias, pdfSourcePath = null) {
    let pdf_path_db = null;
    if (pdfSourcePath) {
        const uploadDir = path.join(__dirname, 'public', 'uploads', 'projetos');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const originalFileName = path.basename(pdfSourcePath);
        const fileName = `${Date.now()}-${originalFileName}`;
        const destinationPath = path.join(uploadDir, fileName);
        try {
            fs.copyFileSync(pdfSourcePath, destinationPath);
            pdf_path_db = `/uploads/projetos/${fileName}`;
            console.log(`  > PDF copiado para projetos: ${destinationPath}`);
        } catch (copyError) {
            console.error(`  > ERRO ao copiar PDF para projeto: ${copyError.message}`);
            pdf_path_db = null;
        }
    }
    const sql = 'INSERT INTO projetos (nome, descricao, tecnologias, pdf_path) VALUES (?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
        db.query(sql, [nome, descricao, tecnologias, pdf_path_db], (err, result) => {
            if (err) { console.error('Erro ao inserir projeto:', err); return reject(err); }
            console.log(`  > Projeto "${nome}" inserido. ID: ${result.insertId}`);
            resolve(result);
        });
    });
}

// inserir Publicação
async function _insertPublicationInternal(titulo, descricao, pdfSourcePath = null) {
    let pdf_path_db = null;
    if (pdfSourcePath) {
        const uploadDir = path.join(__dirname, 'public', 'uploads', 'publicacoes');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const originalFileName = path.basename(pdfSourcePath);
        const fileName = `${Date.now()}-${originalFileName}`;
        const destinationPath = path.join(uploadDir, fileName);
        try {
            fs.copyFileSync(pdfSourcePath, destinationPath);
            pdf_path_db = `/uploads/publicacoes/${fileName}`;
            console.log(`  > PDF copiado para publicações: ${destinationPath}`);
        } catch (copyError) {
            console.error(`  > ERRO ao copiar PDF para publicação: ${copyError.message}`);
            pdf_path_db = null;
        }
    }
    const sql = 'INSERT INTO publicacoes (titulo, descricao, pdf_path) VALUES (?, ?, ?)';
    return new Promise((resolve, reject) => {
        db.query(sql, [titulo, descricao, pdf_path_db], (err, result) => {
            if (err) { console.error('Erro ao inserir publicação:', err); return reject(err); }
            console.log(`  > Publicação "${titulo}" inserida. ID: ${result.insertId}`);
            resolve(result);
        });
    });
}

const itemType = 'publicacao'; // 'projeto' OU 'publicacao' 

// --- Configuração para PROJETOS ---

const projectData = {
    nome: '',
    descricao: '',
    tecnologias: '',
    // Caminho COMPLETO do PDF
    // Ex: '/uploads/projetos/meu_projeto_existente.pdf'
    pdfPath: path.join(__dirname, '')
};

// Configuração para PUBLICAÇÕES
const publicationData = {
    titulo: 'A LOGISTICA DE SUPRIMENTOS',
    descricao: 'Trabalho de Graduação apresentado à Faculdade de Tecnologia de São José dos Campos, como parte dos requisitos necessários para a obtenção da média semestral de Métodos para a Produção de Conhecimento.',
    pdfPath: '/relatorio/ALOGISTICADESUPRIMENTOS.docx.pdf' // <<-- ALTERE O CAMINHO OU COLOQUE null
};


// PROCESSO DE INSERÇÃO PRINCIPAL
async function mainInsertProcess() {
    try {
        if (itemType === 'projeto') {
            console.log(`\nPreparando para inserir um PROJETO: ${projectData.nome}`);
            await _insertProjectInternal(
                projectData.nome,
                projectData.descricao,
                projectData.tecnologias,
                projectData.pdfPath
            );
        } else if (itemType === 'publicacao') {
            console.log(`\nPreparando para inserir uma PUBLICAÇÃO: ${publicationData.titulo}`);
            await _insertPublicationInternal(
                publicationData.titulo,
                publicationData.descricao,
                publicationData.pdfPath
            );
        } else {
            console.error('\nErro: Tipo de item inválido. Defina "itemType" como "projeto" ou "publicacao".');
        }
        console.log('\n--- Processo de Inserção Concluído ---');
    } catch (error) {
        console.error('\n--- ERRO DURANTE A INSERÇÃO DE DADOS ---');
        console.error(error);
    } finally {
        db.end();
        console.log('\nConexão com o MySQL encerrada.');
    }
}
