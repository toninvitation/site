# TONInvitation — sistema de pedidos e pagamento de teste

## O que foi acrescentado

Este projeto mantém o personalizador que já tens e acrescenta um fluxo real de pedidos:

1. O cliente personaliza o convite.
2. O navegador gera o PNG final em 1080x1920 px.
3. O servidor cria um Order ID único.
4. O servidor guarda os dados do pedido e o PNG.
5. O pedido começa em `PENDING_PAYMENT`.
6. O cliente abre uma página separada que simula uma plataforma de pagamento.
7. O botão de teste envia o `Order ID` para o servidor.
8. O servidor muda o pedido para `PAID`.
9. O servidor prepara a entrega por e-mail.
10. Sem SMTP, o convite e a pré-visualização do e-mail ficam guardados em `data/orders/`.
11. Com SMTP configurado, o PNG é enviado automaticamente para o e-mail do cliente.

## Como testar no computador

### 1. Instalar Node.js

Instala uma versão recente do Node.js.

### 2. Abrir a pasta do projeto no terminal

Executa:

```bash
npm install
```

### 3. Iniciar o site

Executa:

```bash
npm start
```

### 4. Abrir o site

Abre:

`http://localhost:3000`

Não abras o `index.html` diretamente pelo Explorador do Windows, porque nesse caso a API `/api/orders` não estará disponível.

## Testar um pedido

1. Entra em Infantil.
2. Entra em Toy Story.
3. Abre Toy Story 1.
4. Personaliza o convite.
5. Coloca um e-mail.
6. Clica em `Criar pedido`.
7. O sistema mostra o `Order ID`.
8. Clica em `Abrir pagamento de teste`.
9. Clica em `Confirmar pagamento de teste`.
10. O pedido passa para `PAID`.

## Onde ficam os pedidos

Cada pedido fica numa pasta própria:

`data/orders/TON-AAAAMMDD-XXXXXX/`

Dentro dela encontrarás:

- `order.json` — dados do pedido e estado do pagamento;
- `convite-final.png` — convite final em 1080x1920;
- `email-preview.html` — conteúdo do e-mail quando SMTP ainda não está configurado.

## E-mail real

Para enviar e-mails reais, copia `.env.example` para `.env` e preenche as configurações SMTP.

Exemplo:

`SMTP_HOST=smtp.example.com`

`SMTP_PORT=587`

`SMTP_SECURE=false`

`SMTP_USER=utilizador@example.com`

`SMTP_PASSWORD=...`

`SMTP_FROM=TONInvitation <utilizador@example.com>`

Depois reinicia o servidor.

## Pagamento real no futuro

O endpoint:

`POST /api/test-payment`

é deliberadamente um simulador.

Quando escolheres Stripe, PayPal ou outra plataforma, este endpoint não deverá ser usado para produção. A plataforma real enviará um webhook para o servidor, contendo o identificador do pagamento e/ou o identificador associado ao pedido.

A estrutura de pedidos já está preparada para essa substituição porque o `Order ID` é criado no servidor e fica guardado antes do pagamento.

## Importante para produção

Antes de colocar o site a aceitar pagamentos reais, será necessário acrescentar:

- webhook autenticado da plataforma de pagamentos;
- validação da assinatura do webhook;
- proteção/autenticação da área administrativa;
- armazenamento de dados adequado para produção;
- HTTPS;
- política de privacidade e termos de venda;
- proteção contra abuso da API;
- serviço SMTP ou serviço transacional de e-mail;
- geração final no servidor ou validação do ficheiro recebido do navegador.
