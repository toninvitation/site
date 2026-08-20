/* =========================================================
   PAGAMENTO DE TESTE
   Este ficheiro representa a plataforma de pagamento durante o desenvolvimento.
   Mais tarde, esta página será substituída pelo checkout real.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* Lê o Order ID enviado pela página do personalizador. */
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");

  /* Lê a página onde o cliente estava antes de ir para o pagamento. */
  const returnUrl = params.get("returnUrl") || "modelos.html";

  /* Localiza os elementos da página. */
  const orderIdElement = document.getElementById("order-id");
  const paymentButton = document.getElementById("simulate-payment");
  const paymentMessage = document.getElementById("payment-message");
  const returnLink = document.getElementById("return-link");

  /* Mostra uma mensagem se a página foi aberta sem um pedido válido. */
  if (!orderId) {
    orderIdElement.textContent = "Pedido não encontrado";
    paymentButton.disabled = true;
    paymentMessage.textContent = "Esta página precisa de um Order ID válido.";
    return;
  }

  /* Mostra o identificador do pedido. */
  orderIdElement.textContent = orderId;

  /* Permite voltar ao personalizador mantendo o Order ID. */
  returnLink.href = `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}payment=cancelled&orderId=${encodeURIComponent(orderId)}`;

  /* Confirma o pagamento de teste no servidor. */
  paymentButton.addEventListener("click", async () => {
    /* Desativa o botão para evitar dois pagamentos acidentais. */
    paymentButton.disabled = true;
    paymentButton.textContent = "A confirmar...";
    paymentMessage.textContent = "";

    try {
      /* Envia o Order ID para o endpoint de confirmação. */
      const response = await fetch("/api/test-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId
        })
      });

      /* Converte a resposta do servidor para JSON. */
      const data = await response.json();

      /* Mostra o erro devolvido pelo servidor. */
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível confirmar o pagamento.");
      }

      /* Informa que o pedido foi pago e processado. */
      paymentMessage.innerHTML = `
        <strong>Pagamento de teste confirmado.</strong><br>
        O pedido ${data.orderId} foi marcado como pago.<br>
        ${data.emailSent
          ? "O e-mail foi enviado."
          : "O convite foi preparado e ficou disponível na pasta de testes do servidor."}
      `;

      /* Desativa definitivamente o botão depois da confirmação. */
      paymentButton.textContent = "Pagamento confirmado";

      /*
        Depois de confirmar o pagamento, o cliente pode regressar
        exatamente à página onde iniciou o pedido. O Order ID fica no URL.
      */
      returnLink.href = `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}payment=confirmed&orderId=${encodeURIComponent(orderId)}`;
      returnLink.textContent = "Voltar ao convite";
    } catch (error) {
      /* Mostra o erro e permite tentar novamente. */
      paymentMessage.textContent = error.message;
      paymentButton.disabled = false;
      paymentButton.textContent = "Confirmar pagamento de teste";
    }
  });
});
