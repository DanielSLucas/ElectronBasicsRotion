## Back-end (ipc)
- ⁠[x] fazer o embedding no salvamento
- ⁠[x] persistir o embedding de outra maneira ao invés da memória
- [x] fazer o embedding do documento ao salva-lo
- [x] sincronizar embeddings quando a aplicação iniciar
- [x] filtrar tipo de documento que aplicação pode usar (apenas `.md`)
- [ ] fazer embeddings quando a pasta for selecionada (apagar anterior? só adionar no vector store?)
- [ ] baixar binários do llama.ccp de acordo com a plataforma e executa-los

## Document
- [x] debounce ao salvar documentos
- [ ] ajustar o breadcrumbs do header de acordo com o documento

## Chat
- [ ] remover <think> do pensamento da llm
- [ ] interromper geração de texto do chat
- ⁠[ ] comportamento de scroll (esta com scroll automático na página de chat, mas isso n deveria impedir o usuário de dar scroll mesmo quando uma nova mensagem está sendo gerada)
- ⁠[ ] histórico de chats (persistir histórico de chats e deixar acessível na sidebar do chat)
- [ ] Escolher quais documentos entram no contexto

## Menu de configurações
- [ ] criar menu de configurações
- [ ] customizar cores
- [ ] capacidade de escolher modelos de IA usados
- [ ] permitir prompt customizado

## SideBar
- [x] permitir pastas
- [ ] permitir criar documentos dentro de pastas
