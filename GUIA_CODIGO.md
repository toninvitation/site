# TONInvitation — Guia dos ficheiros de código

## Estrutura

- `index.html` — estrutura visual da página inicial.
- `style.css` — estilos gerais do site, incluindo a grelha de categorias e responsividade.
- `script.js` — comportamento da página inicial, menu mobile e avaliações.
- `categories.js` — nomes, imagens e descrições das categorias/temas.
- `categoria.html` — estrutura da página que mostra uma categoria.
- `categoria.css` — estilos dos cartões de temas e convites.
- `categoria.js` — lê a categoria da URL e cria os cartões correspondentes.
- `modelos.html` — estrutura da página de modelos e do painel de personalização.
- `modelos.js` — lógica do personalizador: campos, camadas, arrastar, tamanho, cores e histórico.
- `templates.js` — configuração dos convites; aqui registamos cada novo modelo e as posições default.
- `toy-story.css` — estilos específicos do Toy Story e do canvas 1080x1920.

## Imagens

As pastas `Images` e `Categorias` não são alteradas por estes ficheiros. A organização existente continua a ser usada.

## Escala das imagens

As imagens dos convites continuam a ter resolução real de `1080x1920 px`. O site apresenta-as em escala menor usando CSS, mantendo a proporção `1080 / 1920`.

## Onde alterar o tamanho visual

- Categorias da página inicial: `style.css`, variável visual `max-width` de `.category-card`.
- Temas e convites: `categoria.css`, `max-width` de `.theme-card` e `.invitation-card`.
- Mockup do Toy Story: `toy-story.css`, `.phone-mockup`.

## Onde alterar um novo convite

Regista o novo convite em `templates.js`. Define o `id`, nome, categoria, tema, imagem, descrição e, quando for um modelo personalizável, as `textLayers`.

## Variáveis principais

- `categoryId` — identificador da categoria lida da URL.
- `themeId` — identificador do tema lido da URL.
- `selectedTemplate` — convite que está atualmente aberto no personalizador.
- `layerPositions` — posições atuais das camadas de texto.
- `layerSizes` — tamanhos atuais das camadas.
- `layerColors` — cores atuais das camadas.
- `selectedLayerIndex` — camada atualmente selecionada para edição.
- `history` / `historyIndex` — histórico usado pelos botões Voltar, Default e Avançar.

## Regra importante

O canvas do convite é sempre `1080x1920`. A redução no site é apenas visual; não reduz a resolução das imagens originais.
