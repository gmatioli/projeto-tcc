import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, authFetch } from '../../config/api';
import {toast} from 'sonner';

export function GerarTermoCiencia() {

  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================
  const [tipoCurso, setTipoCurso] = useState('');
  const [turma, setTurma] = useState('');
  const [aluno, setAluno] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [semestre, setSemestre] = useState('');
  const [ano, setAno] = useState('');
  const [opcoesSemestreAno, setOpcoesSemestreAno] = useState([]);
  // ==========================================
  // LISTAS
  // ==========================================
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  

// ==========================================
// FILTRAR TURMAS PELO TIPO
// ==========================================
const turmasFiltradas = turmas.filter((t) => {

  if (tipoCurso === 'tecnico') {

    return t.tipo === 'Curso Técnico';
  }

  if (tipoCurso === 'aprendizagem') {

    return t.tipo === 'Aprendizagem Industrial';
  }

  return false;
});
// =============================
// Novo use effech
// =============================
useEffect(() => {
  authFetch(`${API.relatorio}/datas`)
    .then(res => res.json())
    .then(dados => {
      const lista = Array.isArray(dados) ? dados : (dados.rows || []);
      const combinacoes = [];
      const setUnicos = new Set();
      lista.forEach(item => {
        if (item.tipoConselho !== 'Intermediário') return;
        if (item.semestre != null && item.ano != null) {
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
    });
}, []);
  // ==========================================
  // BUSCAR TURMAS
  // ==========================================
  useEffect(() => {

    authFetch(API.turmas)

      .then((res) => res.json())

      .then((data) => {

        console.log('TURMAS:', data);

        setTurmas(data);
      })

      .catch((erro) => {

        console.log(erro);

        toast.warning('Erro ao carregar turmas');
      });

  }, []);

  // ==========================================
  // BUSCAR ALUNOS DA TURMA
  // ==========================================
  useEffect(() => {

    // se não selecionou turma
    if (!turma) {

      setAlunos([]);
      return;
    }

    authFetch(`${API.alunos}?turma=${turma}`)

      .then((res) => res.json())

      .then((data) => {

        console.log('ALUNOS:', data);

        setAlunos(data);
      })

      .catch((erro) => {

        console.log(erro);

        toast.warning('Erro ao carregar alunos');
      });

  }, [turma]);

  // ==========================================
  // LIMPAR
  // ==========================================
  const handleLimpar = () => {

    setTipoCurso('');
    setTurma('');
    setAluno('');
    setSemestre('');
    setAno('');    
    setObservacoes('');
  };

  // ==========================================
  // Semestre ano
  // ==========================================
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
  // GERAR DOCX
  // ==========================================
  const handleGerar = async () => {
  if (!tipoCurso || !turma || !aluno || !semestre || !ano) {
    toast.warning('Preencha todos os campos obrigatórios.');
    return;
  }

  const opcao = opcoesSemestreAno.find(
    op => op.semestre == semestre && op.ano == ano
  );

  const dados = {
    idAluno: aluno,
    turma,
    semestre: Number(semestre),
    ano: Number(ano),
    dataConselho: opcao?.dataConselho || '',
    observacao: observacoes
  };

  try {
    const response = await authFetch(API.termoDeCiencia, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!response.ok) {
      const erroServidor = await response.json();
      toast.error(`Erro: ${erroServidor.mensagem}`);
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const alunoSelecionado = alunos.find(
      a => String(a.idtblAluno) === String(aluno)
    );
    const nomeAluno = alunoSelecionado?.nome || 'aluno';

    const nomeArquivo = nomeAluno
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')   // tira acentos
      .replace(/\s+/g, '_');             // troca espaços por _

    a.download = `TermoCiencia_${nomeArquivo}.docx`;

    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error(error);
    toast.error('Erro ao gerar documento');
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
            Gerar Termo de Ciência
          </span>

        </span>

      </nav>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 w-full max-w-3xl mx-auto">

        <h1 className="text-center text-xl font-bold tracking-widest text-gray-800 mb-8 uppercase">
          Geração de Termo de Ciência
        </h1>

        {/* TIPO + TURMA */}
        <div className="flex gap-4 mb-5">

          {/* TIPO */}
          <div className="flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Curso(*):
            </label>

            <select
              value={tipoCurso}
             onChange={(e) => {
              setTipoCurso(e.target.value);
                setTurma('');
                setAluno('');
                setAlunos([]);
                }}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
            >

              <option value="">
                Selecione...
              </option>

              <option value="tecnico">
                Curso Técnico
              </option>

              <option value="aprendizagem">
                Aprendizagem Industrial
              </option>

            </select>

          </div>

          {/* TURMA */}
          <div className="flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turma(*):
            </label>

            <select
              value={turma}
              onChange={(e) => {

                setTurma(e.target.value);

                // limpa aluno ao trocar turma
                setAluno('');
              }}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
            >

              <option value="">
                Selecione...
              </option>

              {Array.isArray(turmasFiltradas) && turmasFiltradas.map((t) => (

                <option
                  key={t.idTurma}
                  value={t.codigo}
                >
                  {t.codigo}
                </option>

              ))}

            </select>

          </div>

        </div>

        {/* ALUNO + DATA */}
        <div className="flex gap-4 mb-5">

          {/* ALUNO */}
          <div className="flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aluno(*):
            </label>

            <select
              value={aluno}
              onChange={(e) => setAluno(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
            >

              <option value="">
                Selecione...
              </option>

              {Array.isArray(alunos) && alunos.map((a) => (

                <option
                  key={a.idtblAluno}
                  value={a.idtblAluno}
                >
                  {a.nome}
                </option>

              ))}

            </select>

          </div>

          {/* DATA */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Semestre / Ano Referência (*):</label>
            <select
              value={semestre && ano ? `${semestre}/${ano}` : ''}
              onChange={handleSelecionarSemestreAno}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3">              
              <option value="">Selecione o período</option>
              {opcoesSemestreAno.map(op => (
                <option key={op.valor} value={op.valor}>
                  {op.semestre}º Semestre / {op.ano}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* OBSERVAÇÃO */}
        <div className="mb-8">

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações:
          </label>

          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 resize-none"
          />

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