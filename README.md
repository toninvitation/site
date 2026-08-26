# TONInvitation — correção da imagem dos modelos

Substituir no projeto os ficheiros:
- `build-catalog.js`
- `categories.js`
- `modelos.js`

A imagem apresentada no cartão de cada convite passa a procurar automaticamente primeiro uma imagem com o mesmo nome da pasta do modelo.

Exemplo:

`Categorias/Infantil/Toy Story/Toy Story1/Toy Story1.png`

Essa imagem é usada no catálogo/modelos. A imagem `_com.png` continua disponível para a pré-visualização/fluxo de personalização e não é escolhida como imagem do cartão.

Depois de substituir os ficheiros, fazer commit/push para `main` para o GitHub Actions voltar a gerar o `catalog.json`.
