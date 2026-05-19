export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API = {
    conselho:    `${API_BASE}/conselho`,
    alunos:      `${API_BASE}/alunos`,
    turmas:      `${API_BASE}/turmas`,
    turmasFiltro:`${API_BASE}/turmas-filtro`,
    dashboard:   `${API_BASE}/dashboard`,
    perfil:      `${API_BASE}/perfil`,
    login:       `${API_BASE}/login`,
    cadastro:    `${API_BASE}/cadastro`,
    relatorio:   `${API_BASE}/relatorio`,
    gerarDoc:    `${API_BASE}/gerar-doc`,
    termoDeCiencia: `${API_BASE}/termoDeCiencia`,
    instrumento: `${API_BASE}/instrumento-acompanhamento`,
    usuarios:    `${API_BASE}/usuarios`,
    uploadPlanilha: `${API_BASE}/upload-planilha`,
    atribuirTurma: `${API_BASE}/atribuirTurma`,
    turmaDocente: `${API_BASE}/turmaDocente`,
    observacoes: `${API_BASE}/observacoes`,
};