function chk(value) {
  return value === true ? 'X' : ' ';
}

function formatPayload(payload) {
  return {
    // Cabeçalho
    aluno:      payload.aluno,
    turma:      payload.turma,
    componente: payload.componente,
    docente:    'Lincoln Bezerra Souza',

    // Objetos aninhados — docxtemplater lê {{exec.qualidadeTrabalho}} corretamente
    exec: {
      qualidadeTrabalho:       chk(payload.exec.qualidadeTrabalho),
      iniciativa:              chk(payload.exec.iniciativa),
      comprometimento:         chk(payload.exec.comprometimento),
      ritmoTrabalho:           chk(payload.exec.ritmoTrabalho),
      participacao:            chk(payload.exec.participacao),
      focoResultado:           chk(payload.exec.focoResultado),
      manuseioMaquinas:        chk(payload.exec.manuseioMaquinas),
      cumprimentoMetas:        chk(payload.exec.cumprimentoMetas),
      naoRealizacaoAtividades: chk(payload.exec.naoRealizacaoAtividades),
      outroExec:               payload.exec.outroExec || '',
    },

    hig: {
      usoEPI:             chk(payload.hig.usoEPI),
      cuidadosBensEscola: chk(payload.hig.cuidadosBensEscola),
      normasSeguranca:    chk(payload.hig.normasSeguranca),
      higienePessoal:     chk(payload.hig.higienePessoal),
      cuidadosAmbiente:   chk(payload.hig.cuidadosAmbiente),
      usoUniforme:        chk(payload.hig.usoUniforme),
      outroHig:           payload.hig.outroHig || '',
    },

    qual: {
      comunicar:     chk(payload.qual.comunicar),
      motivacao:     chk(payload.qual.motivacao),
      assiduidade:   chk(payload.qual.assiduidade),
      ouvir:         chk(payload.qual.ouvir),
      disciplina:    chk(payload.qual.disciplina),
      conhecimento:  chk(payload.qual.conhecimento),
      sociabilidade: chk(payload.qual.sociabilidade),
      cooperacao:    chk(payload.qual.cooperacao),
      etica:         chk(payload.qual.etica),
      outroQual:     payload.qual.outroQual || '',
    },

    sugAluno: {
      frequentar:             chk(payload.sugAluno.frequentar),
      manterAtento:           chk(payload.sugAluno.manterAtento),
      refazerAvaliacoes:      chk(payload.sugAluno.refazerAvaliacoes),
      estudarConteudos:       chk(payload.sugAluno.estudarConteudos),
      observarRegras:         chk(payload.sugAluno.observarRegras),
      procurarPlantao:        chk(payload.sugAluno.procurarPlantao),
      organizarHorario:       chk(payload.sugAluno.organizarHorario),
      realizarTarefas:        chk(payload.sugAluno.realizarTarefas),
      realizarReposicao:      chk(payload.sugAluno.realizarReposicao),
      fazerAnotacoes:         chk(payload.sugAluno.fazerAnotacoes),
      participarEfetivamente: chk(payload.sugAluno.participarEfetivamente),
      outroSugAluno:          payload.sugAluno.outroSugAluno || '',
    },

    sugResp: {
      habitosEstudo:      chk(payload.sugResp.habitosEstudo),
      manterContato:      chk(payload.sugResp.manterContato),
      conciliarHorario:   chk(payload.sugResp.conciliarHorario),
      atentarFrequencia:  chk(payload.sugResp.atentarFrequencia),
      acompanharAtividade:chk(payload.sugResp.acompanharAtividade),
    },

    encaminhar: {
      opp: chk(payload.encaminhar.opp),
      aqv: chk(payload.encaminhar.aqv),
      ct:  chk(payload.encaminhar.ct),
      cap: chk(payload.encaminhar.cap),
    },

    criterios: payload.criterios || '',

    prov: {
      opp:              chk(payload.prov.opp),
      aqv:              chk(payload.prov.aqv),
      ct:               chk(payload.prov.ct),
      cap:              chk(payload.prov.cap),
      planoReposicao:   chk(payload.prov.planoReposicao),
      reuniaoResp:      chk(payload.prov.reuniaoResp),
      planoRecuperacao: chk(payload.prov.planoRecuperacao),
      sancaoDisciplinar:chk(payload.prov.sancaoDisciplinar),
      outro:            payload.prov.outro || '',
    },

    obsEscola: payload.obsEscola || '',

    plano: {
      recuperacaoConteudo: chk(payload.plano.recuperacaoConteudo),
      reposicaoAusencia:   chk(payload.plano.reposicaoAusencia),
    },
  };
}

module.exports = { formatPayload };