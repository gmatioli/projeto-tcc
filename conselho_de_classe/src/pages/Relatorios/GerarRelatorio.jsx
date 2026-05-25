import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, authFetch } from '../../config/api';
import { toast } from 'sonner';



export function GerarRelatorio() {

  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================
  const [conselho, setConselho] = useState('');
  const [semestre, setSemestre] = useState('');
  const [ano, setAno] = useState('');

  // Estado para armazenar as opções únicas de Semestre/Ano
  const [opcoesSemestreAno, setOpcoesSemestreAno] = useState([]);

 // Busca as datas no backend e filtra os semestres/anos únicos
   useEffect(() => {
     const buscarDados = async () => {
       try {
         const response = await authFetch(`${API.relatorio}/datas`);
         if (response.ok) {
           const dados = await response.json();
           
           // TRAVA DE SEGURANÇA: Garante que estamos iterando sobre um array
           // Algumas libs de banco retornam o array dentro de "dados.rows"
           const lista = Array.isArray(dados) ? dados : (dados.rows || []);
           
           const combinacoes = [];
           const setUnicos = new Set();
           
           // Percorre a lista segura e separa as opções únicas
           lista.forEach(item => {
             // Verifica se não é nulo/vazio
             if (item.semestre != null && item.ano != null && String(item.semestre).trim() !== '') {
               const chave = `${item.semestre}/${item.ano}`;
               if (!setUnicos.has(chave)) {
                 setUnicos.add(chave);
                 combinacoes.push({ 
                   valor: chave, 
                   semestre: item.semestre, 
                   ano: item.ano,
                   dataConselho: item.dataFormatada
                 });
               }
             }
           });
           
           setOpcoesSemestreAno(combinacoes);
         }
       } catch (error) {
         toast.error('Erro ao buscar dados do conselho:', error);
       }
     };
     buscarDados();
   }, []);

  // ==========================================
  // LIMPAR
  // ==========================================
  const handleLimpar = () => {

    setConselho('');
    setSemestre('');
    setAno('');
  };

  const handleSelecionarSemestreAno = (e) => {
    const valor = e.target.value;
    if (valor) {
      const [sem, a] = valor.split('/');
      setSemestre(sem);
      setAno(a);
    } else {
      setSemestre('');
      setAno('');
    }
  };
  // ==========================================
  // GERAR RELATÓRIO
  // ==========================================
  const handleGerar = async () => {

    if (
      !conselho ||
      !semestre 
    ) {

      toast.warning('Preencha todos os campos.');

      return;
    }

    try {
       // Procura a opção selecionada para resgatar a data dela
      const opcaoEscolhida = opcoesSemestreAno.find(
        (op) => op.semestre == semestre && op.ano == ano
      );

      // Fallback de segurança para o dia de hoje caso algo dê errado
      const dataParaEnviar = opcaoEscolhida ? opcaoEscolhida.dataConselho : new Date().toLocaleDateString('pt-BR');

      
      const dados = {
        conselho,
        semestre,
        ano,
        dataConselho: dataParaEnviar // Agora estamos enviando a data!
      };

      const response = await authFetch(
         `${API.relatorio}/gerar-doc`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        }
      );

      if (!response.ok) {

        const erro = await response.json();

        toast.error(erro.mensagem);

        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      // Define o nome do arquivo baseado no tipo de conselho
      let nomeArquivo;
      if (conselho === 'preConselho') {
        nomeArquivo = `Pre_Conselho_Sem${semestre}_Ano${ano}.docx`;
      } else if (conselho === 'intermediario') {
        nomeArquivo = `Conselho_Intermediario_Sem${semestre}_Ano${ano}.docx`;
      } else {
        nomeArquivo = `Relatorio_Sem${semestre}_Ano${ano}.docx`;
      }

      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Relatório gerado com sucesso')
    } catch (erro) {
      toast.error('Erro ao gerar relatório');
    }
  };

  return (

    <div className="flex flex-col h-full bg-gray-100 p-5 overflow-auto">

      {/* Breadcrumb */}
      <nav className="mb-4">

        <span className="text-sm text-gray-500">

          <button
            onClick={() => navigate('/dashboard')}
            className="hover:underline text-gray-500"
          >
            Relatórios
          </button>

          {' / '}

          <span className="font-medium text-gray-700">
            Gerar Relatório
          </span>

        </span>

      </nav>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 w-full max-w-3xl mx-auto">

        <h1 className="text-center text-xl font-bold tracking-widest text-gray-800 mb-8 uppercase">
          Geração de Relatório
        </h1>

        {/* CONSELHO */}
        <div className="mb-5">

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conselho(*):
          </label>

          <select
            value={conselho}
            onChange={(e) => setConselho(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
          >

            <option value="" disabled hidden>
              Selecione
            </option>

            <option value="preConselho">
              Pré Conselho
            </option>

            <option value="intermediario">
              Conselho Intermediário
            </option>

          </select>

        </div>

        {/* LINHA 1 */}
        <div className="grid grid-cols-1 gap-4 mb-5">

           {/* Semestre / Ano (Montado a partir dos dados do banco) */}
            <div className="flex-[2]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semestre / Ano Referência (*):
              </label>
              <select
                value={semestre && ano ? `${semestre}/${ano}` : ''}
                onChange={handleSelecionarSemestreAno}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
              >
                <option value="">
                  {opcoesSemestreAno.length === 0 ? 'Carregando períodos...' : 'Selecione o período...'}
                </option>
                {opcoesSemestreAno.map((op) => (
                  <option key={op.valor} value={op.valor}>
                    {op.semestre}º Semestre / {op.ano}
                  </option>
                ))}
              </select>
            </div>

        </div>

        {/* BOTÕES */}
        <div className="flex justify-center gap-6">

          <button
            onClick={handleLimpar}
            className="px-10 py-3 rounded-full border-2 border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition font-medium text-sm hover:scale-95 hover:opacity[0.8]"
          >
            Limpar
          </button>

          <button
            onClick={handleGerar}
            className="px-10 py-3 rounded-full bg-[var(--red-senai)] border-2 border-red-800 text-white hover:bg-red-800 transition font-medium text-sm shadow hover:scale-95 hover:opacity[0.8]"
          >
            Gerar
          </button>

        </div>

      </div>

    </div>
  );
}