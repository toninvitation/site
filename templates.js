/* =========================================================
   TONInvitation — CONFIGURAÇÃO DOS MODELOS
   Cada objeto descreve um convite, as suas imagens e camadas.
   As posições das camadas usam percentagens do canvas 1080x1920.
   ========================================================= */

/* =========================================================
   MODELOS DE CONVITES

   Cada objeto representa um convite do catálogo.

   Para um novo convite, duplica o objeto correspondente e altera:
   - id
   - name
   - image
   - previewImage (quando houver personalização por camadas)
   - textos e valores por defeito
   ========================================================= */

/* Pasta base do primeiro modelo Toy Story. */
const TOY_STORY_1 = "Categorias/Infantil/Toy Story/Toy Story1/";

/*
  Posições iniciais do Toy Story 1.

  x/y são percentagens do canvas 1080x1920 e representam o centro de cada texto.
  Não existe uma largura/altura fixa para as frases: o tamanho da camada cresce
  de acordo com o conteúdo e o cliente pode arrastá-la livremente.

  As posições iniciais foram aproximadas diretamente a partir do PNG completo
  que enviaste, para que o convite abra já muito próximo do modelo original.
*/
const TOY_STORY_1_LAYERS = [
  {
    field: "name",
    className: "name",
    x: 57.5,
    y: 17.3,
    size: 15.5,
    font: "Sigmar One, sans-serif",
    color: "#ffc000",
    weight: 700,
    lineHeight: 0.82,
    shadow: "0.55cqw 0.65cqw 0 #00538b",
    align: "center"
  },
  {
    field: "faz",
    className: "red",
    x: 63.0,
    y: 26.2,
    size: 10.5,
    font: "HortaRegular, Horta, sans-serif",
    color: "#f0f0f0",
    weight: 700,
    lineHeight: 0.9,
    align: "center"
  },
  {
    field: "age",
    className: "number",
    x: 67.8,
    y: 37.5,
    size: 24.0,
    font: "Sigmar One, sans-serif",
    color: "#ffc000",
    weight: 700,
    lineHeight: 0.78,
    shadow: "0.6cqw 0.7cqw 0 #00538b",
    align: "center"
  },
  {
    field: "anos",
    className: "anos",
    x: 69.55,
    y: 46.1,
    size: 8.5,
    font: "Sigmar One, sans-serif",
    color: "#ffc000",
    weight: 700,
    lineHeight: 0.85,
    shadow: "0.45cqw 0.5cqw 0 #00538b",
    align: "center"
  },
  {
    field: "adventure",
    className: "blue adventure",
    x: 69.3,
    y: 56.65,
    size: 7.0,
    font: "HortaRegular, Horta, sans-serif",
    color: "#07588c",
    weight: 700,
    lineHeight: 0.92,
    align: "center"
  },
  {
    field: "date-month",
    className: "small-white month",
    x: 52.0,
    y: 64.5,
    size: 5.2,
    font: "HortaRegular, Horta, sans-serif",
    color: "#f0f0f0",
    weight: 700,
    lineHeight: 0.9,
    align: "center"
  },
  {
    field: "date-day",
    className: "yellow day",
    x: 52.15,
    y: 70.0,
    size: 12.0,
    font: "HortaRegular, Horta, sans-serif",
    color: "#ffc000",
    weight: 700,
    lineHeight: 0.8,
    shadow: "0.45cqw 0.5cqw 0 #00538b",
    align: "center"
  },
  {
    field: "weekday-time",
    className: "yellow time",
    x: 74.2,
    y: 64.4,
    size: 4.3,
    font: "HortaRegular, Horta, sans-serif",
    color: "#ffc000",
    weight: 700,
    lineHeight: 0.9,
    align: "center"
  },
  {
    value: "SALÃO DE FESTA",
    className: "small-white place-label",
    x: 74.25,
    y: 69.3,
    size: 4.4,
    font: "HortaRegular, Horta, sans-serif",
    color: "#f0f0f0",
    weight: 700,
    lineHeight: 0.9,
    align: "center"
  },
  {
    field: "place",
    className: "yellow place",
    x: 74.3,
    y: 72.45,
    size: 3.0,
    font: "HortaRegular, Horta, sans-serif",
    color: "#ffc000",
    weight: 700,
    lineHeight: 0.95,
    align: "center"
  },
  {
    field: "end",
    className: "blue end",
    x: 63.05,
    y: 80.65,
    size: 6.5,
    font: "HortaRegular, Horta, sans-serif",
    color: "#07588c",
    weight: 700,
    lineHeight: 0.9,
    align: "center"
  },
  {
    field: "otherInfo",
    className: "other-info",
    label: "Outras informações",
    x: 50.0,
    y: 88.0,
    size: 4.0,
    font: "HortaRegular, Horta, sans-serif",
    color: "#07588c",
    weight: 600,
    lineHeight: 1.0,
    align: "center"
  }
];

