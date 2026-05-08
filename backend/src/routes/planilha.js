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
        await db`TRUNCATE TABLE "tblAluno_copy1"`;

        // 2. Insere dados brutos no staging
        for (const linha of resultados) {
          const nomeDaPrimeiraColuna = Object.keys(linha)[0];
          const valorMatricula =
            linha['N° de Matrícula'] ||
            linha['Nº de Matrícula'] ||
            linha[nomeDaPrimeiraColuna];

          if (!valorMatricula) continue;

          await db`
            INSERT INTO "tblAluno_copy1"
              ("matricula","nome","tipoCurso","areaCurso","curso","turma",
               "AE/AD","praticaProfissional","horasPratica","empresaContrato")
            VALUES (
              ${valorMatricula},
              ${linha['Nome']},
              ${linha['Tipo de Curso']},
              ${linha['Área do Curso']},
              ${linha['Curso']},
              ${linha['Turma']},
              ${linha['AE/AD']},
              ${linha['Prát. Prof. na Empresa com o emprego da guia de aprendizagem?']},
              ${linha['Prát. Prof. a ser desenvolvida exclusivamente na empresa (Horas)'] || 0},
              ${linha['Empresa do contrato de aprendizagem']}
            )
          `;
        }

        // 3. ETL — distribui para as tabelas oficiais
        const dadosBrutos = await db`SELECT * FROM "tblAluno_copy1"`;

        for (const aluno of dadosBrutos) {

          // A. Verifica/Cria o CURSO
          let idCurso;
          const cursoExiste = await db`
            SELECT "idCurso" FROM "Cursos" WHERE "nomeCurso" = ${aluno.curso}
          `;
          if (cursoExiste.length > 0) {
            idCurso = cursoExiste[0].idCurso;
          } else {
            console.log('Dados do aluno no ETL:', aluno);
            const novoCurso = await db`
              INSERT INTO "Cursos" ("nomeCurso","tipo","area")
              VALUES (${aluno.curso}, ${aluno.tipoCurso}, ${aluno.areaCurso})
              RETURNING "idCurso"
            `;
            idCurso = novoCurso[0].idCurso;
          }

          // B. Verifica/Cria a TURMA
          let idTurma;
          const turmaExiste = await db`
            SELECT "idTurma" FROM "Turma" WHERE "codigo" = ${aluno.turma}
          `;
          if (turmaExiste.length > 0) {
            idTurma = turmaExiste[0].idTurma;
          } else {
            const novaTurma = await db`
              INSERT INTO "Turma" ("codigo","semestreAtual","Cursos_idCurso")
              VALUES (${aluno.turma}, ${null}, ${idCurso})
              RETURNING "idTurma"
            `;
            idTurma = novaTurma[0].idTurma;
          }

          // C. Verifica/Cria a EMPRESA
          let idEmpresa;
          const empresaExiste = await db`
            SELECT "idEmpresa" FROM "Empresa" WHERE "empresaContrato" = ${aluno.empresaContrato}
          `;
          if (empresaExiste.length > 0) {
            idEmpresa = empresaExiste[0].idEmpresa;
          } else {
            const novaEmpresa = await db`
              INSERT INTO "Empresa" ("AE/AD","praticaProfissional","horasPratica","empresaContrato")
              VALUES (${aluno['AE/AD']}, ${aluno.praticaProfissional}, ${aluno.horasPratica}, ${aluno.empresaContrato})
              RETURNING "idEmpresa"
            `;
            idEmpresa = novaEmpresa[0].idEmpresa;
          }

          // D. Verifica/Cria o ALUNO
          const alunoExiste = await db`
            SELECT "idtblAluno" FROM "tblAluno" WHERE "matricula" = ${aluno.matricula}
          `;
          if (alunoExiste.length === 0) {
            await db`
              INSERT INTO "tblAluno" ("matricula","nome","Empresa_idEmpresa","Turma_idTurma")
              VALUES (${aluno.matricula}, ${aluno.nome}, ${idEmpresa}, ${idTurma})
            `;
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
