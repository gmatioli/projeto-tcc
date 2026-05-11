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
// GERAR DOCUMENTO
// ==========================================
router.post('/gerar-doc', async (req, res) => {
  try {
    const { dataConselho, turma, semestre } = req.body;

    console.log(` Gerando relatório → Turma: ${turma} | Data: ${dataConselho}`);

    const result = await db`
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

    console.log(` Alunos encontrados: ${result.length}`);

    if (result.length === 0) {
      return res.status(404).json({ mensagem: `Nenhum aluno encontrado para ${turma} na data ${dataConselho}` });
    }

    const dadosTemplate = {
      turma: turma,
      dataConselho: dataConselho,
      semestre: semestre || '1º Semestre',
      titulo: "Conselho de Classe Intermediário – Plano de Ação",
      escola: "Escola SENAI \"Mariano Ferraz\"",

      alunos: result.map(aluno => ({
        nomeAluno: aluno.nomeAluno || '',
        restricao: aluno.restricao || '',
        acaoProposta: aluno.acaoProposta || '',
        responsavel: "Coordenação / Professor",
        situacaoFinal: aluno.situacaoFinal || '',
        portal: "Registrado"
      }))
    };

    // ====================== TEMPLATE ======================
    const templatePath = path.join(__dirname, '../../docs/template-plano-acao.docx');
    
    if (!fs.existsSync(templatePath)) {
      return res.status(400).json({ mensagem: 'Template não encontrado!' });
    }

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(dadosTemplate);   // ← Nova forma recomendada

    const buffer = doc.getZip().generate({ type: 'nodebuffer' });

    res.setHeader('Content-Disposition', `attachment; filename=Plano_Acao_${turma}_${dataConselho.replace(/\//g, '-')}.docx`);
    res.send(buffer);

  } catch (erro) {
    console.error(' Erro completo:', erro);
    res.status(500).json({ mensagem: 'Erro ao gerar documento', detalhe: erro.message });
  }
});
module.exports = router;