import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// 1. Importe a sua tela de Login (ajuste o caminho se necessário)
import Login from './pages/Login/Login.jsx'; 

// 2. Importe os seus componentes visuais
import { Header } from './components/header/Header.jsx';
import { Sidebar } from './components/sidebar/sidebar.jsx';
import { ConselhoIntermediario } from './components/conselho-intermediario/Conselho-intermediario.jsx';
import { Configuracoes } from './pages/Configuracoes/Configuracoes.jsx';
import { Cadastro } from './pages/Cadastro/Cadastro.jsx';

// --- CRIANDO O MOLDE DO PAINEL ---
// Esse componente vai envelopar as telas que precisam de menu e cabeçalho
function LayoutDoSistema() {
  return (
    <div className="app-wrapper">
      <Header /> {/* Fica no topo */}
      <div className="main-container">
        <Sidebar />
        <main className="content-area">
          {/* Aqui dentro vai o conteúdo principal */}
          <ConselhoIntermediario />
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
        <Route path="/" element={<Login />} />
        
        {/* LayoutDoSistema envelopa as rotas protegidas */}
        <Route path="/conselhointermediario" element={<LayoutDoSistema />}>
          {/* Se tiver sub-rotas, você pode configurar, ou usar rotas irmãs */}
        </Route>

        {/* Nova Rota para Configurações usando o mesmo molde! */}
        <Route path="/configuracoes" element={
          <div className="app-wrapper">
            <Header />
            <div className="main-container">
              <Sidebar />
              <main className="content-area">
                <Configuracoes /> {/* A nova tela entra aqui! */}
              </main>
            </div>
          </div>
        } />

        <Route path="/cadastrarusuario" element={
        
          <Cadastro/>
              
        } >
        </Route>

      </Routes>

     

  </BrowserRouter>
  );
}

export default App;