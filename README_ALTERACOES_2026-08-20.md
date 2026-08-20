# TONInvitation — alterações desta versão

## 1. Capas dos temas

A página de temas usa automaticamente a imagem `<Tema>_capa.png` colocada diretamente dentro da pasta do tema.

Exemplo:

`Categorias/Infantil/Toy Story/Toy Story_capa.png`

`Categorias/Infantil/Cars/Cars_capa.png`

A área visual é sempre quadrada e a imagem é mostrada inteira.

## 2. Fontes por convite

As fontes podem ser definidas no ficheiro `model-configs.js`, sem alterar o código principal do catálogo.

Exemplo para um modelo novo:

```js
"infantil-cars-cars1": {
  fontFamily: "Magz, sans-serif"
}
```

O identificador é formado automaticamente por categoria + tema + modelo, em minúsculas e com hífens.

## 3. Posição e tamanho das letras

Para um convite cujo PNG `_completo` já foi usado como referência, as posições e tamanhos devem ser definidos em `textLayers`.

O Toy Story 1 já tem a configuração correspondente ao modelo que estava anteriormente definida no projeto.

É importante notar que um PNG não guarda o nome da fonte nem a posição original das caixas de texto. Por isso, a fonte pode ser indicada na configuração e a posição/tamanho precisa de ser definida uma vez para cada modelo quando se pretende uma reprodução exata.

Depois disso, todos os pedidos daquele modelo são automáticos.

## 4. Mockup

O canvas interno continua a ser exatamente `1080 x 1920`.

O CSS apenas reduz a escala visual no ecrã para o convite não ocupar demasiado espaço. Isto não altera a resolução usada para gerar o PNG final.

## 5. Regresso depois do pagamento

O botão `Voltar à loja` da página de pagamento de teste passa agora a voltar para `index.html` e leva também o `orderId` no URL.

## 6. Idiomas

O seletor mostra apenas:

- 🇵🇹 PT
- 🇬🇧 EN
- 🇫🇷 FR
- 🇪🇸 ES

Não é necessário baixar imagens das bandeiras: são usadas bandeiras Unicode.

## 7. Magz

O código reconhece o nome `Magz`, mas o ficheiro da fonte não foi incluído no projeto porque a versão de demonstração encontrada online tem limitações de licença comercial. Para uma loja que vai vender convites, usa uma versão licenciada/webfont da Magz e coloca-a no projeto quando a tiveres. O nome da família deve continuar a ser `Magz`.
