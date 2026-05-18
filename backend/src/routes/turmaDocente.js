const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// BUSCAR TURMAS E CURSOS DO DOCENTE PARA SIDEBAR
// ==========================================
router.get('/docente/:id/sidebar-filtros', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db`
            SELECT 
                t."idTurma", 
                t."codigo" AS "turma",      -- Alterado de "nomeTurma" para "turma"
                c."idCurso", 
                c."nomeCurso" AS "curso",   -- Alterado de "nomeCurso" para "curso"
                c."tipo"                    -- Removemos o AS "tipoCurso", fica apenas "tipo"
            FROM "Turma" t
            JOIN "Docente_Turma" dt ON t."idTurma" = dt."Turma_idTurma"
            JOIN "Cursos" c ON t."Cursos_idCurso" = c."idCurso"
            WHERE dt."Usuario_idUsuario" = ${id}
            ORDER BY c."tipo", c."nomeCurso", t."codigo"
        `;
        
        // Retorna o array diretamente, o seu frontend já está preparado para receber assim
        res.json(result);
    } catch (erro) {
        console.error('Erro ao buscar dados para a sidebar:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao carregar filtros.' });
    }
});

module.exports = router;