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
    gerarDoc:    `${API_BASE}/relatorio/gerar-doc`,
    termoDeCiencia: `${API_BASE}/termoDeCiencia`,
    instrumento: `${API_BASE}/instrumento-acompanhamento`,
    usuarios:    `${API_BASE}/usuarios`,
    uploadPlanilha: `${API_BASE}/upload-planilha`,
    atribuirTurma: `${API_BASE}/atribuirTurma`,
    turmaDocente: `${API_BASE}/turmaDocente`,
    observacoes: `${API_BASE}/observacoes`,
    docentesTurma: (idTurma) => `${API_BASE}/observacoes/docentes-turma/${idTurma}`,
};
 
// ── lê o token salvo no login ───────────────────────────────
function getToken() {
  try {
    const logado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
    return logado.token || null;
  } catch {
    return null;
  }
}
 
// ── fetch com token embutido + tratamento de token expirado ──
export async function authFetch(url, options = {}) {
  const token = getToken();
 
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
 
  const resposta = await fetch(url, { ...options, headers });
 
  // 401 = token ausente/inválido/expirado → desloga e volta pro Login
  if (resposta.status === 401) {
    localStorage.removeItem('usuarioLogado');
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
 
  return resposta;
}