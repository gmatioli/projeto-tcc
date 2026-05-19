-- ============================================================
-- Schema PostgreSQL (Neon) - Conselho de Classe
-- Migrado a partir do MySQL Workbench Forward Engineering
-- Idempotente: pode rodar múltiplas vezes sem erro
-- ============================================================

-- ============================================================
-- ENUM TYPES
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "cursos_tipo" AS ENUM ('Curso Técnico', 'Aprendizagem Industrial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "matricula_status" AS ENUM ('Ativo', 'Concluído', 'Evadido');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "conselho_tipo" AS ENUM ('Intermediário', 'Pré-Conselho', 'Final');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "conselho_status" AS ENUM ('Iniciado', 'Em andamento', 'Finalizado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "avaliacao_criterio" AS ENUM ('Atende satisfatoriamente', 'Necessita de orientação');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "avaliacao_objetivos" AS ENUM ('Sim', 'Não');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "avaliacao_situacao_final" AS ENUM ('Aprovado', 'Aprovado pelo conselho', 'Reprovado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- TABELAS PRINCIPAIS
-- ============================================================

-- Usuario

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS "Usuario" (
  "idUsuario"            SERIAL PRIMARY KEY,
  "nomeUsuario"          VARCHAR(255) NOT NULL,
  "emailInstitucional"   VARCHAR(255) NOT NULL UNIQUE,
  "senha"                VARCHAR(255) NOT NULL,
  "nivelAcesso"          VARCHAR(50)  NOT NULL,
  "fotoPerfil"           VARCHAR(255)
);

ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "fotoPerfil" VARCHAR(255);

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
  "codigo"         VARCHAR(50) UNIQUE,
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


-- Matricula
CREATE TABLE IF NOT EXISTS "Matricula" (
  "idMatricula"         SERIAL PRIMARY KEY,
  "Turma_idTurma"       INTEGER NOT NULL REFERENCES "Turma"("idTurma"),
  "ano"                 SMALLINT,
  "semestre"            INTEGER,
  "status"              "matricula_status",
  "tblAluno_idtblAluno" INTEGER NOT NULL REFERENCES "tblAluno"("idtblAluno")
);

CREATE INDEX IF NOT EXISTS "idx_Matricula_Turma"   ON "Matricula"("Turma_idTurma");
CREATE INDEX IF NOT EXISTS "idx_Matricula_tblAluno" ON "Matricula"("tblAluno_idtblAluno");

-- Conselho (criado ao "Iniciar Conselho", finalizado depois via UPDATE status)
CREATE TABLE IF NOT EXISTS "Conselho" (
  "idConselho"        SERIAL PRIMARY KEY,
  "tipoConselho"      "conselho_tipo",
  "dataRealizacao"    TIMESTAMP,
  "status"            "conselho_status" DEFAULT 'Iniciado',
  "semestre"          SMALLINT,
  "ano"               SMALLINT,
  "Usuario_idUsuario" INTEGER NOT NULL REFERENCES "Usuario"("idUsuario")
);

ALTER TABLE "Conselho" ADD COLUMN IF NOT EXISTS "semestre" SMALLINT;
ALTER TABLE "Conselho" ADD COLUMN IF NOT EXISTS "ano"      SMALLINT;

CREATE INDEX IF NOT EXISTS "idx_Conselho_Usuario" ON "Conselho"("Usuario_idUsuario");
CREATE INDEX IF NOT EXISTS "idx_Conselho_Ciclo"   ON "Conselho"("tipoConselho", "semestre", "ano");


-- Avaliacao_Turma (uma avaliação por par turma+conselho)
CREATE TABLE IF NOT EXISTS "Avaliacao_Turma" (
  "idAvaliacao_Turma"          SERIAL PRIMARY KEY,
  "organizacao"                "avaliacao_criterio",
  "comportamental"             "avaliacao_criterio",
  "assiduidade"                "avaliacao_criterio",
  "disponibilidade_Aprendizado" "avaliacao_criterio",
  "observacao"                 TEXT,
  "acaoProposta"               TEXT,
  "alcancou_Objetivos"         "avaliacao_objetivos",
  "Turma_idTurma"              INTEGER NOT NULL REFERENCES "Turma"("idTurma"),
  "Conselho_idConselho"        INTEGER NOT NULL REFERENCES "Conselho"("idConselho"),
  "Usuario_idUsuario"          INTEGER REFERENCES "Usuario"("idUsuario"),
  CONSTRAINT "uq_Avaliacao_Turma_TurmaConselho"
    UNIQUE ("Turma_idTurma", "Conselho_idConselho")
);

ALTER TABLE "Avaliacao_Turma" ADD COLUMN IF NOT EXISTS "acaoProposta" TEXT;
ALTER TABLE "Avaliacao_Turma" ADD COLUMN IF NOT EXISTS "Usuario_idUsuario" INTEGER REFERENCES "Usuario"("idUsuario");

CREATE INDEX IF NOT EXISTS "idx_AvaliacaoTurma_Turma"    ON "Avaliacao_Turma"("Turma_idTurma");
CREATE INDEX IF NOT EXISTS "idx_AvaliacaoTurma_Conselho" ON "Avaliacao_Turma"("Conselho_idConselho");
CREATE INDEX IF NOT EXISTS "idx_AvaliacaoTurma_Usuario"  ON "Avaliacao_Turma"("Usuario_idUsuario");


-- Avaliacao_Aluno (uma avaliação por par aluno+conselho)
-- naturezaOcorrencia: SET do MySQL convertido para TEXT[] (array de strings)
CREATE TABLE IF NOT EXISTS "Avaliacao_Aluno" (
  "idAvaliacao_Aluno"         SERIAL PRIMARY KEY,
  "Conselho_idConselho"       INTEGER NOT NULL REFERENCES "Conselho"("idConselho"),
  "naturezaOcorrencia"        TEXT[],
  "restricao"                 TEXT,
  "acaoProposta"              TEXT,
  "acaoPropostaIntermediario" TEXT,
  "acaoPropostaPreConselho"   TEXT,
  "responsavel"               TEXT,
  "responsavelIntermediario"  TEXT,
  "responsavelPreConselho"    TEXT,
  "justificativa"             TEXT,
  "informacoesComplementares" VARCHAR(255),
  "situacaoFinal"             "avaliacao_situacao_final",
  "contestacaoSituacaoFinal"  TEXT,
  "Usuario_idUsuario"         INTEGER NOT NULL REFERENCES "Usuario"("idUsuario"),
  "tblAluno_idtblAluno"       INTEGER NOT NULL REFERENCES "tblAluno"("idtblAluno"),
  CONSTRAINT "uq_Avaliacao_Aluno_AlunoConselho"
    UNIQUE ("tblAluno_idtblAluno", "Conselho_idConselho")
);


ALTER TABLE "Avaliacao_Aluno" ADD COLUMN IF NOT EXISTS "responsavel"               TEXT;
ALTER TABLE "Avaliacao_Aluno" ADD COLUMN IF NOT EXISTS "acaoPropostaIntermediario" TEXT;
ALTER TABLE "Avaliacao_Aluno" ADD COLUMN IF NOT EXISTS "acaoPropostaPreConselho"   TEXT;
ALTER TABLE "Avaliacao_Aluno" ADD COLUMN IF NOT EXISTS "responsavelIntermediario"  TEXT;
ALTER TABLE "Avaliacao_Aluno" ADD COLUMN IF NOT EXISTS "responsavelPreConselho"    TEXT;
ALTER TABLE "Avaliacao_Aluno" ADD COLUMN IF NOT EXISTS "contestacaoSituacaoFinal"  TEXT;

CREATE INDEX IF NOT EXISTS "idx_AvaliacaoAluno_Conselho" ON "Avaliacao_Aluno"("Conselho_idConselho");
CREATE INDEX IF NOT EXISTS "idx_AvaliacaoAluno_Usuario"  ON "Avaliacao_Aluno"("Usuario_idUsuario");
CREATE INDEX IF NOT EXISTS "idx_AvaliacaoAluno_tblAluno" ON "Avaliacao_Aluno"("tblAluno_idtblAluno");


-- Observacao_Docente
CREATE TABLE IF NOT EXISTS "Observacao_Docente" (
  "idObservacao_Docente" SERIAL PRIMARY KEY,
  "Usuario_idUsuario"    INTEGER NOT NULL REFERENCES "Usuario"("idUsuario"),
  "dataObservacao"       TIMESTAMP DEFAULT NOW(),
  "categoria"            VARCHAR(45),
  "descricao"            TEXT,
  "tblAluno_idtblAluno"  INTEGER NOT NULL REFERENCES "tblAluno"("idtblAluno")
);

CREATE INDEX IF NOT EXISTS "idx_ObsDocente_Usuario"  ON "Observacao_Docente"("Usuario_idUsuario");
CREATE INDEX IF NOT EXISTS "idx_ObsDocente_tblAluno" ON "Observacao_Docente"("tblAluno_idtblAluno");


-- Alteracoes_logs (FKs nullable: cada log é de aluno OU de turma)
CREATE TABLE IF NOT EXISTS "Alteracoes_logs" (
  "idAlteracoes_logs"                 SERIAL PRIMARY KEY,
  "data_hora"                         TIMESTAMP DEFAULT NOW(),
  "valor_antigo"                      VARCHAR(255),
  "valor_novo"                        VARCHAR(255),
);

CREATE INDEX IF NOT EXISTS "idx_Logs_AvaliacaoAluno" ON "Alteracoes_logs"("Avaliacao_Aluno_idAvaliacao_Aluno");
CREATE INDEX IF NOT EXISTS "idx_Logs_AvaliacaoTurma" ON "Alteracoes_logs"("Avaliacao_Turma_idAvaliacao_Turma");

-- Docente_Turma (associativa: docente leciona em turma)
CREATE TABLE IF NOT EXISTS "Docente_Turma" (
  "idDocente_Turma"   SERIAL PRIMARY KEY,
  "Usuario_idUsuario" INTEGER NOT NULL REFERENCES "Usuario"("idUsuario"),
  "Turma_idTurma"     INTEGER NOT NULL REFERENCES "Turma"("idTurma"),
  CONSTRAINT "uq_DocenteTurma" UNIQUE ("Usuario_idUsuario", "Turma_idTurma")
);

CREATE INDEX IF NOT EXISTS "idx_DocenteTurma_Usuario" ON "Docente_Turma"("Usuario_idUsuario");
CREATE INDEX IF NOT EXISTS "idx_DocenteTurma_Turma"   ON "Docente_Turma"("Turma_idTurma");


-- Turma_has_Conselho (associativa: um conselho pode envolver várias turmas)
CREATE TABLE IF NOT EXISTS "Turma_has_Conselho" (
  "Turma_idTurma"       INTEGER NOT NULL REFERENCES "Turma"("idTurma"),
  "Conselho_idConselho" INTEGER NOT NULL REFERENCES "Conselho"("idConselho"),
  PRIMARY KEY ("Turma_idTurma", "Conselho_idConselho")
);

CREATE INDEX IF NOT EXISTS "idx_TurmaHasConselho_Conselho" ON "Turma_has_Conselho"("Conselho_idConselho");

-- ============================================================
-- TABELA DE STAGING (ETL do CSV do SGSET)
-- Alimentada por POST /upload-planilha (planilha.js)
-- ============================================================
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