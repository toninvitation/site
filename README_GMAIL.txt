TONInvitation — correção do erro TLS do Gmail

ERRO CORRIGIDO:
self-signed certificate in certificate chain

Para o TESTE LOCAL, acrescenta esta linha ao teu .env:

EMAIL_ALLOW_SELF_SIGNED=true

O teu .env ficará assim:

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=O_TEU_EMAIL_GMAIL
EMAIL_PASSWORD=A_TUA_APP_PASSWORD
EMAIL_FROM=O_TEU_EMAIL_GMAIL
EMAIL_ALLOW_SELF_SIGNED=true

IMPORTANTE:
EMAIL_ALLOW_SELF_SIGNED=true é apenas para o teste local.
Não uses esta opção no site em produção. Quando colocarmos a loja online,
vamos retirar esta opção e voltar a exigir a validação normal do certificado.

Depois:
1. Substitui o server.js pelo deste ZIP.
2. Abre o .env e acrescenta EMAIL_ALLOW_SELF_SIGNED=true.
3. Guarda o .env.
4. No terminal, para o servidor com Ctrl+C.
5. Executa npm start.
6. Cria um NOVO pedido.
7. Faz o pagamento de teste.

A imagem convite-final.png deverá ser enviada automaticamente para o
e-mail indicado no pedido.

Nunca partilhes a App Password nem coloques o .env no GitHub.
