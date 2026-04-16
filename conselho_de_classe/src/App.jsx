import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// 1. Importe a sua tela de Login (ajuste o caminho se necessário)
import Login from './pages/Login'; 

// 2. Importe os seus componentes visuais
import { Header } from './components/header/header.jsx';
import { Sidebar } from './components/sidebar/sidebar.jsx';
import { ConselhoIntermediario } from './components/conselho-intermediario/conselho-intermediario.jsx';

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
        {/* Rota 1: Tela Inicial (Login puro, sem barras) */}
        <Route path="/" element={<Login />} />

        {/* Rota 2: O Sistema (Com barras e o Conselho) */}
        <Route path="/dashboard" element={<LayoutDoSistema />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;