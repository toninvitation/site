# TONInvitation — correção da pré-visualização Toy Story 1

Substitui estes ficheiros no site:
- `modelos.js`
- `templates.js`
- `toy-story.css`

A correção mantém a imagem `ToyStory1_com.png` como base da pré-visualização (com marca d'água) e garante que os textos default do convite são mostrados nas camadas editáveis. Se a imagem de pré-visualização não existir, o JavaScript tenta a imagem principal/final como fallback.

O `ToyStory1_completo.png` continua definido como `finalImage` e não é usado como fundo das camadas editáveis, para evitar duplicar os textos do exemplo.
