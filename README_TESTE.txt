MODO DE TESTE — TONInvitation

Neste modo NÃO existe Stripe.

Ao clicar em "Confirmar pagamento":
1. o sistema considera o pagamento confirmado;
2. gera o convite em PNG;
3. envia a imagem como anexo para o email preenchido.

Para testar:
1. Instalar Node.js.
2. Abrir o terminal nesta pasta.
3. npm install
4. Copiar .env.example para .env
5. Colocar a RESEND_API_KEY.
6. Configurar EMAIL_FROM.
7. npm start
8. Abrir http://localhost:3000

A chave do Resend fica apenas no servidor, nunca no HTML/JS.
