import React from 'react';
import { API } from '../../config/api';

function ModalObservacoes({ isOpen, onClose, aluno, onAdicionar, onSuccess, somenteLeitura = false }) {
  if (!isOpen) return null;
 
  const observacoes = aluno?.observacoes || [];
  const docentesUnicos = [...new Set(observacoes.map(obs => obs.docente))];
  const nomesDosDocentes = docentesUnicos.length > 0 ? docentesUnicos.join(', ') : 'Nenhuma observação';

  const handleExcluir = async (idObservacao) => {
    if (!window.confirm("Tem certeza que deseja excluir esta observação?")) return;

    try {
      const res = await fetch(`${API.observacoes}/${idObservacao}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.sucesso) {
        alert('Observação excluída com sucesso!');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        alert(`Erro ao excluir: ${data.mensagem || 'Tente novamente.'}`);
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert('Erro de conexão com o servidor ao tentar excluir.');
    }
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 p-8 shadow-2xl">
 
        <h2 className="text-center text-xl font-bold mb-1 border-b border-gray-300 pb-3">
          Observações Lançadas pelo Docente
        </h2>
 
        <div className="flex justify-between text-sm text-gray-600 my-3">
          <span>Docente(s): <strong className="text-gray-800">{nomesDosDocentes}</strong></span>
          <span>Aluno: <strong className="text-gray-800">{aluno?.nome}</strong></span>
        </div>
 
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-semibold border-b border-gray-300 w-[140px]">DATA</th>
                <th className="p-3 text-left font-semibold border-b border-gray-300">OBSERVAÇÃO</th>
                {!somenteLeitura && <th className="p-3 border-b border-gray-300 w-[80px]">AÇÕES</th>}
              </tr>
            </thead>
            <tbody>
              {observacoes.length > 0 ? (
                observacoes.map((obs, i) => (
                  <tr key={i} className="border-b border-gray-200 last:border-0">
                    <td className="p-3 text-gray-700">{obs.data}</td>
                    <td className="p-3 text-gray-700">{obs.texto}</td>
                    
                    {/* Renderização Condicional com base no nível de privilégio admin */}
                    {!somenteLeitura && (
                      <td className="p-3 flex gap-2 justify-center">
                        <button
                          onClick={() => onAdicionar(aluno, obs)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleExcluir(obs.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors" 
                          title="Excluir"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={somenteLeitura ? 2 : 3} className="p-6 text-center text-gray-400 italic">
                    Nenhuma observação registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
 
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-12 py-2 border border-gray-400 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalObservacoes;