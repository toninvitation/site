# TONInvitation — sistema completo de pedido + pagamento + entrega

## O fluxo

Cliente:
1. Escolhe o modelo.
2. Escolhe a cor.
3. Preenche os dados.
4. Clica em "Continuar para pagamento".
5. É levado para o checkout seguro da Stripe.
6. Depois de o pagamento ser confirmado, o webhook da Stripe avisa o servidor.
7. O servidor gera o ficheiro do convite.
8. O Resend envia o ficheiro para o e-mail indicado.

## O que é necessário configurar

### 1. Node.js
Instalar Node.js no computador/servidor.

Na pasta do projeto:
```bash
npm install
```

### 2. Variáveis de ambiente

Copiar `.env.example` para `.env` e preencher:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- EMAIL_FROM
- BASE_URL

Nunca colocar estas chaves no HTML ou JavaScript do navegador.

### 3. Stripe

Criar uma conta Stripe e usar primeiro as chaves de TESTE.

O endpoint do webhook deve ser:

`https://SEU-DOMINIO/api/stripe-webhook`

O evento necessário é:
`checkout.session.completed`

O servidor só envia o convite quando `payment_status === "paid"`.

### 4. Resend

Criar uma conta Resend e verificar o domínio de envio.
Depois usar no `.env`, por exemplo:

`EMAIL_FROM=TONInvitation <hello@toninvitation.com>`

A API do Resend permite enviar e-mails transacionais e anexos.

### 5. Imagens

Colocar a tua pasta `Images` dentro de `public/Images`.

## IMPORTANTE SOBRE O FICHEIRO GERADO

Esta primeira implementação gera um convite SVG autónomo no servidor. SVG é nítido e pode ser anexado ao e-mail.

O layout do SVG está no `generateInvitationSvg()` de `server.js`.

Para transformar cada um dos teus designs reais em modelos profissionais, a próxima etapa é criar um layout específico para cada template, em vez do layout genérico usado nesta demonstração.

## Teste local

```bash
npm install
npm start
```

Abrir:
http://localhost:3000

Para testar webhooks Stripe localmente, usar o Stripe CLI para encaminhar eventos para:
http://localhost:3000/api/stripe-webhook

## Produção

Não é recomendado depender do ficheiro `data/orders.json` como base de dados definitiva. Para começar é simples, mas numa loja real deve ser substituído por uma base de dados.

Também deves configurar HTTPS e um domínio próprio.

## Segurança

- Não guardar chaves Stripe/Resend no frontend.
- Não confiar no `success_url` para considerar um pagamento pago.
- O webhook assinado é que confirma o pagamento.
- Em produção, adicionar proteção contra pedidos duplicados e uma base de dados.
