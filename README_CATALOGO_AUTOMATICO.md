# TONInvitation — Catálogo automático

## Como adicionar um convite novo

Não é necessário alterar HTML, JavaScript ou CSS para cada novo convite.

Dentro de `Categorias`, cria a estrutura:

`Categorias/<Categoria>/<Tema>/<Modelo>/`

Dentro da pasta do modelo, coloca preferencialmente:

- `<Modelo>_capa.png` — opcional, usado para a imagem do cartão do modelo quando existir.
- `<Modelo>_com.png` — imagem pública usada no personalizador.
- `<Modelo>_completo.png` — imagem completa usada no cartão do modelo.
- `<Modelo>_sem.png` — versão privada sem marca d'água, dentro da mesma estrutura em `Categorias Private`.

A capa do tema pode ficar diretamente dentro da pasta do tema:

`Categorias/<Categoria>/<Tema>/<Tema>_capa.png`

### Exemplo

`Categorias/Infantil/Frozen/Frozen1/Frozen1_com.png`

`Categorias/Infantil/Frozen/Frozen1/Frozen1_completo.png`

`Categorias Private/Infantil/Frozen/Frozen1/Frozen1_sem.png`

`Categorias/Infantil/Frozen/Frozen_capa.png`

Depois de colocares os ficheiros, reinicia o `npm start` e atualiza o site.

## Configuração opcional

Se um convite precisar de posições, textos ou preço diferentes, podes colocar um `config.json` dentro da pasta do modelo. Isto é opcional. Sem `config.json`, o sistema usa uma configuração automática comum.

Exemplo:

```json
{
  "name": "Frozen 1",
  "priceEUR": 5,
  "description": "Convite Frozen personalizado."
}
```

Não é necessário criar `config.json` para começar a adicionar modelos.

## Importante

A versão `_sem.png` nunca é servida pelo navegador. O servidor usa essa imagem apenas quando cria o convite final depois do pedido.

## Fontes e layouts dos modelos

O ficheiro `model-configs.js` permite indicar a fonte de cada convite sem alterar `server.js`.

Para uma fonte única:

```js
"infantil-cars-cars1": {
  fontFamily: "Magz, sans-serif"
}
```

Para fontes diferentes por campo:

```js
"infantil-toy-story-toystory1": {
  fontByField: {
    name: "Sigmar One, sans-serif",
    age: "Sigmar One, sans-serif",
    anos: "Sigmar One, sans-serif",
    default: "HortaRegular, Horta, sans-serif"
  }
}
```

Quando `textLayers` é definido, ele controla a posição, tamanho, cor e fonte inicial de cada escrita.
