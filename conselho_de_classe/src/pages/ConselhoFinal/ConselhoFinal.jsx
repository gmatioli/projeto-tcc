import React, { useState } from 'react';
import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg';
import ModalJustificativa from '../../components/modalJustificativa/ModalJustificativa.jsx';

const intObservacoes = 3

const ConselhoFinal = () => {
  const turmas = [
    { id: 1, nome: 'CPTMTDS4T126', preConselho: 'Reprovado(s):0 Restrito(s):2', conselhoFinal: 'Pendente' },
    { id: 2, nome: 'CPTMTDS2T', preConselho: 'Reprovado(s):0 Restrito(s):2', conselhoFinal: 'Realizada' },
    { id: 3, nome: 'CPTMTDS2T', preConselho: 'Reprovado(s):0 Restrito(s):2', conselhoFinal: 'Realizada' },
    { id: 4, nome: 'CPTMTDS2T', preConselho: 'Reprovado(s):0 Restrito(s):2', conselhoFinal: 'Realizada' },
    { id: 5, nome: 'CPTMTDS2T', preConselho: 'Reprovado(s):0 Restrito(s):2', conselhoFinal: 'Realizada' },
    { id: 6, nome: 'CPTMTDS2T', preConselho: 'Reprovado(s):0 Restrito(s):2', conselhoFinal: 'Realizada' },
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
    },
    { 
      id: 4, nome: 'Ana Carolina Mendonça', 
      preConselhoTexto: 'Desempenho abaixo da média em Banco de Dados (BD) no 2º semestre',
      obsCount: 0, temJustificativa: false, textoJustificativa: '', status: 'reprovado'
    },
    { 
      id: 5, nome: 'Lucas Ferreira Gomes', 
      preConselhoTexto: 'Faltas pontuais em LOP, mas entregou o projeto final com sucesso',
      obsCount: 2, temJustificativa: true, textoJustificativa: 'Declaração de trabalho no dia das aulas.', status: 'aprovado-conselho'
    },
    { 
      id: 6, nome: 'Beatriz Souza Lima', 
      preConselhoTexto: 'Sem pendências graves, atingiu todas as competências necessárias',
      obsCount: 0, temJustificativa: false, textoJustificativa: '', status: 'aprovado'
    }
  ];

  const [turmaSelecionada, setTurmaSelecionada] = useState(turmas[0].id);

  const alunosComJustificativa = alunos.filter(aluno => aluno.temJustificativa);

  // Variável para evitar repetição nas células de tabela padronizadas
  const tableThClasses = "border border-[#ddd] p-[12px_15px] text-left font-bold bg-white sticky top-0 z-10";
  const tableTdClasses = "border border-[#ddd] p-[12px_15px] text-left";
  const btnClasses = "border border-black shadow-[3px_3px_5px_gray]"

  const [isModalJustificativaOpen, setIsModalJustificativaOpen] = useState(false);

  const handleOpenModalJustificativa = () => setIsModalJustificativaOpen(true);
  const handleCloseModalJustificativa = () => setIsModalJustificativaOpen(false);

  return (
    <div id="conselho-tables-container" className="flex flex-col gap-2">

      {/* Barra subtitulo */}
      <nav>
        <span className="text-sm text-gray-500">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:underline text-gray-500"
          >
            Conselhos
          </button>
          {' / '}
          <span className="font-medium text-gray-700">Conselho Final</span>
        </span>
      </nav>

      {/* SEÇÃO SUPERIOR: TURMAS + JUSTIFICATIVAS LADO A LADO */}
      <section className="flex gap-[15px] items-start w-full mb-6">
        
        {/* Tabela de Turmas (Esquerda - flex 1.3) */}
        <div className="flex-[1.3] max-h-[180px] overflow-y-auto">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr>
                <th className={`${tableThClasses}`}>Turma(s)</th>
                <th className={`${tableThClasses}`}>Pré Conselho</th>
                <th className={`${tableThClasses}`}>Conselho Final</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map(turma => (
                <tr key={turma.id}>
                  <td className={`${tableTdClasses}`}>
                    <label className='flex items-center gap-2 m-0 cursor-pointer'>
                      <input 
                        type="radio" 
                        name="turma" 
                        checked={turmaSelecionada === turma.id}
                        onChange={() => setTurmaSelecionada(turma.id)}
                      /> 
                      {turma.nome}
                    </label>
                  </td>
                  <td className={`${tableTdClasses}`}>{turma.preConselho}</td>
                  <td className={`${tableTdClasses}`}>{turma.conselhoFinal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabela de Justificativas (Direita - flex 1) */}
        <div className="flex-1 max-h-[180px] overflow-y-auto">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr>
                <th className={`${tableThClasses} w-[40%]`}>Aluno</th>
                <th className={`${tableThClasses} w-[60%]`}>Justificativa</th>
              </tr>
            </thead>
            <tbody>
              {alunosComJustificativa.length > 0 ? (
                alunosComJustificativa.map(aluno => (
                  <tr key={`just-${aluno.id}`}>
                    <td className={`${tableTdClasses} font-bold text-[12px]`}>
                      {aluno.nome}
                    </td>
                    <td className={`${tableTdClasses} text-[#555] italic text-[12px]`}>
                      {aluno.textoJustificativa}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className={`${tableTdClasses} text-center text-[#555] italic`}>
                    Nenhuma justificativa na turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Botões de Ação (Extrema Direita) */}
        <div className="flex flex-col justify-center gap-[15px] w-[150px] shrink-0 h-[180px] ">
          <button className={`${btnClasses} bg-red-500 text-white p-[10px] rounded-[20px] font-bold text-center`}>
            Avaliar turma
          </button>
          <button className={`${btnClasses} bg-gray-400 text-white p-[10px] rounded-[20px] font-bold text-center`}>
            Salvar
          </button>
        </div>

      </section>

      {/* SEÇÃO INFERIOR: ALUNOS GERAL */}
      <section className='h-[64vh] overflow-y-auto'>
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr>
              <th className={`${tableThClasses}`}>Alunos</th>
              <th className={`${tableThClasses}`}>Pré Conselho</th>
              <th className={`${tableThClasses}`}>Conselho final</th>
              <th className={`${tableThClasses}`}>Avaliação Situação Final</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map(aluno => (
              <tr key={aluno.id}>
                <td className={`${tableTdClasses} `}>{aluno.nome}</td>
                <td className={`${tableTdClasses} `}>
                  <p>{aluno.preConselhoTexto}</p>
                  <button className="text-gray-500 text-xs mt-[5px] hover:underline">
                    <div className="flex items-center my-0 mx-1 gap-1">
                      <img src={notificationIcon} alt="" className="w-6 h-6 border border-yellow-600 rounded-full p-[1px]"/>
                      <div className='flex'>
                          <p className="text-m underline">Ver Observações</p>
                          <p className="text-m underline">({intObservacoes})</p>
                      </div>
                  </div>
                  </button>
                </td>
                <td className={`${tableTdClasses} text-center `}>
                  {aluno.temJustificativa ? (
                    <button onClick={handleOpenModalJustificativa} className=" text-orange-600 px-2 py-1 rounded text-xs underline font-bold ">
                      Ver Justificativa
                    </button>
                  ) : '-'}
                </td>
                <td className={`${tableTdClasses} flex flex-col gap-2 items-center p-2`}>
                  
                  {/* Botões de Status com renderização condicional de classes */}
                  <button className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[17px] text-white ${aluno.status === 'aprovado' ? 'bg-green-500' : 'bg-gray-400'}`}>
                    Aprovado
                  </button>
                  <button className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[17px] text-white ${aluno.status === 'aprovado-conselho' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                    Aprovado pelo Conselho
                  </button>
                  <button className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[17px] text-white ${aluno.status === 'reprovado' ? 'bg-red-500' : 'bg-gray-400'}`}>
                    Reprovado
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <ModalJustificativa isOpen={isModalJustificativaOpen} onClose={handleCloseModalJustificativa} />
    </div>
  );
};

export default ConselhoFinal;