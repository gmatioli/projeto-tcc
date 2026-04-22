import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Bem-vindo ao Dashboard do Conselho de Classe!</h1>
    </div>
  );
}
