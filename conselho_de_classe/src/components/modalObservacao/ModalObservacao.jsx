import React, { useEffect, useState } from 'react';
import { API, authFetch } from '../../config/api';
import { toast } from 'sonner';
 
/**
 * Props:
 *  - isOpen          : boolean
 *  - onClose         : () => void
 *  - aluno           : { nome, observacoes: [{ id, texto, data, docente, docenteId, dataRaw? }] }
 *  - idTurma         : number | string  — necessário para buscar todos os docentes da turma
 *  - idUsuarioLogado : number | string  — id do usuário atual (docente ou admin)
 *  - somenteLeitura  : boolean          — se true, esconde os botões de ação
 *  - onAdicionar     : (aluno, obs?) => void  — abre modal de edição
 *  - onSuccess       : () => void       — recarrega dados após alteração
 *  - onExcluir       : (idObs) => void  — callback externo de exclusão (opcional)
 */
function ModalObservacoes({
  isOpen,
  onClose,
  aluno,
  idTurma,
  idUsuarioLogado,
  somenteLeitura = false,
  onAdicionar,
  onSuccess,
  onExcluir,
}) {
  const [docentesTurma, setDocentesTurma] = useState([]);
 
  // Busca todos os docentes atribuídos à turma sempre que o modal abre
  useEffect(() => {
    if (!isOpen || !idTurma) return;
 
    authFetch(API.docentesTurma(idTurma))
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) setDocentesTurma(data.docentes);
      })
      .catch(() => {});
  }, [isOpen, idTurma]);
 
  if (!isOpen) return null;
 
  const observacoes = aluno?.observacoes || [];
 
  // "Docente(s):" mostra TODOS os docentes da turma (não só os que têm obs)
  const nomesDocentes =
    docentesTurma.length > 0
      ? docentesTurma.map(d => d.nomeUsuario).join(', ')
      : observacoes.length > 0
        // fallback: usa os docentes que aparecem nas observações
        ? [...new Set(observacoes.map(o => o.docente))].join(', ')
        : 'Nenhum docente atribuído';
 
  const handleExcluir = (obs) => {
    // Usa callback externo quando disponível (ex: TurmasDocente)
    if (onExcluir) {
      onClose();
      onExcluir(obs.id);
      return;
    }
 
    toast('Tem certeza que deseja excluir esta observação?', {
      action: {
        label: 'Excluir',
        onClick: async () => {
          try {
            // Envia idUsuario como query param para validação no backend
            const url = `${API.observacoes}/${obs.id}${idUsuarioLogado ? `?idUsuario=${idUsuarioLogado}` : ''}`;
            const res = await authFetch(url, { method: 'DELETE' });
            const data = await res.json();
 
            if (res.ok && data.sucesso) {
              toast.success('Observação excluída com sucesso!');
              onClose();
              if (onSuccess) onSuccess();
            } else {
              toast.error(`Erro: ${data.mensagem || 'Tente novamente.'}`);
            }
          } catch (error) {
            console.error('Erro ao excluir:', error);
            toast.error('Erro de conexão ao tentar excluir.');
          }
        },
      },
      cancel: { label: 'Cancelar', onClick: () => {} },
      duration: 6000,
    });
  };
 
  // Um docente só pode editar/excluir suas próprias observações
  // Admin (somenteLeitura = true) não vê os botões de ação
  const podeAgir = (obs) => {
    if (somenteLeitura) return false;
    if (!idUsuarioLogado) return true; // sem controle (legado)
    return Number(obs.docenteId) === Number(idUsuarioLogado);
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 p-8 shadow-2xl">
 
        <h2 className="text-center text-xl font-bold mb-1 border-b border-gray-300 pb-3">
          Observações Lançadas pelo Docente
        </h2>
 
        <div className="flex justify-between text-sm text-gray-600 my-3">
          <span>
            Docente(s): <strong className="text-gray-800">{nomesDocentes}</strong>
          </span>
          <span>
            Aluno: <strong className="text-gray-800">{aluno?.nome}</strong>
          </span>
        </div>
 
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-semibold border-b border-gray-300 w-[120px]">DATA</th>
                <th className="p-3 text-left font-semibold border-b border-gray-300">OBSERVAÇÃO</th>
                {/* Coluna Docente — sempre visível para contextualizar de quem é cada obs */}
                <th className="p-3 text-left font-semibold border-b border-gray-300 w-[130px]">DOCENTE</th>
                {/* Coluna de ações só aparece quando não é somente leitura */}
                {!somenteLeitura && (
                  <th className="p-3 border-b border-gray-300 w-[80px] text-center">AÇÕES</th>
                )}
              </tr>
            </thead>
            <tbody>
              {observacoes.length > 0 ? (
                observacoes.map((obs, i) => (
                  <tr key={i} className="border-b border-gray-200 last:border-0">
                    <td className="p-3 text-gray-700">{obs.data}</td>
                    <td className="p-3 text-gray-700">{obs.texto}</td>
                    <td className="p-3 text-gray-600 italic">{obs.docente || '—'}</td>
 
                    {!somenteLeitura && (
                      <td className="p-3">
                        {podeAgir(obs) ? (
                          <div className="flex gap-2 justify-center">
                            {/* Editar */}
                            <button
                              onClick={() => onAdicionar(aluno, obs)}
                              className="text-gray-500 hover:text-blue-600 transition-colors"
                              title="Editar"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                              </svg>
                            </button>
                            {/* Excluir */}
                            <button
                              onClick={() => handleExcluir(obs)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Excluir"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        ) : (
                          // Observação de outro docente — só leitura para este usuário
                          <span className="text-xs text-gray-400 text-center block" title="Observação de outro docente">
                            —
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={somenteLeitura ? 3 : 4}
                    className="p-6 text-center text-gray-400 italic"
                  >
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
