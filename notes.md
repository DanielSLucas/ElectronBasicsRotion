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

## Aula 5

Instalar:
```bash
npm i -D tailwindcss @tailwindcss/postcss postcss autoprefixer
```

Criar aquivo `./src/renderer/postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

Apontar nas configurações `electron.vite.config.ts`:
```typescript
// imports...
export default defineConfig({
  // ...
  renderer: {
    css: {
      postcss: './src/renderer/postcss.config.js'
    },
    // ...
  }
})
```

Criar `global.css` e importar no componente raiz:
```css
@import "tailwindcss";
@import "tailwindcss/preflight"
@tailwind utilities;

@theme {
  --font-sans: Inter, sans-serif, system-ui;
}

```

## Aula 6
Configurações tsconfig e eslint.

## Aula 7
Icones da aplicação.

## Aula 8
Configurando roteamento da aplicação.
- Diferente de um app web, um app desktop pode ter várias janelas, e para cada
uma delas seria necessário um roteamento. 
- Para facilitar esse gerenciamento usamos a lib `electron-router-dom` junto o 
`react-router-dom`.

## Aula 9
Configurando layout padrão da aplicação.

## Aula 10
Estilos da página de documento.

## Aula 11
Configurando o editor de texto com a lib `tiptap`.
- foi necessário também adcionar o `@plugin "@tailwindcss/typography";` para aplicar
uma formatação padrão nos elementos de texto do editor

## Aula 12
Adicionando o comportamento colapsável à sidebar com `@radix-ui/react-collapsible`.

## Aula 13
Como comentado anteriomente a arquitetura do electron é dividida em [processos](https://www.electronjs.org/docs/latest/tutorial/process-model),
sendo o **main** o processo principal, o **renderer** o processo responsável pelo front-end
e o **preload** responsável por fazer a ponte de comunicação entre os dois.

A comunicação entre processos é chamada de *inter-process communication* (IPC) e ela pode
ser feita de algumas maneiras, conforme a [documentação do electron](https://www.electronjs.org/docs/latest/tutorial/ipc).

Exemplo de implementação no commit 654b00df.

## Aula 14
Configurando o `@tanstack/react-query` para fazer o fetch de dados entre `main` e `redender`.

## Aula 15
Referente a armazemento e back-end, o electron, na maioria das vezes não difere do funcionamento
de uma aplicação web tradicional, em que o back-end é separado e diponibilizado através de uma 
API Rest. Porém, sendo uma aplicação desktop, temos opções de armazenamento local e back-end 
já incluso na aplicação electron. E é esse caminho que vamos seguir

## Aula 16
Dentre os caminhos que podemos seguir quando falamos de armazenamento local, poderiamos 
guardar os dados nos sistema de arquivos, como um arquivo sqlite, json, ou mesmo usar
os armazenamentos do navegador como o `localstorage` ou o `indexDB`. Porém em nosso caso
apenas para fins de aprender mais sobre o electron vamos utilizar o `electron-store` que 
é baseado em json.

## Aula 17
Estruturando o IPC handlers, movendo nomes de eventos e tipagens para pacote `shared`.