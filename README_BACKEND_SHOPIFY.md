# TONInvitation — preparação para backend online + CORS + Shopify

Este pacote altera apenas o necessário para separar o site público do backend.

## Ficheiros alterados

- `server.js` — adiciona CORS e criação do checkout Shopify através da Storefront API.
- `modelos.js` — envia o pedido para o backend configurado e abre o checkout Shopify.
- `modelos.html` — carrega a configuração pública do backend.
- `build-catalog.js` — inclui `shopifyVariantId` no catálogo automático.
- `.env.example` — acrescenta `CORS_ORIGINS`.
- `api-config.js` — novo ficheiro público onde será colocado o URL HTTPS do backend.

## 1. Backend online

O `server.js` deve ser alojado num serviço cloud. O computador pessoal não precisa de ficar ligado.

Depois de obteres o URL HTTPS do backend, abre `api-config.js` e altera apenas esta linha:

```js
window.TON_API_BASE_URL = "https://URL-DO-TEU-BACKEND";
```

Não coloques tokens ou passwords neste ficheiro.

## 2. Variáveis no `.env` do backend

Usa o `.env.example` como referência e configura:

```text
SHOPIFY_STORE_DOMAIN=nome-da-loja.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=O_TOKEN_PRIVADO
SHOPIFY_STOREFRONT_API_VERSION=2026-07
CORS_ORIGINS=https://toninvitation.github.io,http://localhost:3000
```

O `.env` real nunca deve ser enviado para o GitHub.

## 3. Ligar cada convite a um produto Shopify

Dentro da pasta de cada convite cria/edita:

```text
config.json
```

Exemplo:

```json
{
  "name": "Toy Story 1",
  "priceEUR": 5,
  "shopifyVariantId": "gid://shopify/ProductVariant/57916537536894"
}
```

O Variant ID é o da variante do produto Shopify que deve ser vendida.

O catálogo automático lê este valor e envia-o para o backend.

## 4. Fluxo novo

```text
Site GitHub Pages
        ↓
POST /api/orders
        ↓
Backend online
        ↓
Shopify Storefront API
        ↓
checkoutUrl
        ↓
Checkout Shopify
```

O Order ID é colocado como atributo do carrinho Shopify. Os atributos de carrinho são transportados para a encomenda criada após o checkout, permitindo ligar posteriormente o webhook da Shopify ao pedido TONInvitation.

## Importante

Esta alteração prepara o checkout real, mas o webhook `orders/paid`, a persistência de produção e a entrega final após o pagamento ainda devem ser implementados na próxima etapa. O sistema atual de ficheiros `data/orders` continua a ser a persistência local do `server.js` e não deve ser tratado como armazenamento de produção num serviço cloud com disco efémero.
