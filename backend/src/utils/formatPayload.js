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
 
    // exec
    exec_qualidadeTrabalho:       chk(payload.exec.qualidadeTrabalho),
    exec_iniciativa:              chk(payload.exec.iniciativa),
    exec_comprometimento:         chk(payload.exec.comprometimento),
    exec_ritmoTrabalho:           chk(payload.exec.ritmoTrabalho),
    exec_participacao:            chk(payload.exec.participacao),
    exec_focoResultado:           chk(payload.exec.focoResultado),
    exec_manuseioMaquinas:        chk(payload.exec.manuseioMaquinas),
    exec_cumprimentoMetas:        chk(payload.exec.cumprimentoMetas),
    exec_naoRealizacaoAtividade: chk(payload.exec.naoRealizacaoAtividade),
    exec_outroExec:               payload.exec.outroExec || '',
 
    // hig
    hig_usoEPI:             chk(payload.hig.usoEPI),
    hig_cuidadosBensEscola: chk(payload.hig.cuidadosBensEscola),
    hig_normasSeguranca:    chk(payload.hig.normasSeguranca),
    hig_higienePessoal:     chk(payload.hig.higienePessoal),
    hig_cuidadosAmbiente:   chk(payload.hig.cuidadosAmbiente),
    hig_usoUniforme:        chk(payload.hig.usoUniforme),
    hig_outroHig:           payload.hig.outroHig || '',
 
    // qual
    qual_comunicar:     chk(payload.qual.comunicar),
    qual_motivacao:     chk(payload.qual.motivacao),
    qual_assiduidade:   chk(payload.qual.assiduidade),
    qual_ouvir:         chk(payload.qual.ouvir),
    qual_disciplina:    chk(payload.qual.disciplina),
    qual_conhecimento:  chk(payload.qual.conhecimento),
    qual_sociabilidade: chk(payload.qual.sociabilidade),
    qual_cooperacao:    chk(payload.qual.cooperacao),
    qual_etica:         chk(payload.qual.etica),
    qual_outroQual:     payload.qual.outroQual || '',
 
    // sugAluno
    sugAluno_frequentar:             chk(payload.sugAluno.frequentar),
    sugAluno_manterAtento:           chk(payload.sugAluno.manterAtento),
    sugAluno_refazerAvaliacoes:      chk(payload.sugAluno.refazerAvaliacoes),
    sugAluno_estudarConteudos:       chk(payload.sugAluno.estudarConteudos),
    sugAluno_observarRegras:         chk(payload.sugAluno.observarRegras),
    sugAluno_procurarPlantao:        chk(payload.sugAluno.procurarPlantao),
    sugAluno_organizarHorario:       chk(payload.sugAluno.organizarHorario),
    sugAluno_realizarTarefas:        chk(payload.sugAluno.realizarTarefas),
    sugAluno_realizarReposicao:      chk(payload.sugAluno.realizarReposicao),
    sugAluno_fazerAnotacoes:         chk(payload.sugAluno.fazerAnotacoes),
    sugAluno_participarEfetivamente: chk(payload.sugAluno.participarEfetivamente),
    sugAluno_outroSugAluno:          payload.sugAluno.outroSugAluno || '',
 
    // sugResp
    sugResp_habitosEstudo:      chk(payload.sugResp.habitosEstudo),
    sugResp_manterContato:      chk(payload.sugResp.manterContato),
    sugResp_conciliarHorario:   chk(payload.sugResp.conciliarHorario),
    sugResp_atentarFrequencia:  chk(payload.sugResp.atentarFrequencia),
    sugResp_acompanharAtividade:chk(payload.sugResp.acompanharAtividade),
 
    // encaminhar
    encaminhar_opp: chk(payload.encaminhar.opp),
    encaminhar_aqv: chk(payload.encaminhar.aqv),
    encaminhar_ct:  chk(payload.encaminhar.ct),
    encaminhar_cap: chk(payload.encaminhar.cap),
 
    criterios: payload.criterios || '',
 
    // prov
    prov_opp:              chk(payload.prov.opp),
    prov_aqv:              chk(payload.prov.aqv),
    prov_ct:               chk(payload.prov.ct),
    prov_cap:              chk(payload.prov.cap),
    prov_planoReposicao:   chk(payload.prov.planoReposicao),
    prov_reuniaoResp:      chk(payload.prov.reuniaoResp),
    prov_planoRecuperacao: chk(payload.prov.planoRecuperacao),
    prov_sancaoDisciplinar:chk(payload.prov.sancaoDisciplinar),
    prov_outro:            payload.prov.outro || '',
 
    obsEscola: payload.obsEscola || '',
 
    // plano
    plano_recuperacaoConteudo: chk(payload.plano.recuperacaoConteudo),
    plano_reposicaoAusencia:   chk(payload.plano.reposicaoAusencia),
  };
}
 
module.exports = { formatPayload };