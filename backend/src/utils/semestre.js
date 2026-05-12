function getSemestreAtual(date = new Date()) {
  const mes = date.getMonth() + 1;
  const ano = date.getFullYear();
  const semestre = mes <= 6 ? 1 : 2;
  return { semestre, ano };
}

function mesmoSemestre(a, b) {
  return a && b && a.semestre === b.semestre && a.ano === b.ano;
}

module.exports = { getSemestreAtual, mesmoSemestre };
