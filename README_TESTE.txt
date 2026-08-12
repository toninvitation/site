TONInvitation — versão corrigida

O erro "Failed to fetch" acontece quando o navegador não consegue comunicar com
o servidor. Esta versão corrige o servidor para Express 5 e mantém o catálogo.

Para testar corretamente:

1. Instala o Node.js.
2. Abre o terminal DENTRO desta pasta.
3. Executa:
   npm install

4. Cria um ficheiro chamado .env com:
   PORT=3000
   RESEND_API_KEY=re_xxxxxxxxx
   EMAIL_FROM=TONInvitation <teu-email-ou-dominio-verificado>

5. Executa:
   npm start

6. Só depois abre no navegador:
   http://localhost:3000

7. Escolhe um modelo -> Personalizar -> preencher dados ->
   Confirmar pagamento.

O clique é considerado pagamento confirmado e o servidor tenta gerar e enviar
o PNG por e-mail.

IMPORTANTE:
- Não abras o index.html diretamente com duplo clique.
- Não uses file:///...
- Tens de abrir http://localhost:3000 enquanto o "npm start" estiver a correr.
- Para o e-mail ser realmente enviado, RESEND_API_KEY e EMAIL_FROM têm de estar
  configurados corretamente.