const INVITATION_TEMPLATES = [
  /* -------------------------
     Casamento
     ------------------------- */
  {
    id: "floral-01",
    name: "Floral Elegance",
    category: "casamentos",
    badge: "Mais procurado",
    image: "Categorias/Casamentos/Casamento1/convite.jpg",
    fallbackImage: "Images/casamentos.jpg",
    description: "Romântico e delicado, ideal para casamento.",
    defaultName: "João & Maria",
    defaultDate: "25 de Setembro de 2026",
    defaultTime: "15:30",
    defaultPlace: "Quinta da Luz",
    colors: [
      { name: "Rosa", value: "#d98ea2" },
      { name: "Lilás", value: "#a98ac0" },
      { name: "Azul", value: "#8aa8b8" },
      { name: "Verde", value: "#9bad86" },
      { name: "Bege", value: "#d6ae7b" },
      { name: "Terracota", value: "#c98265" }
    ]
  },

  /* -------------------------
     Chá de bebé
     ------------------------- */
  {
    id: "baby-01",
    name: "Baby Bloom",
    category: "cha-bebe",
    badge: "Novo",
    image: "Categorias/Chá de Bebé/ChaBebe1/convite.jpg",
    fallbackImage: "Images/cha_bebe.jpg",
    description: "Suave e encantador para chá de bebé.",
    defaultName: "Chá de Bebé",
    defaultDate: "10 de Outubro de 2026",
    defaultTime: "16:00",
    defaultPlace: "Casa da Família",
    colors: [
      { name: "Rosa", value: "#dca0ad" },
      { name: "Azul", value: "#9ebdce" },
      { name: "Verde", value: "#a8bd9a" },
      { name: "Lilás", value: "#b7a4c9" },
      { name: "Creme", value: "#d8c3a5" }
    ]
  },

  /* -------------------------
     Adultos
     ------------------------- */
  {
    id: "birthday-01",
    name: "Birthday Chic",
    category: "adultos",
    image: "Images/Categorias/Adultos/Adulto1/convite.jpg",
    fallbackImage: "Images/adultos.jpg",
    description: "Elegante para aniversários e celebrações.",
    defaultName: "Maria faz 30 anos",
    defaultDate: "12 de Novembro de 2026",
    defaultTime: "20:00",
    defaultPlace: "Restaurante Bella",
    colors: [
      { name: "Rosa", value: "#d98ea2" },
      { name: "Vinho", value: "#9d5d6d" },
      { name: "Azul", value: "#8198ad" },
      { name: "Verde", value: "#879b7a" },
      { name: "Dourado", value: "#c6a15b" }
    ]
  },

  /* -------------------------
     Toy Story 1
     ------------------------- */
  {
    id: "kids-toy-story-01",
    name: "Toy Story 1",
    category: "infantil",
    theme: "toy-story",
    image: `${TOY_STORY_1}ToyStory1_completo.png`,
    /* Base visual da personalização: imagem com marca d'água, sem substituir as camadas editáveis. */
    previewImage: `${TOY_STORY_1}ToyStory1_com.png`,
    /* Imagem completa usada como referência/final. */
    finalImage: `${TOY_STORY_1}ToyStory1_completo.png`,
    fallbackImage: "Images/infantil.jpg",
    description: "Modelo infantil do tema Toy Story.",
    defaultName: "João",
    defaultAge: "3",
    defaultDate: "2025-05-10",
    defaultTime: "15H",
    defaultPlace: "Rua Luís de Camões 4",
    defaultAdventure: "VEM PARTICIPAR\nNESSA AVENTURA!",
    defaultFaz: "FAZ",
    defaultAnos: "ANOS",
    defaultEnd: "ESPERAMOS POR TI!",
    defaultOtherInfo: "",
    defaultOtherInfoColor: "#07588c",
    textLayers: TOY_STORY_1_LAYERS
  },

  /* -------------------------
     Batizado
     ------------------------- */
  {
    id: "baptism-01",
    name: "Pure Blessing",
    category: "batizados",
    image: "Categorias/Batizados/Batizado1/convite.jpg",
    fallbackImage: "Images/batizados.jpg",
    description: "Clássico e delicado para um momento especial.",
    defaultName: "Batizado da Leonor",
    defaultDate: "18 de Outubro de 2026",
    defaultTime: "11:00",
    defaultPlace: "Igreja de São João",
    colors: [
      { name: "Rosa", value: "#d9a0aa" },
      { name: "Azul", value: "#91aebd" },
      { name: "Verde", value: "#a0ad92" },
      { name: "Creme", value: "#d6c5a8" },
      { name: "Lilás", value: "#b2a1bd" }
    ]
  },

  /* -------------------------
     Formatura
     ------------------------- */
  {
    id: "graduation-01",
    name: "New Chapter",
    category: "formaturas",
    image: "Categorias/Formaturas/Formatura1/convite.jpg",
    fallbackImage: "Images/formaturas.jpg",
    description: "Uma forma elegante de celebrar uma conquista.",
    defaultName: "A minha formatura",
    defaultDate: "20 de Julho de 2027",
    defaultTime: "18:00",
    defaultPlace: "Auditório Central",
    colors: [
      { name: "Rosa", value: "#d98ea2" },
      { name: "Azul", value: "#819cb1" },
      { name: "Verde", value: "#879c7d" },
      { name: "Vinho", value: "#9b6873" },
      { name: "Dourado", value: "#c4a15f" }
    ]
  }
];
