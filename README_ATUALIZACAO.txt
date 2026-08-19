TONInvitation — atualização para imagem final sem marca d'água

Ficheiros alterados:
- server.js
- modelos.js
- package.json

O que mudou:
1. O personalizador continua a mostrar ToyStory1_com.png, com marca d'água.
2. Ao criar o pedido, o navegador envia apenas uma camada PNG transparente com os textos personalizados.
3. O servidor procura automaticamente a imagem correspondente em:
   Categorias Private/...
4. Para Toy Story 1, por exemplo:
   Categorias/Infantil/Toy Story/Toy Story1/ToyStory1_com.png
   -> Categorias Private/Infantil/Toy Story/ToyStory1/ToyStory1_sem.png
5. O servidor junta os textos à imagem sem marca d'água e cria convite-final.png com 1080x1920 px.
6. A pasta "Categorias Private" fica bloqueada no servidor e não pode ser aberta diretamente pelo navegador.
7. A pasta "data" também fica bloqueada, para proteger os pedidos e dados dos clientes.
8. Foi adicionada a dependência "sharp" ao package.json.

Depois de substituir os ficheiros:
- abra o terminal na pasta do projeto;
- execute: npm install
- depois: npm start

A pasta "Categorias Private" deve continuar no repositório com a mesma estrutura que já tens.
Não é necessário colocá-la no ZIP desta atualização.
