const express = require('express');
const router  = express.Router();
const path    = require('path');
const PizZip  = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs      = require('fs');
const { formatPayload } = require('../utils/formatPayload');

router.post('/', async (req, res) => {
  try {
    const templatePath = path.resolve(__dirname, '../../docs/IAA-InstrumentoAcompanhamento_template_.docx');
    const content = fs.readFileSync(templatePath, 'binary');

    const zip  = new PizZip(content);
    const doc  = new Docxtemplater(zip, { paragraphLoop: true,linebreaks: true});
    // const doc  = new Docxtemplater(zip, { paragraphLoop: true,linebreaks: true, delimiters: { start: '[%', end: '%]' }});

    console.log('=== BODY RECEBIDO ===');
    console.log(JSON.stringify(req.body, null, 2));

    const dados = formatPayload(req.body);

    console.log('=== DADOS FORMATADOS ===');
    console.log(JSON.stringify(dados, null, 2));
    doc.render(dados);

    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=instrumento_acompanhamento.docx');
    res.send(buf);

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao gerar documento.' });
  }
});

module.exports = router;