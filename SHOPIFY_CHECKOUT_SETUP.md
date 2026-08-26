# TONInvitation — Configuração do Checkout Shopify

## Estado atual

O pagamento já está a ser feito pelo checkout oficial da Shopify através da Storefront API.

O fluxo atual é:

1. Cliente personaliza o convite.
2. TONInvitation cria o Order ID.
3. TONInvitation cria o carrinho Shopify.
4. Shopify abre o checkout seguro.
5. Depois do pagamento, Shopify mostra a página de confirmação.

## O problema do botão “Continue shopping”

No teste, o botão “Continue shopping” está a levar para a loja `myshopify.com` em vez de voltar ao site TONInvitation.

Isto não é um erro do teu site. O checkout é hospedado pela Shopify e o destino desse botão é controlado pela configuração do lado da Shopify/Headless.

### Alteração preparada nesta versão

O `server.js` passou a aceitar a variável opcional:

```text
SHOPIFY_RETURN_URL=
```

Se estiver preenchida, o servidor acrescenta `return_to=...` ao URL de checkout para podermos testar se esse fluxo é aceite pela tua configuração.

**Não consideres isto ainda a solução final.** A Shopify não garante esse parâmetro para todos os fluxos de checkout/headless. O código mantém o URL original guardado e não usa o regresso do cliente como prova de pagamento.

## Amanhã — próximo passo

Vamos testar primeiro uma URL pública do teu site, por exemplo:

```text
https://TEU-DOMINIO/order-return.html
```

Depois vamos configurar o regresso da forma correta para uma loja Headless, para que o cliente possa voltar ao TONInvitation e veja o número do pedido.

O pagamento confirmado deverá continuar a ser reconhecido pelo webhook Shopify, e não simplesmente pelo facto de o cliente voltar à página.

## Importante

O `.env` real nunca deve ser colocado no GitHub.

O token privado da Storefront API também nunca deve aparecer em HTML, CSS, JavaScript público ou no repositório.
