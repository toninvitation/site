# TONInvitation — Configuração do Checkout Shopify

## O que foi alterado

O botão de pagamento do personalizador deixou de abrir diretamente a página local de pagamento de teste.

O novo fluxo é:

1. O cliente personaliza o convite.
2. O TONInvitation cria o pedido e o Order ID.
3. O servidor cria um carrinho através da Shopify Storefront API.
4. A Shopify devolve um `checkoutUrl`.
5. O cliente é encaminhado para o checkout oficial da Shopify.

O endpoint antigo `/api/test-payment` continua no projeto temporariamente para não perder a ferramenta de testes que já estava a funcionar. Mais tarde será removido/substituído pelo webhook `orders/paid`.

## 1. Criar um produto de teste na Shopify

Na Shopify, cria um produto chamado, por exemplo:

`Toy Story 1 — Convite Digital`

Define o preço que queres testar.

Para esta primeira implementação usa apenas uma variante:

`Convite digital`

Guarda o produto.

## 2. Ativar o Headless channel

No painel da Shopify, instala/abre o canal **Headless**.

Cria uma storefront para a TONInvitation e obtém o acesso à Storefront API.

O projeto usa o token privado no servidor porque esse token nunca deve aparecer no JavaScript público.

## 3. Preencher o `.env`

Na pasta principal do projeto, cria ou usa o teu `.env` atual e acrescenta:

```text
SHOPIFY_STORE_DOMAIN=nome-da-tua-loja.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=COLOCA_AQUI_O_TOKEN_PRIVADO
SHOPIFY_STOREFRONT_API_VERSION=2026-07
```

Não envies o `.env` para o GitHub.

O `.gitignore` do projeto já contém `.env`.

## 4. Obter o Variant ID

Cada produto Shopify tem uma variante.

O projeto precisa do ID dessa variante no formato:

```text
gid://shopify/ProductVariant/1234567890
```

Esse ID será colocado no `config.json` do convite.

Exemplo:

```json
{
  "name": "Toy Story 1",
  "priceEUR": 5,
  "shopifyVariantId": "gid://shopify/ProductVariant/1234567890"
}
```

O `config.json` deve ficar dentro da pasta do convite:

```text
Categorias/
└── Infantil/
    └── Toy Story/
        └── ToyStory1/
            ├── ToyStory1_capa.png
            ├── ToyStory1_com.png
            ├── ToyStory1_completo.png
            ├── config.json
            └── ...
```

## 5. Reiniciar o servidor

Depois de alterar o `.env` ou os `config.json`, reinicia o servidor:

```bash
node server.js
```

## 6. Testar

Abre:

```text
http://localhost:3000
```

Escolhe o Toy Story 1, personaliza e indica o teu e-mail.

Ao clicar em **Ir para pagamento seguro**, o sistema deve:

1. criar o Order ID;
2. criar o carrinho Shopify;
3. guardar o `cartId` e `checkoutUrl` no `order.json`;
4. abrir o checkout Shopify.

## Importante

A confirmação de pagamento ainda não está a ser feita pelo webhook nesta primeira etapa.

Depois de confirmarmos que o checkout abre corretamente, a próxima etapa será configurar o webhook Shopify `orders/paid` para que:

`pagamento confirmado -> TONInvitation -> gerar convite sem marca d'água -> enviar e-mail`

Assim não dependeremos do botão de pagamento de teste.
