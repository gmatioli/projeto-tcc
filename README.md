# Sistema Web para Gerenciamento de Conselho de Classe (SENAI)

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Neon_Database-00E599?style=for-the-badge&logo=neon&logoColor=black" alt="Neon" />
</p>

---

# Quer testar? Use esses usuários como Login:

## Tela de Administrador
> email: adm@senai

> senha: 12312312

## Tela de Docente
> email: docente@senai
 
> senha: 12312312

---

## Documentação Completa do Projeto
> Para acessar o arquivo com os requisitos detalhados, a modelagem de dados e as tela do sistema na íntegra, clique no link abaixo:
>[Acessar Documentação Técnica Completa (PDF)](https://drive.google.com/file/d/1WownKyBoaxoYyS7Z8d9ZENXiqz7ojWGT/view?usp=drivesdk)

---

## Sobre o Projeto

Este sistema foi desenvolvido como **Trabalho de Conclusão de Curso (TCC)** para o curso de **Técnico em Desenvolvimento de Sistemas** na Escola e Faculdade SENAI Mariano Ferraz. 

O objetivo principal foi **modernizar e otimizar o processo de Conselho de Classe da instituição**, substituindo um ecossistema defasado e local (desenvolvido em 2019 utilizando Access e Visual Basic) por uma **solução web robusta, segura e 100% em nuvem**.

### O Problema Encontrado
* **Gargalo Operacional:** Os analistas de Qualidade de Vida (AQVs) gastavam de 3 a 4 horas por conselho apenas transportando e configurando equipamentos para rodar o sistema antigo em ambientes locais específicos.
* **Segurança Zero:** Todos os usuários acessavam a plataforma antiga utilizando o mesmo login, eliminando qualquer rastreabilidade das ações.
* **Processamento Manual exaustivo:** A consolidação dos relatórios finais e atas levava até 2 horas de digitação manual por parte da equipe pedagógica.
* **Risco de Perda de Dados:** Informações comportamentais dos alunos eram anotadas "por fora" pelos docentes ao longo do semestre, gerando esquecimento e falta de centralização.

### A Nossa Solução
Transformamos um processo manual e engessado em uma plataforma escalável que resolveu essas dores de ponta a ponta:
* **Acesso Remoto e Simultâneo:** Deploy em nuvem que elimina totalmente a dependência de infraestrutura local, suportando mais de 20 usuários simultâneos em tempo real.
* **Automação de Documentos e Relatórios:** Geração instantânea de atas de conselho final, termos de ciência e instrumentos de acompanhamento com apenas 1 clique.
* **Registro Contínuo e Histórico:** Professores agora registram ocorrências e observações ao longo de todo o semestre de forma centralizada.
* **Segurança e LGPD:** Níveis de acesso estritos por perfil (Administrador/AQV e Docente) com senhas criptografadas e autenticação via Token.

---

## Tecnologias e Arquitetura

O sistema foi arquitetado utilizando o padrão **Cliente-Servidor (API RESTful)** com comunicação via protocolo HTTP e troca de dados estruturada em formato JSON.

* **Front-end:** React, Vite e Tailwind CSS (Interface dinâmica, responsiva e focada na usabilidade do docente).
* **Back-end:** Node.js e Express (Regras de negócio, rotas protegidas e manipulação de arquivos).
* **Banco de Dados:** PostgreSQL (Modelo relacional com schema dedicado de *Staging* para tratamento prévio de dados brutos extraídos do SGSET antes da ingestão principal).
* **Cloud & Deploy:** Neon Database (Banco em nuvem), Vercel (Hospedagem Front-end) e Render (Hospedagem Back-end).
* **Segurança:** `bcrypt` para criptografia de senhas e `jsonwebtoken (JWT)` para controle de sessões e proteção de rotas da API.

---

## A Equipe — Saggaz Inovações

* **Sofia Leiva Pires** — Tech Lead & Desenvolvedora Back-end
* **Gabriel Celestino dos Santos** — Desenvolvedor Back-end & Front-end
* **Guilherme Matioli Silva** — Desenvolvedor Front-end & DevOps (Hospedagem)
* **Ana Carolina Santos de Paula** — Modelagem de Banco de Dados & Back-end

**Orientadores:** Prof. Douglas dos Reis e Prof. Lincoln Souza.

---

<p align="center">
  Desenvolvido por Saggaz Inovações — 2026.
</p>

