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
// import { PreConselho } from './pages/PreConselho/PreConselho.jsx';

// importacao das telas de relatorio
import { GerarAta } from './pages/Relatorios/GerarAta.jsx';
import { GerarRelatorio } from './pages/Relatorios/GerarRelatorio.jsx';
import { GerarTermoCiencia } from './pages/Relatorios/GerarTermoCiencia.jsx';

// nivel acesso docente
import { TurmasDocente }             from './pages/Docente/TurmasDocente.jsx';
import { InstrumentoAcompanhamento } from './pages/Docente/InstrumentoAcompanhamento.jsx';

// função que retorna o nível de acesso no login, ou null se não estiver logado
function getNivelAcesso() {
  const logado = localStorage.getItem('usuarioLogado');
  if (!logado) return null;
  return JSON.parse(logado).nivelAcesso; // 'admin' ou 'docente'
}

// Redireciona para '/' se não estiver logado
function RequireAuth({ children }) {
  const nivel = getNivelAcesso();
  // if (!nivel) return <Navigate to="/" replace />;
  return children;
}

// --- CRIANDO O MOLDE DO PAINEL ---  
function LayoutDoSistema() {

  const nivel = getNivelAcesso();

  return (
    <div className="app-wrapper flex-column h-screen w-full">
      <Header /> {/* Fica no topo */}
      <div className="main-container flex grow overflow-hidden">

        {/* ← AQUI está o teste: renderiza a sidebar correta */}
        {nivel === 'admin' ? <Sidebar /> : <SidebarDocente /> }
        {/*<Sidebar />*/}
        
        <main className="content-area grow overflow-y-auto px-auto h-[100vh] w-full bg-gray-50">
          {/* A MÁGICA: O Outlet é o espaço onde as páginas vão aparecer! */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}

// --- O MAESTRO (App Principal) ---
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rota Livre: Login não usa o Molde */}
        <Route path="/" element={<Login />} />
        
        {/* Bloco de Rotas que USAM o Molde (Header e Sidebar) */}
        <Route element={
          <RequireAuth>
            <LayoutDoSistema />
          </RequireAuth>
          }>
          
          <Route path="/perfil" element={<Perfil />} />

          {/* rotas admin */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/conselhointermediario" element={<ConselhoIntermediario />} />
          <Route path="/preconselho" element={<PreConselho />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/conselhofinal" element={<ConselhoFinal/>}/>

          {/* rotas do relatorio */}
          <Route path="/relatorios/ata" element={<GerarAta />} />
          <Route path="/relatorios/relatorio" element={<GerarRelatorio />} />
          <Route path="/relatorios/termo" element={<GerarTermoCiencia />} />

          <Route path="/home"                          element={<Homepage />} />

          {/* ── Rotas DOCENTE ── */}
          <Route path="/docente/turmas"                        element={<TurmasDocente />} />
          <Route path="/docente/instrumento-acompanhamento"    element={<InstrumentoAcompanhamento />} />
        </Route>

        <Route path="/cadastrarusuario" element={<Cadastro />} /> 
        <Route path="/recuperarsenha" element={<Senha />} /> 
        <Route path="/atribuirturma" element={<Turma />}/>


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