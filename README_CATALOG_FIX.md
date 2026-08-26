# TONInvitation — correção do catálogo no GitHub Pages

Estes ficheiros fazem o catálogo funcionar no GitHub Pages sem depender do `server.js`.

O GitHub Actions executa `node build-catalog.js` e cria automaticamente `catalog.json` a partir da pasta pública `Categorias/`.

A pasta `Categorias Private/`, `.env` e `data/orders/` continuam fora do repositório público.

Para adicionar um novo convite, basta colocar as imagens na estrutura de pastas usada pelo projeto e fazer `git add`, `git commit` e `git push`.
