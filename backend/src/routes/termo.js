const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { autenticar, exigirNivel } = require('../middleware/authToken');

// ==========================================
// ROTA: GERAR TERMO DE CIÊNCIA (POST)
// ==========================================
router.post('/termoDeCiencia', autenticar, exigirNivel('admin'), (req, res) => {
  try {
    const { aluno, data, turma, observacao } = req.body;

    if (!aluno || !data || !turma) {
      return res.status(400).json({ sucesso: false, mensagem: 'Preencha todos os campos.' });
    }

    const templatePath = path.join(__dirname, '../../docs/termoCiencia.docx');
    
    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Substitui os campos no documento
    doc.setData({
      aluno: aluno,
      data: data,
      turma: turma,
      observacao: observacao || ''
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