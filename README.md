# Music Player App

Aplicação local para organizar, selecionar, reproduzir e controlar músicas armazenadas no computador.

---

## Pré-requisitos

- **Node.js** versão 18 ou superior  
  Baixe em: https://nodejs.org

> **Importante:** este projeto foi configurado para rodar com **NPM** (já vem junto com o Node.js).  
> Não é necessário instalar pnpm.

---

## Como rodar (modo recomendado)

### 1. Extraia o arquivo .zip
Extraia o projeto em uma pasta no seu computador (de preferência no SSD/HD, por exemplo:  
`C:\Users\SeuNome\Documents\music-player-standalone`)

> Evite rodar diretamente em pendrive, pois pode causar erros na instalação das dependências.

---

### 2. Abra o terminal na pasta do projeto

Exemplo:

```bash
cd C:\Users\SeuNome\Documents\music-player-standalone
```

---

### 3. Instale as dependências

```bash
npm install
```

---

### 4. Rode o projeto

```bash
npm run dev
```

---

### 5. Acesse no navegador

Abra:

```
http://localhost:3000
```

---

## Rodar com arquivos automáticos (.bat)

Este projeto pode ser executado usando arquivos `.bat` no Windows, para facilitar.

---

### Rodar somente o servidor

Crie (ou use) o arquivo:

**rodar-dev.bat**

Este arquivo executa:
- `npm run dev`
- abre automaticamente o navegador em `http://localhost:3000`

---

### Instalar e rodar automaticamente

Crie (ou use) o arquivo:

**instalar-e-rodar.bat**

Este arquivo executa:
- `npm install`
- `npm run dev`
- abre automaticamente o navegador em `http://localhost:3000`

---

## Funcionalidades

- **Adicionar músicas**: Clique no botão "+" ou arraste arquivos de áudio diretamente na janela
- **Reprodução completa**: Play, Pause, Stop, Anterior, Próxima, Voltar/Avançar 10s, Início
- **Barra de progresso**: Clique para pular para qualquer ponto da música
- **Controle de volume**: Slider + campo numérico (0-100)
- **Lista com drag-and-drop**: Arraste pelo ícone ☰ para reordenar
- **Reordenação por botões**: Setas ↑ ↓ para mover músicas
- **Seleção única e múltipla**: Alterne o modo pelo botão na barra de ferramentas
- **Menu de opções por música**: Informações (nome, caminho, duração, tamanho) e Excluir
- **Painel de reprodução**: Mostra a música atual e a fila de próximas
- **Fade-in/Fade-out**: Configurável em Configurações (tempo ajustável de 0.5s a 10s)
- **Tema claro/escuro**: Alternável em Configurações
- **Layout responsivo**: Adapta-se a telas de diferentes tamanhos

---

## Formatos de áudio suportados

MP3, WAV, OGG, FLAC, M4A, AAC, WMA  
(depende do suporte do navegador).

---

## Tecnologias

- React 19 + TypeScript
- Tailwind CSS 4
- Howler.js (reprodução de áudio)
- SortableJS (drag-and-drop)
- Vite (bundler/dev server)
