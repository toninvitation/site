# TONInvitation — Toy Story 1

## Estrutura das imagens

```text
Categorias/
└── Infantil/
    └── Toy Story/
        ├── Toy Stoy_capa.png
        └── Toy Story1/
            ├── ToyStory1_com.png
            ├── ToyStory1_capa.png
            ├── ToyStory1_sem.png
            └── ToyStory1_completo.png
```

## Utilização das imagens

- `Toy Stoy_capa.png`: imagem que representa o tema Toy Story na página de temas.
- `ToyStory1_completo.png`: imagem completa apresentada no cartão do modelo.
- `ToyStory1_com.png`: imagem de fundo usada no personalizador.
- `ToyStory1_sem.png`: fica disponível para a fase posterior de geração/exportação, se necessário.

## Personalização

O canvas do convite mantém sempre a proporção **1080 × 1920 px**.

Os textos do Toy Story 1 são criados como camadas HTML sobre `ToyStory1_com.png`.
As posições estão definidas em percentagens no `templates.js`, o que permite que o mesmo layout funcione no telemóvel, computador e na futura geração final de 1080 × 1920 px.

## Enter no nome e na morada

Os campos de nome e morada são `textarea`, por isso aceitam Enter.

Se o texto ocupar mais espaço do que a camada reservada, o texto é cortado dentro do canvas e aparece um aviso no personalizador para o cliente escrever algo mais curto.

## Capa do Toy Story

O código tenta primeiro:

```text
Categorias/Infantil/Toy Story/Toy Stoy_capa.png
```

Se esse ficheiro não existir, tenta também:

```text
Categorias/Infantil/Toy Story/ToyStory_capa.png
Categorias/Infantil/Toy Story/Toy Story_capa.png
```

Só depois usa `Images/infantil.jpg` como fallback.

Assim evitamos que um pequeno erro no nome do ficheiro deixe a caixa da capa sem imagem.
