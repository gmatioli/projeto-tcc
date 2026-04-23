import React, { useState } from 'react';
import './conselho-final.css';

const ConselhoFinal = () => {
  const turmas = [
    { id: 1, nome: 'CPTMTDS4T126', preConselho: 'Reprovado(s):0 Restrito(s):2', conselhoFinal: 'Pendente' },
    { id: 2, nome: 'CPTMTDS2T', preConselho: 'Reprovado(s):0 Restrito(s):2', conselhoFinal: 'Realizada' },
  ];

  const alunos = [
    { 
      id: 1, nome: 'Jorge Marques de Salves', 
      preConselhoTexto: 'Excesso de faltas em PSOF 22/20 e plano de reposição de aulas',
      obsCount: 0, temJustificativa: false, textoJustificativa: '', status: 'aprovado' 
    },
    { 
      id: 2, nome: 'Maria Alves da Silva', 
      preConselhoTexto: 'Excesso de faltas em PFE 26/20 e plano de reposição de aulas',
      obsCount: 1, temJustificativa: true, textoJustificativa: 'Atestado médico.', status: 'aprovado-conselho'
    },
    { 
      id: 3, nome: 'Roberto Paulo Dominique', 
      preConselhoTexto: 'Excesso de faltas em PSOF 30/20 e plano de reposição de aulas',
      obsCount: 3, temJustificativa: true, textoJustificativa: 'Problemas familiares.', status: 'reprovado'
    }
  ];

  const [turmaSelecionada, setTurmaSelecionada] = useState(turmas[0].id);

  // Filtra apenas os alunos que possuem justificativa
  const alunosComJustificativa = alunos.filter(aluno => aluno.temJustificativa);

  return (
    <div className="conselho-tables-container">
      
      {/* SEÇÃO SUPERIOR: TURMAS + JUSTIFICATIVAS LADO A LADO */}
      <section className="top-section">
        
        {/* Tabela de Turmas (Esquerda) */}
        <div className="table-wrapper turmas-wrapper">
          <table className="custom-table table-bordered">
            <thead>
              <tr>
                <th>Turma(s)</th>
                <th>Pré Conselho</th>
                <th>Conselho Final</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map(turma => (
                <tr key={turma.id}>
                  <td>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <input 
                        type="radio" 
                        name="turma" 
                        checked={turmaSelecionada === turma.id}
                        onChange={() => setTurmaSelecionada(turma.id)}
                      /> 
                      {turma.nome}
                    </label>
                  </td>
                  <td>{turma.preConselho}</td>
                  <td>{turma.conselhoFinal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabela de Justificativas (Direita - Ocupando o espaço vazio) */}
        <div className="table-wrapper justificativas-wrapper">
          <table className="custom-table table-bordered">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Aluno</th>
                <th style={{ width: '60%' }}>Justificativa</th>
              </tr>
            </thead>
            <tbody>
              {alunosComJustificativa.length > 0 ? (
                alunosComJustificativa.map(aluno => (
                  <tr key={`just-${aluno.id}`}>
                    <td style={{ fontWeight: 'bold', fontSize: '12px' }}>{aluno.nome}</td>
                    <td className="text-muted" style={{ fontSize: '12px' }}>{aluno.textoJustificativa}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="center-text text-muted">Nenhuma justificativa na turma.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Botões de Ação (Extrema Direita) */}
        <div className="turmas-actions">
          <button className="btn-primary">Avaliar turma</button>
          <button className="btn-secondary">Salvar alterações</button>
        </div>

      </section>

      {/* SEÇÃO INFERIOR: ALUNOS GERAL */}
      <section className="alunos-section">
        <table className="custom-table table-bordered">
          <thead>
            <tr>
              <th>Alunos</th>
              <th>Pré Conselho</th>
              <th>Conselho final</th>
              <th>Avaliação Situação Final</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map(aluno => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>
                  <p>{aluno.preConselhoTexto}</p>
                  <button className="link-btn">🔔 Ver Observações ({aluno.obsCount})</button>
                </td>
                <td className="center-text">
                  {aluno.temJustificativa ? (
                    <span className="badge-justificativa">Ver Acima</span>
                  ) : '-'}
                </td>
                <td className="status-cell">
                  <button className={`status-btn ${aluno.status === 'aprovado' ? 'aprovado' : ''}`}>
                    Aprovado
                  </button>
                  <button className={`status-btn ${aluno.status === 'aprovado-conselho' ? 'aprovado-conselho' : ''}`}>
                    Aprovado pelo Conselho
                  </button>
                  <button className={`status-btn ${aluno.status === 'reprovado' ? 'reprovado' : ''}`}>
                    Reprovado
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
};

export default ConselhoFinal;