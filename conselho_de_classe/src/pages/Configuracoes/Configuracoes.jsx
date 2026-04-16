import React from 'react';
import './configuracoes.css';

export function Configuracoes() {
  return (
    <div className="configuracoes-wrapper">
      <h2 className="titulo-pagina">Configurações</h2>

      <div className="card-config">
        <h3 className="titulo-card">Configurações do Sistema</h3>

        <div className="grid-config">
          {/* Coluna da Esquerda (Uploads) */}
          <div className="coluna-esq">
            <div className="grupo-input">
              <label>Carregar Planilha SGSET:</label>
              <div className="input-falso">
                <span className="texto-placeholder">Selecione um Arquivo...</span>
                <span className="icone-nuvem"><img src="img\nuvem.png" alt="" /></span>
              </div>
            </div>

            <div className="grupo-input">
              <label>Carregar Backup Database:</label>
              <select className="input-select">
                <option value="">Selecione um backup...</option>
                <option value="backup1">Backup - 10/04/2026</option>
              </select>
            </div>
          </div>

          {/* Coluna da Direita (Ações) */}
          <div className="coluna-dir">
            <div className="linha-acao">
              <label>Cadastrar Novo Usuário:</label>
              <button className="btn-acao">Cadastrar</button>
            </div>
            
            <div className="linha-acao">
              <label>Recuperar/Alterar Senha:</label>
              <button className="btn-acao">Recuperar</button>
            </div>
            
            <div className="linha-acao">
              <label>Atribuir Turma a Docente:</label>
              <button className="btn-acao">Atribuir</button>
            </div>
          </div>
        </div>

        {/* Botões do Rodapé */}
        <div className="rodape-acoes">
          <button className="btn-cancelar">Cancelar</button>
          <button className="btn-atualizar">Atualizar</button>
        </div>
      </div>
    </div>
  );
}