const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// GET: RESUMO DO DASHBOARD
// GET -> /api/dashboard/dados
// ==========================================
router.get('/dados', async (req, res) => {
    try {
        const resultAlunos = await db`SELECT COUNT(*) as count FROM "tblAluno"`
        const totalAlunos = parseInt(resultAlunos[0].count) || 0;

        const resultTurmas = await db`SELECT COUNT(*) as count FROM "Turma"`
        const totalTurmas = parseInt(resultTurmas[0].count) || 0;

        const resultSituacaoNormal = await db`
            SELECT COUNT(*) as count 
            FROM "tblAluno" 
            WHERE "idtblAluno" NOT IN (
            SELECT AA."tblAluno_idtblAluno" 
            FROM "Avaliacao_Aluno" AA
            INNER JOIN "Conselho" C ON AA."Conselho_idConselho" = C."idConselho"
            WHERE C."tipoConselho" IN ('Pré-Conselho', 'Intermediário')
                AND (
                (AA."acaoProposta" IS NOT NULL AND TRIM(AA."acaoProposta") != '')
                OR (AA."justificativa" IS NOT NULL AND TRIM(AA."justificativa") != '')
                )
            )
        `;
        const totalSituacaoNormal = parseInt(resultSituacaoNormal[0].count) || 0;

        const resultObservacoes = await db `SELECT COUNT(DISTINCT "tblAluno_idtblAluno") as count 
        FROM "Observacao_Docente"`
        const totalObservacoes =  parseInt(resultObservacoes[0].count) || 0;

        const resultRestritos = await db`
            SELECT COUNT(DISTINCT AA."tblAluno_idtblAluno") as count 
            FROM "Avaliacao_Aluno" AA
            INNER JOIN "Conselho" C ON AA."Conselho_idConselho" = C."idConselho"
            WHERE C."tipoConselho" IN ('Pré-Conselho', 'Intermediário')
            AND (
                (AA."acaoProposta" IS NOT NULL AND TRIM(AA."acaoProposta") != '')
                OR (AA."justificativa" IS NOT NULL AND TRIM(AA."justificativa") != '')
            )
        `;
        const totalRestritos = parseInt(resultRestritos[0].count) || 0;

        const resultOcorrencias = await db`
        SELECT "naturezaOcorrencia"
        FROM "Avaliacao_Aluno"
        WHERE "naturezaOcorrencia" IS NOT NULL 
          AND CAST("naturezaOcorrencia" AS TEXT) NOT IN ('', '[]', '{}')
    `;
        let contagem = {
            'Aproveitamento': 0,
            'Comportamental': 0,
            'Frequência': 0
        };

        resultOcorrencias.forEach(linha => {
            let texto = String(linha.naturezaOcorrencia).toUpperCase();

            if (texto.includes('APROVEITAMENTO')) {
                contagem['Aproveitamento']++;
            }
            if (texto.includes('COMPORTAMENTAL')) {
                contagem['Comportamental']++;
            }
            if (texto.includes('FREQUENCIA') || texto.includes('FREQUÊNCIA')) {
                contagem['Frequência']++;
            }
        });

        const dadosGraficoRosca = [
            { natureza: 'Aproveitamento', quantidade: contagem['Aproveitamento'] },
            { natureza: 'Comportamental', quantidade: contagem['Comportamental'] },
            { natureza: 'Frequência', quantidade: contagem['Frequência'] }
        ];

        const resultRankingTurmas = await db`
            SELECT 
                t."codigo" as turma, 
                COUNT(DISTINCT aa."tblAluno_idtblAluno") as quantidade_restritos,
                (SELECT COUNT(*) FROM "tblAluno" WHERE "Turma_idTurma" = t."idTurma") as total_alunos
            FROM "Avaliacao_Aluno" aa
            JOIN "tblAluno" a ON aa."tblAluno_idtblAluno" = a."idtblAluno"
            JOIN "Turma" t ON a."Turma_idTurma" = t."idTurma"
            JOIN "Conselho" c ON aa."Conselho_idConselho" = c."idConselho"
            WHERE c."tipoConselho" IN ('Pré-Conselho', 'Intermediário')
            AND (
                (aa."acaoProposta" IS NOT NULL AND TRIM(aa."acaoProposta") != '')
                OR (aa."justificativa" IS NOT NULL AND TRIM(aa."justificativa") != '')
            )
            GROUP BY t."idTurma", t."codigo" 
            ORDER BY quantidade_restritos DESC
            LIMIT 7
        `;



        return res.json({
            sucesso: true,
            dados: {
                totalAlunos,
                totalTurmas,
                totalSituacaoNormal,
                totalRestritos,
                totalObservacoes,
                dadosGraficoRosca,
                rankingTurmas: resultRankingTurmas
            }
        })
    } catch (erro) {
        console.error('ERRO BUSCAR DADOS DASHBOARD:', erro);
        return res.status(500).json({ 
          sucesso: false, 
          mensagem: 'Erro ao buscar dados do dashboard' 
        });
      }
});

module.exports = router;