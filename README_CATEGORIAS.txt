ESTRUTURA PEDIDA

Images/
  (as imagens que já tens)
  Categorias/
    Infantil/
      Toy Story/
        Toy Story1/
          convite.jpg
          outras imagens...
        Toy Story2/
          convite.jpg
      Cars/
        Cars1/
          convite.jpg
      K-Pop Demon Hunters/
        K-Pop Demon Hunters1/
          convite.jpg
    Casamentos/
      Casamento1/
        convite.jpg
      Casamento2/
        convite.jpg
    Chá de Bebé/
      ChaBebe1/
        convite.jpg
    Batizados/
      Batizado1/
        convite.jpg
    Formaturas/
      Formatura1/
        convite.jpg
    Adultos/
      Adulto1/
        convite.jpg
    Outros Eventos/
      OutroEvento1/
        convite.jpg

FLUXO
- Index mostra as categorias como botões.
- Infantil -> categoria.html -> mostra temas.
- Toy Story -> modelos.html -> mostra Toy Story1, Toy Story2, etc.
- Casamentos/Batizados/etc. -> categoria.html -> mostra diretamente os convites.
- Personalizar abre o formulário.
- Confirmar pagamento chama POST /api/confirm-payment-test.
- O clique é tratado como confirmação positiva do pagamento.
- O backend que já tens continua responsável por gerar/enviar o convite.

IMPORTANTE
HTML/JS não consegue listar automaticamente todas as pastas do teu computador. Por isso, cada novo convite deve ser registado no templates.js. A estrutura das pastas fica organizada exatamente como pediste.
