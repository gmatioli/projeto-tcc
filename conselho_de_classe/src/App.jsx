import React from 'react';
// IMPORTANTE: Adicionei o Outlet aqui no import do react-router-dom!
// importei o navigate
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'; 
import './App.css';
import { Toaster } from 'sonner';
 
// 1. Importe a sua tela de Login
import Login from './pages/Login/Login.jsx'; 
 
// 2. Importe os seus componentes visuais
import { Header } from './components/header/Header.jsx';
import { Sidebar } from './components/sidebar/Sidebar.jsx';
import { SidebarDocente } from './components/sidebar/SidebarDocente.jsx';
import { Homepage }           from './pages/HomePage/Homepage.jsx';
 
// nivel acesso admin
import { ConselhoIntermediario } from './pages/ConselhoIntermediario/ConselhoIntermediario.jsx';
import { PreConselho } from './pages/PreConselho/PreConselho.jsx' ;
import { Configuracoes } from './pages/Configuracoes/Configuracoes.jsx';
import { Cadastro } from './pages/Cadastro/Cadastro.jsx';
import { Senha } from './pages/Senha/Senha.jsx'; 
import { Perfil } from './pages/Perfil/Perfil.jsx';
import { Dashboard } from './pages/Dashboard/Dashboard.jsx';
import ConselhoFinal from './pages/ConselhoFinal/ConselhoFinal.jsx';
import { Turma } from './pages/AtribuirTurma/Turma.jsx';
 
// importacao das telas de relatorio
import { GerarAta } from './pages/Relatorios/GerarAta.jsx';
import { GerarRelatorio } from './pages/Relatorios/GerarRelatorio.jsx';
import { GerarTermoCiencia } from './pages/Relatorios/GerarTermoCiencia.jsx';
 
// nivel acesso docente
import { TurmasDocente }             from './pages/Docente/TurmasDocente.jsx';
import { InstrumentoAcompanhamento } from './pages/Docente/InstrumentoAcompanhamento.jsx';
 
// ─── Helpers de autenticação ───────────────────────────────────────────────
 
/** Retorna o objeto do usuário logado, ou null */
function getUsuarioLogado() {
  try {
    const logado = localStorage.getItem('usuarioLogado');
    return logado ? JSON.parse(logado) : null;
  } catch {
    return null;
  }
}
 
/** Retorna 'admin', 'docente' ou null */
function getNivelAcesso() {
  const usuario = getUsuarioLogado();
  return usuario ? usuario.nivelAcesso : null;
}
 
// ─── Rotas Permitidas por Nível ────────────────────────────────────────────
 
const ROTAS_ADMIN = [
  '/dashboard',
  '/perfil',
  '/conselhointermediario',
  '/preconselho',
  '/configuracoes',
  '/conselhofinal',
  '/relatorios/ata',
  '/relatorios/relatorio',
  '/relatorios/termo',
  '/cadastrarusuario',
  '/recuperarsenha',
  '/atribuirturma',
  '/home',
  '/',
];
 
const ROTAS_DOCENTE = [
  '/perfil',
  '/home',
  '/',
  '/docente/turmas',
  '/docente/instrumento-acompanhamento',
];
 
/**
 * Verifica se o nível de acesso tem permissão para a rota atual.
 * Suporta rotas com parâmetros dinâmicos (ex: /relatorios/:id).
 */
function temPermissao(nivel, pathname) {
  const rotasPermitidas = nivel === 'admin' ? ROTAS_ADMIN : nivel === 'docente' ? ROTAS_DOCENTE : [];
  return rotasPermitidas.some((rota) => pathname === rota || pathname.startsWith(rota + '/'));
}
 
// ─── Guardas de Rota ───────────────────────────────────────────────────────
 
/**
 * Exige autenticação. Se não logado, redireciona para '/'.
 * Se logado mas sem permissão para a rota, redireciona para '/home'.
 */
function RequireAuth({ children }) {
  const nivel = getNivelAcesso();
 
  if (!nivel) {
    // Não está logado → vai para o Login
    return <Navigate to="/" replace />;
  }
 
  return children;
}
 
/**
 * Guarda específica por nível de acesso.
 * Uso: <RequireNivel nivel="admin"> ou <RequireNivel nivel="docente">
 * Se o nível não bater, redireciona para '/home' (acesso negado).
 */
