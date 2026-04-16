import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <h1>Bem-vindo ao Dashboard do Conselho de Classe!</h1>
      <button onClick={() => navigate('/')}>Sair</button>
    </div>
  );
}

export default Dashboard;