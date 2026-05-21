const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const db = require('../config/db');

// ==========================================
// BUSCAR DATAS (E PERÍODOS DE CONSELHO)
// ==========================================
router.get('/datas', async (req, res) => {
  try {

    // AJUSTE: Removemos o limite apertado e forçamos o banco
    // a entregar apenas registros que tenham semestre e ano.
    const result = await db`
      SELECT 
        "idConselho",
        "semestre",
        "ano",
        TO_CHAR("dataRealizacao", 'DD/MM/YYYY') AS "dataFormatada",
        TO_CHAR("dataRealizacao", 'YYYY-MM-DD') AS "dataInput"
      FROM "Conselho"
      WHERE "semestre" IS NOT NULL 
        AND "ano" IS NOT NULL
      ORDER BY "ano" DESC, "semestre" DESC
    `;

    // Se result.length estiver indefinido, tentaremos ler .rows
    const tamanho = result.length !== undefined ? result.length : (result.rows ? result.rows.length : 0);
    
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
    const { dataConselho, semestre, conselho, ano } = req.body;

    let result;

    if (conselho === "preConselho" || conselho === "pre") {
      // === PRÉ CONSELHO ===
      result = await db`
        SELECT 
          A."nome" as "nomeAluno",
          T."codigo" as "codigoTurma",
          AA."justificativa",
          AA."acaoProposta",
          AA."responsavel"
        FROM "Avaliacao_Aluno" AA
        INNER JOIN "tblAluno" A ON AA."tblAluno_idtblAluno" = A."idtblAluno"
        INNER JOIN "Turma" T ON A."Turma_idTurma" = T."idTurma"
        INNER JOIN "Conselho" C ON AA."Conselho_idConselho" = C."idConselho"
         WHERE C."semestre" = ${Number(semestre)}
          AND C."ano" = ${Number(ano)}
          AND C."tipoConselho" = 'Pré-Conselho'
        ORDER BY T."codigo" ASC, A."nome" ASC
      `;
      
      // Guarda o array de alunos com segurança
      const listaAlunos = result.rows || result;

      const dadosTemplate = {
        turma: "Todas as turmas",
        dataConselho: dataConselho,
        semestre: semestre,
        ano: ano,
        titulo: "PRÉ CONSELHO – PLANO DE AÇÃO",
        escola: "Escola SENAI \"Mariano Ferraz\"",

        alunos: listaAlunos.map(aluno => ({
          codigoTurma: `${aluno.codigoTurma}`,
          nomeAluno: `${aluno.nomeAluno}`,
          situacao: aluno.justificativa 
            ? 'Retido' 
            : aluno.acaoProposta 
              ? 'Conselho final' 
              : 'Não definido',
          observacao: aluno.justificativa || aluno.acaoProposta || 'Não informado',
          responsavel: aluno.responsavel || 'Coordenação'
        }))
      };

      const templatePath = path.join(__dirname, '../../docs/template-pre-conselho.docx');
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      doc.render(dadosTemplate);
      res.setHeader('Content-Disposition', `attachment; filename=Pre_Conselho_Ano${ano}_Sem${semestre}.docx`);
      res.send(doc.getZip().generate({ type: 'nodebuffer' }));

    } else if (conselho === "intermediario") {
      // === CONSELHO INTERMEDIÁRIO ===
      result = await db`
        SELECT 
          A."nome" as "nomeAluno",
          T."codigo" as "codigoTurma",
          AA."restricao",
          AA."acaoProposta",
          AA."justificativa",
          AA."responsavel",
          AA."situacaoFinal"
        FROM "Avaliacao_Aluno" AA
        INNER JOIN "tblAluno" A ON AA."tblAluno_idtblAluno" = A."idtblAluno"
        INNER JOIN "Turma" T ON A."Turma_idTurma" = T."idTurma"
        INNER JOIN "Conselho" C ON AA."Conselho_idConselho" = C."idConselho"
        WHERE C."semestre" = ${Number(semestre)}
          AND C."ano" = ${Number(ano)}
          AND C."tipoConselho" = 'Intermediário'
        ORDER BY T."codigo" ASC, A."nome" ASC
      `;

      // Guarda o array de alunos com segurança
      const listaAlunos = result.rows || result;
      

      const dadosTemplate = {
        turma: "Todas as turmas",
        dataConselho: dataConselho,
        semestre: semestre,
        ano: ano,
        titulo: "CONSELHO DE CLASSE INTERMEDIÁRIO – PLANO DE AÇÃO",
        escola: "Escola SENAI \"Mariano Ferraz\"",

        alunos: listaAlunos.map(aluno => ({
          codigoTurma: `${aluno.codigoTurma}`,
          nomeAluno: `${aluno.nomeAluno}`,
          restricao: aluno.restricao || 'Não informado',
          acaoProposta: aluno.acaoProposta || 'Não definido',
          responsavel: aluno.responsavel || 'Não definido',
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
      res.setHeader('Content-Disposition', `attachment; filename=Intermediario_Ano${ano}_Sem${semestre}.docx`);
      res.send(doc.getZip().generate({ type: 'nodebuffer' }));

    } else {
      
      result = await db`
        SELECT 
          A."nome" as "nomeAluno",
          T."codigo" as "codigoTurma",
          AA."situacaoFinal" as "situacao",
          AA."contestacaoSituacaoFinal" as "contestacao"
        FROM "Avaliacao_Aluno" AA
        INNER JOIN "tblAluno" A ON AA."tblAluno_idtblAluno" = A."idtblAluno"
        INNER JOIN "Turma" T ON A."Turma_idTurma" = T."idTurma"
        INNER JOIN "Conselho" C ON AA."Conselho_idConselho" = C."idConselho"
        WHERE C."semestre" = ${Number(semestre)}
          AND C."ano" = ${Number(ano)}
          AND C."tipoConselho" = 'Final'
        ORDER BY T."codigo" ASC, A."nome" ASC
      `;

      // Guarda o array de alunos com segurança
      const listaAlunos = result.rows || result;
      
      const dadosTemplate = {
        turma: "Todas as turmas", 
        semestre: semestre,       
        ano: ano,                
        dataConselho: dataConselho,  
        
        alunos: listaAlunos.map(aluno => ({
          codigoTurma: `${aluno.codigoTurma}`,
          nomeAluno: `${aluno.nomeAluno}`, 
          situacao: aluno.situacao || 'Não definido',
          contestacao: aluno.contestacao || ''
        }))
      };

      const templatePath = path.join(__dirname, '../../docs/template-ata-conselhofinal.docx');

      if (!fs.existsSync(templatePath)) {
        return res.status(400).json({ mensagem: 'Template da Ata Final não encontrado!' });
      }

      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      doc.render(dadosTemplate);
      res.setHeader('Content-Disposition', `attachment; filename=Intermediario_Ano${ano}_Sem${semestre}.docx`);      
      res.send(doc.getZip().generate({ type: 'nodebuffer' }));
    }
  } catch (erro) {
    console.error(' Erro completo:', erro);
    res.status(500).json({ mensagem: 'Erro ao gerar documento', detalhe: erro.message });
  }
});

module.exports = router;