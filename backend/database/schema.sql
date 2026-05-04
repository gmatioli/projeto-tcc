-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS "Usuario" (
  "idUsuario"            SERIAL PRIMARY KEY,
  "nomeUsuario"          VARCHAR(255) NOT NULL,
  "emailInstitucional"   VARCHAR(255) NOT NULL UNIQUE,
  "senha"                VARCHAR(255) NOT NULL,
  "nivelAcesso"          VARCHAR(50)  NOT NULL
);

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS "Cursos" (
  "idCurso"   SERIAL PRIMARY KEY,
  "nomeCurso" VARCHAR(255) NOT NULL,
  "tipo"      VARCHAR(100),
  "area"      VARCHAR(100)
);

-- Tabela de Turma
CREATE TABLE IF NOT EXISTS "Turma" (
  "idTurma"        SERIAL PRIMARY KEY,
  "codigo"         VARCHAR(50),
  "semestreAtual"  VARCHAR(10),
  "Cursos_idCurso" INTEGER REFERENCES "Cursos"("idCurso")
);

-- Tabela de Empresa
CREATE TABLE IF NOT EXISTS "Empresa" (
  "idEmpresa"          SERIAL PRIMARY KEY,
  "AE/AD"              VARCHAR(10),
  "praticaProfissional" VARCHAR(10),
  "horasPratica"       NUMERIC,
  "empresaContrato"    VARCHAR(255)
);

-- Tabela principal de Alunos
CREATE TABLE IF NOT EXISTS "tblAluno" (
  "idtblAluno"      SERIAL PRIMARY KEY,
  "matricula"       VARCHAR(50) NOT NULL UNIQUE,
  "nome"            VARCHAR(255) NOT NULL,
  "Empresa_idEmpresa" INTEGER REFERENCES "Empresa"("idEmpresa"),
  "Turma_idTurma"   INTEGER REFERENCES "Turma"("idTurma")
);

-- Tabela temporária de staging (para o upload CSV)
CREATE TABLE IF NOT EXISTS "tblAluno_copy1" (
  "id"                   SERIAL PRIMARY KEY,
  "matricula"            VARCHAR(50),
  "nome"                 VARCHAR(255),
  "tipoCurso"            VARCHAR(100),
  "areaCurso"            VARCHAR(100),
  "curso"                VARCHAR(255),
  "turma"                VARCHAR(50),
  "AE/AD"                VARCHAR(10),
  "praticaProfissional"  VARCHAR(10),
  "horasPratica"         NUMERIC,
  "empresaContrato"      VARCHAR(255)
);