const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { autenticar, exigirNivel } = require('../middleware/authToken');
const db = require('../config/db');

// ==========================================
// ROTA: GERAR TERMO DE CIÊNCIA (POST)
// ==========================================
router.post('/termoDeCiencia', autenticar, exigirNivel('admin'), async (req, res) => {

  try {
    const { idAluno, turma, semestre, ano, dataConselho, observacao } = req.body;

    if (!idAluno || !semestre || !ano || !turma) {
      return res.status(400).json({ sucesso: false, mensagem: 'Preencha todos os campos.' });
    }
    const resultado = await db`
      SELECT 
        A."nome" AS "nomeAluno",
        AA."restricao",
        AA."acaoProposta",
        AA."responsavel"
      FROM "Avaliacao_Aluno" AA
      INNER JOIN "tblAluno" A ON AA."tblAluno_idtblAluno" = A."idtblAluno"
      INNER JOIN "Conselho" C ON AA."Conselho_idConselho" = C."idConselho"
      WHERE AA."tblAluno_idtblAluno" = ${Number(idAluno)}
        AND C."tipoConselho" = 'Intermediário'
        AND C."semestre" = ${Number(semestre)}
        AND C."ano" = ${Number(ano)}
      LIMIT 1
    `;

    const intermediario = resultado[0] || null;

    if (!intermediario) {
    return res.status(404).json({ 
      sucesso: false, 
      mensagem: 'Aluno não tem avaliação no Conselho Intermediário deste semestre.' 
    });
  }

    const templatePath = path.join(__dirname, '../../docs/termoCiencia.docx');
    
    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const dataGeracao = new Date().toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });

    doc.setData({
      aluno: intermediario?.nomeAluno || '',
      dataConselho: dataConselho,
      dataGeracao: dataGeracao,     // data de hoje (geração)
      turma,
      observacao: observacao || '',
      restricao: intermediario?.restricao || '',
      acaoIntermediario: intermediario?.acaoProposta || '',
      responsavelIntermediario: intermediario?.responsavel || ''
    });

    doc.render();

    const buffer = doc.getZip().generate({ type: 'nodebuffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=termoDeCiencia.docx');
    res.send(buffer);

  } catch (error) {
    console.error('Erro ao gerar Termo de Ciência:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao gerar documento' });
  }
});

module.exports = router;