function RequireNivel({ nivel: nivelRequerido, children }) {
  const nivelAtual = getNivelAcesso();
 
  if (!nivelAtual) {
    return <Navigate to="/" replace />;
  }
 
  if (nivelAtual !== nivelRequerido) {
    return <Navigate to="/home" replace />;
  }
 
  return children;
}
 
// ─── Layout do Sistema ─────────────────────────────────────────────────────
 
function LayoutDoSistema() {
  const nivel = getNivelAcesso();
 
  return (
    <div className="app-wrapper flex-column h-screen w-full">
      <Header /> {/* Fica no topo */}
      <div className="main-container flex grow overflow-hidden">
 
        {nivel === 'admin' ? <Sidebar /> : <SidebarDocente />}
 
        <main className="content-area grow overflow-y-auto px-auto h-[100vh] w-full bg-gray-50">
          {/* A MÁGICA: O Outlet é o espaço onde as páginas vão aparecer! */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
 
// ─── App Principal ─────────────────────────────────────────────────────────
 
function App() {
  return (
    <BrowserRouter>
      <Routes>
 
        {/* ── Rota pública: Login ── */}
        <Route path="/" element={<Login />} />
 
        {/* ── Rotas compartilhadas sem Layout (fora do painel) ── */}
        <Route
          path="/cadastrarusuario"
          element={
            <RequireNivel nivel="admin">
              <Cadastro />
            </RequireNivel>
          }
        />
        <Route
          path="/recuperarsenha"
          element={
            <RequireNivel nivel="admin">
              <Senha />
            </RequireNivel>
          }
        />
        <Route
          path="/atribuirturma"
          element={
            <RequireNivel nivel="admin">
              <Turma />
            </RequireNivel>
          }
        />
 
        {/* ── Bloco que usa o Layout (Header + Sidebar) ── */}
        <Route
          element={
            <RequireAuth>
              <LayoutDoSistema />
            </RequireAuth>
          }
        >
          {/* Rota compartilhada: admin e docente */}
          <Route path="/home"   element={<Homepage />} />
          <Route path="/perfil" element={<Perfil />} />
 
          {/* ── Rotas exclusivas ADMIN ── */}
          <Route
            path="/dashboard"
            element={
              <RequireNivel nivel="admin">
                <Dashboard />
              </RequireNivel>
            }
          />
          <Route
            path="/conselhointermediario"
            element={
              <RequireNivel nivel="admin">
                <ConselhoIntermediario />
              </RequireNivel>
            }
          />
          <Route
            path="/preconselho"
            element={
              <RequireNivel nivel="admin">
                <PreConselho />
              </RequireNivel>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <RequireNivel nivel="admin">
                <Configuracoes />
              </RequireNivel>
            }
          />
          <Route
            path="/conselhofinal"
            element={
              <RequireNivel nivel="admin">
                <ConselhoFinal />
              </RequireNivel>
            }
          />
 
          {/* Relatórios — exclusivo ADMIN */}
          <Route
            path="/relatorios/ata"
            element={
              <RequireNivel nivel="admin">
                <GerarAta />
              </RequireNivel>
            }
          />
          <Route
            path="/relatorios/relatorio"
            element={
              <RequireNivel nivel="admin">
                <GerarRelatorio />
              </RequireNivel>
            }
          />
          <Route
            path="/relatorios/termo"
            element={
              <RequireNivel nivel="admin">
                <GerarTermoCiencia />
              </RequireNivel>
            }
          />
 
          {/* ── Rotas exclusivas DOCENTE ── */}
          <Route
            path="/docente/turmas"
            element={
              <RequireNivel nivel="docente">
                <TurmasDocente />
              </RequireNivel>
            }
          />
          <Route
            path="/docente/instrumento-acompanhamento"
            element={
              <RequireNivel nivel="docente">
                <InstrumentoAcompanhamento />
              </RequireNivel>
            }
          />
        </Route>
 
      </Routes>
 
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          classNames: {
            toast: 'rounded-2xl shadow-lg border-2 mt-[35px] mr-[15px]',
          },
          style: {
            fontSize: '1rem',
          },
        }}
      />
    </BrowserRouter>
  );
}
 
export default App;