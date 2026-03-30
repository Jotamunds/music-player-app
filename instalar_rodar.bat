@echo off
cd /d "%~dp0"

echo Instalando dependencias...
npm install

echo Abrindo navegador...
start "" http://localhost:3000

echo Iniciando servidor...
npm run dev

pause