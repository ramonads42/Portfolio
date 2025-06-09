const mysql = require('mysql2');


// --- EXEMPLO DE USO ---
// Para usar, execute este script no terminal e passe os argumentos.
// Ex: node excluirdados.js projeto '10'
// Ex: node excluirdados.js publicacao '10'



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
  console.log('Conectado ao MySQL!');
});

async function deleteItem(tipo, id) {
    let tableName;
    if (tipo === 'projeto') {
        tableName = 'projetos';
    } else if (tipo === 'publicacao') {
        tableName = 'publicacoes';
    } else {
        console.error('Tipo inválido. Use "projeto" ou "publicacao".');
        db.end();
        return;
    }

    const sql = `DELETE FROM ${tableName} WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error(`Erro ao excluir ${tipo} (ID: ${id}):`, err);
                return reject(err);
            }
            if (result.affectedRows === 0) {
                console.log(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} com ID ${id} não encontrado.`);
            } else {
                console.log(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} com ID ${id} excluído com sucesso.`);
            }
            resolve(result);
        });
    });
}

const args = process.argv.slice(2); 
const tipo = args[0]; 
const id = parseInt(args[1], 10); 

if (!tipo || isNaN(id)) {
    console.log('Uso: node deleteData.js <tipo> <id>');
    console.log('Exemplo: node deleteData.js projeto 1');
    console.log('Exemplo: node deleteData.js publicacao 2');
    db.end();
    process.exit(1);
}

deleteItem(tipo, id)
    .then(() => {
        db.end(); 
        console.log('Operação de exclusão concluída.');
    })
    .catch(error => {
        console.error('Erro na operação de exclusão:', error);
        db.end();
    });