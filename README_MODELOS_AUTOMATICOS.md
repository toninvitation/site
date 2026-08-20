# TONInvitation — Modelos automáticos

## Como funciona

Cada convite tem a sua própria pasta dentro de `Categorias`.

Dentro da pasta do convite podem existir:

- `*_capa.png` — imagem quadrada usada no catálogo do tema.
- `*_com.png` — imagem com marca d'água usada na pré-visualização.
- `*_completo.png` — imagem de referência/default do convite.
- `*_sem.png` — imagem sem marca d'água usada pelo servidor para gerar a entrega.
- `config.json` — configuração do convite.
- ficheiros de fonte `.ttf`, `.otf`, `.woff` ou `.woff2` — se o modelo precisar de uma fonte própria.

## Para adicionar um novo convite

1. Cria a pasta do novo convite dentro do tema.
2. Coloca as quatro imagens com os sufixos acima.
3. Cria um `config.json` nessa pasta.
4. Copia `CONFIG_MODELO_EXEMPLO.json` para a pasta do novo convite e muda apenas os valores necessários.
5. Indica no `config.json` a fonte, os campos editáveis e as posições/tamanhos iniciais.
6. Reinicia o `server.js`.

Não é necessário criar uma nova página HTML nem escrever uma nova função JavaScript para cada convite.

## Fontes

O servidor procura automaticamente os ficheiros de fonte dentro da pasta do próprio convite e, se não encontrar, procura dentro de `Categorias`.

Neste projeto:

- Toy Story 1 usa `Sigmar One` para Nome, Idade e Anos.
- Toy Story 1 usa `Horta` para os restantes textos.
- Cars 1 usa `Magz`.

Os nomes indicados no `config.json` devem corresponder ao nome da fonte que queres utilizar. O nome do ficheiro pode ter extensão `.ttf`, `.otf`, `.woff` ou `.woff2`.

## Canvas real

Todos os convites continuam a ser tratados internamente como `1080 x 1920 px`.

O telemóvel que aparece no personalizador é apenas uma representação visual menor desse mesmo canvas. A imagem final enviada ao cliente continua a ser gerada em `1080 x 1920 px`.
