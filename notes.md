# NOTES
## Aula 1
Electron -> usado para construção de aplicativos desktop
Tauri -> opção com o backend em rust, tem menores executáveis, mas no electron
se aproveita mais o conhecimento do desenvolvimento web.

## Aula 2
Arquitetura electron:
- **main**: processo principal em que a aplicação roda, o nosso back-end
- **preload**: intermediário entre back-end e front-end, mas com acesso as APIs do node
- **renderer**: front-end da aplicação

## Aula 3
Iniando a aplicação com um template:
- [electron-vite](https://github.com/alex8088/electron-vite): boilerplate mais "cru" de uma aplicação electron + react e vite.
- [electron-app](https://github.com/daltonmenezes/electron-app): boilerpalte mais completo e opinado de uma aplicação electron + react e vite.

## Aula 4
Configuração de fontes:
- importar do google fonts
- Incluir no `Content-Security-Policy`
