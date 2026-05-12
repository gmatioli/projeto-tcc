const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const db = require('../config/db');

// ==========================================
// BUSCAR DATAS
// ==========================================
router.get('/datas', async (req, res) => {
  try {
    console.log(' Buscando datas...');

    const result = await db`
      SELECT 
        "idConselho",
        TO_CHAR("dataRealizacao", 'DD/MM/YYYY') AS "dataFormatada"
      FROM "Conselho"
      ORDER BY "dataRealizacao" DESC
      LIMIT 10
    `;

    console.log(` Datas OK: ${result.length} registros`);
    res.json(result);

  } catch (erro) {
    console.error(' ERRO ao buscar datas:', erro.message);
    res.status(500).json({ mensagem: 'Erro ao buscar datas' });
  }
});

// ==========================================
// BUSCAR TURMAS
// ==========================================
router.get('/turmas', async (req, res) => {
  try {
    console.log(' Buscando turmas...');

    const result = await db`
      SELECT 
        T."idTurma",
        T."codigo",
        C."tipo"
      FROM "Turma" T
      LEFT JOIN "Cursos" C ON T."Cursos_idCurso" = C."idCurso"
      ORDER BY T."codigo" ASC
      LIMIT 20
    `;

    console.log(` Turmas OK: ${result.length} registros`);
    res.json(result);

  } catch (erro) {
    console.error(' ERRO ao buscar turmas:', erro.message);
    res.status(500).json({ mensagem: 'Erro ao buscar turmas' });
  }
});

// ==========================================
// GERAR DOCUMENTO - DIFERENCIADO POR TIPO
// ==========================================
router.post('/gerar-doc', async (req, res) => {
  try {
    const { dataConselho, turma, semestre, conselho } = req.body;

    console.log(` Gerando: ${conselho} | Turma: ${turma} | Data: ${dataConselho}`);

    // Query base
    let result;

    if (conselho === "preConselho" || conselho === "pre") {
      // === PRÉ CONSELHO ===
      result = await db`
        SELECT 
          A."nome" as "nomeAluno",
          AA."situacaoFinal" as "situacao",
          AA."justificativa",
          AA."responsavel"
        FROM "Avaliacao_Aluno" AA
        INNER JOIN "tblAluno" A ON AA."tblAluno_idtblAluno" = A."idtblAluno"
        INNER JOIN "Turma" T ON A."Turma_idTurma" = T."idTurma"
        WHERE T."codigo" = ${turma}
          AND AA."Conselho_idConselho" IN (
            SELECT "idConselho" 
            FROM "Conselho" 
            WHERE TO_CHAR("dataRealizacao", 'DD/MM/YYYY') = ${dataConselho}
          )
        ORDER BY A."nome" ASC
      `;

      const dadosTemplate = {
        turma: turma,
        dataConselho: dataConselho,
        semestre: semestre || '1º Semestre',
        titulo: "PRÉ CONSELHO – PLANO DE AÇÃO",
        escola: "Escola SENAI \"Mariano Ferraz\"",

        alunos: result.map(aluno => ({
          nomeAluno: aluno.nomeAluno || '',
          situacao: aluno.situacao || 'Não definido',
          justificativa: aluno.justificativa || 'Não informado',
          responsavel: aluno.responsavel || 'Coordenação'
        }))
      };

      const templatePath = path.join(__dirname, '../../docs/template-pre-conselho.docx');

      if (!fs.existsSync(templatePath)) {
        return res.status(400).json({ mensagem: 'Template do Pré Conselho não encontrado!' });
      }

      // Geração do Pré Conselho
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      doc.render(dadosTemplate);
      const buffer = doc.getZip().generate({ type: 'nodebuffer' });

      res.setHeader('Content-Disposition', `attachment; filename=Pre_Conselho_${turma}_${dataConselho.replace(/\//g, '-')}.docx`);
      res.send(buffer);

    } else {
      // === CONSELHO INTERMEDIÁRIO (mantido como estava) ===
      result = await db`
        SELECT 
          A."nome" as "nomeAluno",
          AA."restricao",
          AA."acaoProposta",
          AA."justificativa",
          AA."situacaoFinal"
        FROM "Avaliacao_Aluno" AA
        INNER JOIN "tblAluno" A ON AA."tblAluno_idtblAluno" = A."idtblAluno"
        INNER JOIN "Turma" T ON A."Turma_idTurma" = T."idTurma"
        WHERE T."codigo" = ${turma}
          AND AA."Conselho_idConselho" IN (
            SELECT "idConselho" 
            FROM "Conselho" 
            WHERE TO_CHAR("dataRealizacao", 'DD/MM/YYYY') = ${dataConselho}
          )
        ORDER BY A."nome" ASC
      `;

      const dadosTemplate = {
        turma: turma,
        dataConselho: dataConselho,
        semestre: semestre || '1º Semestre',
        titulo: "CONSELHO DE CLASSE INTERMEDIÁRIO – PLANO DE AÇÃO",
        escola: "Escola SENAI \"Mariano Ferraz\"",

        alunos: result.map(aluno => ({
          nomeAluno: aluno.nomeAluno || '',
          restricao: aluno.restricao || 'Não informado',
          acaoProposta: aluno.acaoProposta || 'Não definido',
          responsavel: "Coordenação / Professor",
          situacaoFinal: aluno.situacaoFinal || 'Aprovado',
          portal: "Registrado"
        }))
      };

      const templatePath = path.join(__dirname, '../../docs/template-plano-acao.docx');

      if (!fs.existsSync(templatePath)) {
        return res.status(400).json({ mensagem: 'Template do Conselho Intermediário não encontrado!' });
      }

      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      doc.render(dadosTemplate);
      const buffer = doc.getZip().generate({ type: 'nodebuffer' });

      res.setHeader('Content-Disposition', `attachment; filename=Plano_Acao_${turma}_${dataConselho.replace(/\//g, '-')}.docx`);
      res.send(buffer);
    }

  } catch (erro) {
    console.error(' Erro completo:', erro);
    res.status(500).json({ mensagem: 'Erro ao gerar documento', detalhe: erro.message });
  }
});
module.exports = router;