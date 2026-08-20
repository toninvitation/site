TONInvitation — ALTERAÇÕES DESTA VERSÃO

Ficheiros alterados:
- server.js
- categoria.js
- categoria.css
- style.css
- modelos.js
- test-payment.js

IMPORTANTE:
1. Mantém as pastas Categorias, Images, data e Categorias Private como já tens.
2. Não substituas o .env.
3. As imagens de capa dos temas devem ficar dentro da pasta do tema:
   Categorias/Infantil/Toy Story/Toy Story_capa.png
   Categorias/Infantil/Cars/Cars_capa.png
   etc.
4. O servidor procura automaticamente o ficheiro que termina em _capa.png/jpg/jpeg/webp.
5. Para fontes diferentes por convite, podes colocar um config.json dentro da pasta do modelo.
   Exemplo:

   {
     "fontConfig": {
       "name": "Sigmar One, sans-serif",
       "age": "Sigmar One, sans-serif",
       "anos": "Sigmar One, sans-serif",
       "faz": "HortaRegular, Horta, sans-serif",
       "adventure": "HortaRegular, Horta, sans-serif",
       "date-month": "HortaRegular, Horta, sans-serif",
       "date-day": "HortaRegular, Horta, sans-serif",
       "weekday-time": "HortaRegular, Horta, sans-serif",
       "place": "HortaRegular, Horta, sans-serif",
       "end": "HortaRegular, Horta, sans-serif",
       "otherInfo": "HortaRegular, Horta, sans-serif"
     }
   }

   Isto não exige alterar o código para cada novo convite.

NOTA SOBRE O ZIP ENVIADO:
O arquivo recebido para esta alteração não contém as pastas públicas Categorias/ e Images/.
Por isso não foi possível testar visualmente as capas reais neste ambiente. As alterações foram feitas
sobre o sistema automático que já tens e não eliminam a lógica existente.
