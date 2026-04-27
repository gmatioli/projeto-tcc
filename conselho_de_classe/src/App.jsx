import React from 'react';
// IMPORTANTE: Adicionei o Outlet aqui no import do react-router-dom!
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'; 
import './App.css';

// 1. Importe a sua tela de Login
import Login from './pages/Login/Login.jsx'; 

// 2. Importe os seus componentes visuais
import { Header } from './components/header/Header.jsx';
import { Sidebar } from './components/sidebar/sidebar.jsx';
import { ConselhoIntermediario } from './pages/ConselhoIntermediario/ConselhoIntermediario.jsx';
import { Configuracoes } from './pages/Configuracoes/Configuracoes.jsx';
import { Cadastro } from './pages/Cadastro/Cadastro.jsx';
import { Senha } from './pages/Senha/Senha.jsx'; 
import { Perfil } from './pages/Perfil/Perfil.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import ConselhoFinal from './pages/ConselhoFinal/ConselhoFinal.jsx';
import { Turma } from './pages/AtribuirTurma/Turma.jsx';
// import { PreConselho } from './pages/PreConselho/PreConselho.jsx';

// importacao das telas de relatorio
import { GerarAta } from './pages/Relatorios/GerarAta.jsx';
import { GerarRelatorio } from './pages/Relatorios/GerarRelatorio.jsx';
import { GerarTermoCiencia } from './pages/Relatorios/GerarTermoCiencia.jsx';

// --- CRIANDO O MOLDE DO PAINEL ---  
function LayoutDoSistema() {
  return (
    <div className="app-wrapper">
      <Header /> {/* Fica no topo */}
      <div className="main-container">
        <Sidebar /> {/* Fica na lateral */}
        <main className="content-area">
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
        <Route element={<LayoutDoSistema />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/conselhointermediario" element={<ConselhoIntermediario />} />
          {/* <Route path="/preconselho" element={<PreConselho />} /> */}
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/conselhofinal" element={<ConselhoFinal/>}/>

          {/* rotas do relatorio */}
          <Route path="/relatorios/ata" element={<GerarAta />} />
          <Route path="/relatorios/relatorio" element={<GerarRelatorio />} />
          <Route path="/relatorios/termo" element={<GerarTermoCiencia />} />
        </Route>

        <Route path="/cadastrarusuario" element={<Cadastro />} /> 
        <Route path="/recuperarsenha" element={<Senha />} /> 
        <Route path="/atribuirturma" element={<Turma />}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;