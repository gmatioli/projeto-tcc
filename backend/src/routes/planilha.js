const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');

const upload = multer({ dest: 'uploads/' });

// ==========================================
// ROTA: UPLOAD DA PLANILHA SGSET (POST)
// ==========================================
router.post('/upload-planilha', upload.single('arquivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo enviado.' });
  }

  // Auto-detecção do separador (vírgula ou ponto-e-vírgula)
  const conteudoFicheiro = fs.readFileSync(req.file.path, 'utf-8');
  const primeiraLinha = conteudoFicheiro.split('\n')[0];
  const separadorDetectado = primeiraLinha.includes(';') ? ';' : ',';

  const resultados = [];

  fs.createReadStream(req.file.path)
    .pipe(csv({ separator: separadorDetectado }))
    .on('data', (data) => resultados.push(data))
    .on('end', async () => {
      try {

        // 1. Limpa a tabela de staging
        await db.query('TRUNCATE TABLE "tblAluno_copy1"');

        // 2. Insere dados brutos no staging
        for (const linha of resultados) {
          const nomeDaPrimeiraColuna = Object.keys(linha)[0];
          const valorMatricula =
            linha['N° de Matrícula'] ||
            linha['Nº de Matrícula'] ||
            linha[nomeDaPrimeiraColuna];

          if (!valorMatricula) continue;

          await db.query(
            `INSERT INTO "tblAluno_copy1"
             ("matricula","nome","tipoCurso","areaCurso","curso","turma",
              "AE/AD","praticaProfissional","horasPratica","empresaContrato")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
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
            ]
          );
        }

        // 3. ETL — distribui para as tabelas oficiais
        const dadosBrutos = await db.query('SELECT * FROM "tblAluno_copy1"');

        for (const aluno of dadosBrutos.rows) {

          // A. Verifica/Cria o CURSO
          let idCurso;
          const cursoExiste = await db.query(
            `SELECT "idCurso" FROM "Cursos" WHERE "nomeCurso" = $1`,
            [aluno.curso]
          );
          if (cursoExiste.rows.length > 0) {
            idCurso = cursoExiste.rows[0].idCurso;
          } else {
            console.log('Dados do aluno no ETL:', aluno);
           const novoCurso = await db.query(
            `INSERT INTO "Cursos" ("nomeCurso","tipo","area")
            VALUES ($1,$2,$3) RETURNING "idCurso"`,
            [aluno.curso, aluno.tipoCurso, aluno.areaCurso]
            );

            
            idCurso = novoCurso.rows[0].idCurso;
          }

          // B. Verifica/Cria a TURMA
          let idTurma;
          const turmaExiste = await db.query(
            `SELECT "idTurma" FROM "Turma" WHERE "codigo" = $1`,
            [aluno.turma]
          );
          if (turmaExiste.rows.length > 0) {
            idTurma = turmaExiste.rows[0].idTurma;
          } else {
            const novaTurma = await db.query(
              `INSERT INTO "Turma" ("codigo","semestreAtual","Cursos_idCurso")
               VALUES ($1,$2,$3) RETURNING "idTurma"`,
              [aluno.turma, null, idCurso]
            );
            idTurma = novaTurma.rows[0].idTurma;
          }

          // C. Verifica/Cria a EMPRESA
          let idEmpresa;
          const empresaExiste = await db.query(
            `SELECT "idEmpresa" FROM "Empresa" WHERE "empresaContrato" = $1`,
            [aluno.empresaContrato]
          );
          if (empresaExiste.rows.length > 0) {
            idEmpresa = empresaExiste.rows[0].idEmpresa;
          } else {
            const novaEmpresa = await db.query(
              `INSERT INTO "Empresa" ("AE/AD","praticaProfissional","horasPratica","empresaContrato")
               VALUES ($1,$2,$3,$4) RETURNING "idEmpresa"`,
            [aluno['AE/AD'], aluno.praticaProfissional, aluno.horasPratica, aluno.empresaContrato]
            );
            idEmpresa = novaEmpresa.rows[0].idEmpresa;
          }

          // D. Verifica/Cria o ALUNO
          const alunoExiste = await db.query(
            `SELECT "idtblAluno" FROM "tblAluno" WHERE "matricula" = $1`,
            [aluno.matricula]
          );
          if (alunoExiste.rows.length === 0) {
            await db.query(
              `INSERT INTO "tblAluno" ("matricula","nome","Empresa_idEmpresa","Turma_idTurma")
               VALUES ($1,$2,$3,$4)`,
              [aluno.matricula, aluno.nome, idEmpresa, idTurma]
            );
          }
        }

        // Remove o arquivo temporário
        fs.unlinkSync(req.file.path);

        res.json({ sucesso: true, mensagem: 'Planilha processada e banco atualizado com sucesso!' });

      } catch (erro) {
        console.error('Erro ao processar planilha:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar os dados da planilha.' });
      }
    });
});

module.exports = router;