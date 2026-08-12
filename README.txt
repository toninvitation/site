TONInvitation — sistema de encomenda automática

Frontend: public/
Backend: server.js
Configuração: .env.example
Guia: SETUP.md

O sistema está estruturado para:
modelo -> cor -> dados -> Stripe Checkout -> webhook de pagamento -> geração do convite -> e-mail com anexo.
