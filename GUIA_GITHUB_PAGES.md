# TONInvitation — publicar o site no GitHub Pages

## O que foi preparado

- `categories.js` passa a usar `catalog.json` quando o site está publicado.
- `build-catalog.js` cria automaticamente `catalog.json` a partir das pastas de `Categorias`.
- `.github/workflows/pages.yml` gera o catálogo e publica o site automaticamente.
- `.nojekyll` evita que o GitHub trate algumas pastas como conteúdo Jekyll.
- `package.json` ganhou o comando `npm run build:catalog`.

## IMPORTANTE — pasta privada

NÃO colocar no repositório público:

- `Categorias Private/`
- `.env`
- `data/orders/`
- qualquer senha, token ou chave Shopify/Gmail.

A pasta `Categorias` é a versão pública com marca d'água.

## Como publicar

1. Criar um repositório novo no GitHub.
2. Tornar o repositório público.
3. Copiar para o repositório os ficheiros do teu site e a pasta `Categorias` com as imagens públicas.
4. Confirmar que `Categorias Private` não foi copiada.
5. Fazer Commit e Push para a branch `main`.
6. No GitHub abrir `Settings > Pages`.
7. Em `Build and deployment`, selecionar `GitHub Actions`.
8. Abrir o separador `Actions` e aguardar o workflow `Publicar TONInvitation` terminar com sucesso.
9. O GitHub mostrará o endereço público do site.

## Testar no telemóvel

Depois do workflow terminar, abrir o endereço público no telemóvel.

## Nota importante

Nesta primeira fase, o GitHub Pages publica a parte visual do site e o catálogo.
O checkout, a criação do PNG sem marca d'água, os e-mails e os webhooks continuam a precisar do backend online.
Não colocar o `server.js` nem as credenciais privadas no GitHub Pages como forma de substituir o backend.
