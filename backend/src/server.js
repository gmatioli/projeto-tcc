const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');

//docs 
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');


const app = express();

// ==========================================
// Permissões para o upload SGSET
// ==========================================
// Adicione estas importações lá no topo do seu arquivo do servidor
const multer = require('multer');
// const fs = require('fs');
const csv = require('csv-parser');

// Configurando o Multer para salvar o arquivo temporariamente na pasta 'uploads'
const upload = multer({ dest: 'uploads/' });

// Função auxiliar para usar o db.query com 'await' (Isso evita o "Callback Hell")
const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// --- CONFIGURAÇÕES BÁSICAS ---
app.use(cors()); // Libera o acesso para o React
app.use(express.json()); // Permite que o Node entenda dados em formato JSON (importante para o login)

// ==========================================
// ROTA 1: CADASTRAR USUÁRIO (POST)
// ==========================================
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha, tipoAcesso } = req.body;

  // Trava de segurança no Backend: Verifica se é um email SENAI
  const emailValido = email.toLowerCase();
  if (!emailValido.includes('@') || !emailValido.includes('senai')) {
    return res.status(400).json({ sucesso: false, mensagem: "Email inválido. Use um email institucional do SENAI." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const sql = `INSERT INTO Usuario (nomeUsuario, emailInstitucional, senha, nivelAcesso) 
                 VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [nome, email, senhaCriptografada, tipoAcesso], (err, results) => {
      if (err) {
        console.error("Erro ao inserir no banco:", err);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar usuário no banco." });
      }
      res.status(201).json({ sucesso: true, mensagem: "Usuário cadastrado com sucesso!" });
    });

  } catch (erro) {
    console.error("Erro interno:", erro);
    res.status(500).json({ sucesso: false, mensagem: "Erro interno no servidor." });
  }
});


// ==========================================
// ROTA 2: FAZER O LOGIN (POST) - AGORA POR EMAIL
// ==========================================
app.post('/login', (req, res) => {
  // Alteramos para receber 'email' do frontend
  const { email, senha } = req.body; 

  // Busca APENAS pelo emailInstitucional
  const sql = "SELECT * FROM Usuario WHERE emailInstitucional = ?";
  
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).json({ erro: "Erro interno no servidor" });
    }

    if (results.length > 0) {
      const usuarioEncontrado = results[0];
      const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);

      if (senhaCorreta) {
        res.json({ sucesso: true, mensagem: "Login efetuado com sucesso!" });
      } else {
        res.status(401).json({ sucesso: false, mensagem: "Email ou senha incorretos." });
      }
      
    } else {
      res.status(401).json({ sucesso: false, mensagem: "Email ou senha incorretos." });
    }
  });
});


// ==========================================
// ROTA 3: LISTAR USUÁRIOS (GET)
// ==========================================
app.get('/usuarios', (req, res) => {
  // Busca apenas o ID e o Nome (não precisamos trazer a senha pro frontend!)
  const sql = "SELECT idUsuario, nomeUsuario FROM Usuario ORDER BY nomeUsuario ASC";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuários:", err);
      return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar a lista de usuários." });
    }
    res.json({ sucesso: true, usuarios: results });
  });
});

// ==========================================
// ROTA 4: ATUALIZAR SENHA DO USUÁRIO (PUT)
// ==========================================
app.put('/usuarios/senha', async (req, res) => {
  const { idUsuario, novaSenha } = req.body;

  try {
    // 1. Criptografa a nova senha gerada pelo admin
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(novaSenha, salt);

    // 2. Atualiza no banco de dados
    const sql = "UPDATE Usuario SET senha = ? WHERE idUsuario = ?";
    
    db.query(sql, [senhaCriptografada, idUsuario], (err, results) => {
      if (err) {
        console.error("Erro ao atualizar senha:", err);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar a senha no banco." });
      }
      res.json({ sucesso: true, mensagem: "Senha atualizada com sucesso!" });
    });

  } catch (erro) {
    console.error("Erro interno:", erro);
    res.status(500).json({ sucesso: false, mensagem: "Erro interno no servidor." });
  }
});

// ==========================================
// ROTA 5: BUSCAR DADOS DO PERFIL (GET)
// ==========================================
app.get('/perfil/:email', (req, res) => {
  const emailLogado = req.params.email;
  
  const sql = "SELECT nomeUsuario, emailInstitucional, nivelAcesso FROM Usuario WHERE emailInstitucional = ?";  
  
  db.query(sql, [emailLogado], (err, results) => {
    if (err) {
      console.error("Erro ao buscar perfil:", err);
      return res.status(500).json({ sucesso: false, mensagem: "Erro no servidor." });
    }
    
    // Se encontrou o usuário, devolve os dados para o React
    if (results.length > 0) {
      res.json({ sucesso: true, usuario: results[0] });
    } else {
      res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado." });
    }
  });
});

// ==========================================
// ROTA 6: UPLOAD DA PLANILHA SGSET (POST)
// ==========================================
app.post('/upload-planilha', upload.single('arquivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ sucesso: false, mensagem: "Nenhum arquivo enviado." });
  }

  // --- TRUQUE DE AUTO-DETEÇÃO DO SEPARADOR ---
  // Lemos o ficheiro e apanhamos apenas a primeira linha (o cabeçalho)
  const conteudoFicheiro = fs.readFileSync(req.file.path, 'utf-8');
  const primeiraLinha = conteudoFicheiro.split('\n')[0];
  
  // Se a primeira linha tiver um ';', usamos isso. Caso contrário, usamos ','
  const separadorDetectado = primeiraLinha.includes(';') ? ';' : ',';
  // -------------------------------------------

  const resultados = [];

  // Lê o arquivo CSV que acabou de ser feito o upload
  fs.createReadStream(req.file.path)
    .pipe(csv({ separator: separadorDetectado }))
    .on('data', (data) => resultados.push(data))
    .on('end', async () => {
      try {
        // 1. Limpa a tabela temporária (Staging) para não misturar com envios antigos
        await queryAsync('TRUNCATE TABLE tblAluno_copy1', []);

        // 2. Insere os dados brutos na tabela temporária tblAluno_copy1
        for (const linha of resultados) {
          const nomeDaPrimeiraColuna = Object.keys(linha)[0];
          const valorMatricula = linha['N° de Matrícula'] || linha[nomeDaPrimeiraColuna]

          if(!valorMatricula){
            continue;
          }

          const sqlCopy = `INSERT INTO tblAluno_copy1 
            (matricula, nome, tipoCurso, areaCurso, curso, turma, \`AE/AD\`, praticaProfissional, horasPratica, empresaContrato) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          
          await queryAsync(sqlCopy, [
            valorMatricula, 
            linha['Nome'], 
            linha['Tipo de Curso'], 
            linha['Área do Curso'], 
            linha['Curso'], 
            linha['Turma'], 
            linha['AE/AD'], 
            linha['Prát. Prof. na Empresa com o emprego da guia de aprendizagem?'], 
            linha['Prát. Prof. a ser desenvolvida exclusivamente na empresa (Horas)'] || 0, 
            linha['Empresa do contrato de aprendizagem']
          ]);
        }

        // ==========================================================
        // 3. A MÁGICA DO ETL (Distribuindo para as tabelas oficiais)
        // ==========================================================
        
        const dadosBrutos = await queryAsync('SELECT * FROM tblAluno_copy1', []);

        for (const aluno of dadosBrutos) {
          // A. Verifica/Cria o CURSO
          let idCurso;
          const cursoExiste = await queryAsync('SELECT idCurso FROM Cursos WHERE nomeCurso = ?', [aluno.curso]);
          if (cursoExiste.length > 0) {
            idCurso = cursoExiste[0].idCurso;
          } else {
            const novoCurso = await queryAsync('INSERT INTO Cursos (nomeCurso, tipo, area) VALUES (?, ?, ?)', [aluno.curso, aluno.tipoCurso, aluno.areaCurso]);
            idCurso = novoCurso.insertId;
          }

          // B. Verifica/Cria a TURMA
          let idTurma;
          const turmaExiste = await queryAsync('SELECT idTurma FROM Turma WHERE codigo = ?', [aluno.turma]);
          if (turmaExiste.length > 0) {
            idTurma = turmaExiste[0].idTurma;
          } else {
           const novaTurma = await queryAsync(
              'INSERT INTO Turma (codigo, semestreAtual, Cursos_idCurso) VALUES (?, ?, ?)', 
              [aluno.turma, null, idCurso]
            );
            idTurma = novaTurma.insertId;
          }

          // C. Verifica/Cria a EMPRESA
          let idEmpresa;
          const empresaExiste = await queryAsync('SELECT idEmpresa FROM Empresa WHERE empresaContrato = ?', [aluno.empresaContrato]);
          if (empresaExiste.length > 0) {
            idEmpresa = empresaExiste[0].idEmpresa;
          } else {
            const novaEmpresa = await queryAsync('INSERT INTO Empresa (`AE/AD`, praticaProfissional, horasPratica, empresaContrato) VALUES (?, ?, ?, ?)', [aluno['AE/AD'], aluno.praticaProfissional, aluno.horasPratica, aluno.empresaContrato]);
            idEmpresa = novaEmpresa.insertId;
          }

          // D. Verifica/Cria o ALUNO na tabela oficial (tblAluno limpa)
          const alunoExiste = await queryAsync('SELECT idtblAluno FROM tblAluno WHERE matricula = ?', [aluno.matricula]);
          if (alunoExiste.length === 0) {
             await queryAsync('INSERT INTO tblAluno (matricula, nome, Empresa_idEmpresa, Turma_idTurma) VALUES (?, ?, ?, ?)', [aluno.matricula, aluno.nome, idEmpresa, idTurma]);
          }
        }

        // Apaga o arquivo temporário da pasta uploads
        fs.unlinkSync(req.file.path);

        res.json({ sucesso: true, mensagem: "Planilha processada e banco de dados alimentado com sucesso!" });

      } catch (erro) {
        console.error("Erro ao processar planilha:", erro);
        res.status(500).json({ sucesso: false, mensagem: "Erro ao processar os dados da planilha." });
        
      }
    });
});


//================================================
// rota p gerar o docs
app.post('/gerar-doc', (req, res) => {

  try {

    const {
      conselho,
      semestre,
      ano,
      data
    } = req.body;

    // caminho correto do template
    const templatePath = path.join(
      __dirname,
      '../docs/template.docx'
    );

    // lê template
    const content = fs.readFileSync(
      templatePath,
      'binary'
    );

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // substitui campos
    doc.setData({
      tipo_conselho: conselho,
      semestre: semestre,
      ano: ano,
      data_conselho: data
    });

    doc.render();

    const buffer = doc.getZip().generate({
      type: 'nodebuffer'
    });

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=ata.docx'
    );

    res.send(buffer);

  } catch (error) {

    console.log(error);

    res.status(500).send('Erro ao gerar documento');
  }
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
// Isso sempre tem que ser a última coisa do arquivo!
app.listen(3001, () => {
  console.log("Servidor rodando perfeitamente na porta 3001");
});