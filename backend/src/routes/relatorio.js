const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// ==========================================
// ROTA: GERAR DOCUMENTO DOCX (POST)
// ==========================================
router.post('/gerar-doc', (req, res) => {
  try {
    const { conselho, semestre, ano, data } = req.body;

    if (!conselho || !semestre || !ano || !data) {
      return res.status(400).json({ sucesso: false, mensagem: 'Preencha todos os campos.' });
    }

    // Caminho do template
    const templatePath = path.join(__dirname, '../../docs/template.docx');
    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });

    // Substitui os campos do template
    doc.setData({
      tipo_conselho: conselho,
      semestre: semestre,
      ano: ano,
      data_conselho: data
    });

    doc.render();

    const buffer = doc.getZip().generate({ type: 'nodebuffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=ata.docx');
    res.send(buffer);

  } catch (erro) {
    console.error('Erro ao gerar documento:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao gerar o documento.' });
  }
});

module.exports = router;