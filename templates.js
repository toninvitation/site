/*
  CATÁLOGO DE MODELOS

  Para adicionar um novo convite:
  1. Copie um objeto abaixo.
  2. Dê-lhe um novo id.
  3. Escolha a categoria.
  4. Coloque a imagem em Images/...
  5. Defina as cores disponíveis.

  Mais tarde, estes mesmos dados podem ser ligados a um backend.
*/

const INVITATION_TEMPLATES = [
  {
    id: "floral-01",
    name: "Floral Elegance",
    category: "casamento",
    badge: "Mais procurado",
    image: "Images/casamentos.jpg",
    description: "Romântico e delicado, ideal para casamento.",
    defaultName: "João & Maria",
    defaultDate: "25 de Setembro de 2026",
    defaultTime: "15:30",
    defaultPlace: "Quinta da Luz",
    colors: [
      {name:"Rosa", value:"#d98ea2"},
      {name:"Lilás", value:"#a98ac0"},
      {name:"Azul", value:"#8aa8b8"},
      {name:"Verde", value:"#9bad86"},
      {name:"Bege", value:"#d6ae7b"},
      {name:"Terracota", value:"#c98265"}
    ]
  },
  {
    id: "baby-01",
    name: "Baby Bloom",
    category: "bebe",
    badge: "Novo",
    image: "Images/cha_bebe.jpg",
    description: "Suave e encantador para chá de bebé.",
    defaultName: "Chá de Bebé",
    defaultDate: "10 de Outubro de 2026",
    defaultTime: "16:00",
    defaultPlace: "Casa da Família",
    colors: [
      {name:"Rosa", value:"#dca0ad"},
      {name:"Azul", value:"#9ebdce"},
      {name:"Verde", value:"#a8bd9a"},
      {name:"Lilás", value:"#b7a4c9"},
      {name:"Creme", value:"#d8c3a5"}
    ]
  },
  {
    id: "birthday-01",
    name: "Birthday Chic",
    category: "adulto",
    badge: "",
    image: "Images/adultos.jpg",
    description: "Elegante para aniversários e celebrações.",
    defaultName: "Maria faz 30 anos",
    defaultDate: "12 de Novembro de 2026",
    defaultTime: "20:00",
    defaultPlace: "Restaurante Bella",
    colors: [
      {name:"Rosa", value:"#d98ea2"},
      {name:"Vinho", value:"#9d5d6d"},
      {name:"Azul", value:"#8198ad"},
      {name:"Verde", value:"#879b7a"},
      {name:"Dourado", value:"#c6a15b"}
    ]
  },
  {
    id: "kids-01",
    name: "Little Party",
    category: "infantil",
    badge: "Infantil",
    image: "Images/infantil.jpg",
    description: "Divertido e colorido para os mais pequenos.",
    defaultName: "Leonor faz 5 anos",
    defaultDate: "5 de Dezembro de 2026",
    defaultTime: "15:00",
    defaultPlace: "Espaço Kids",
    colors: [
      {name:"Rosa", value:"#e59aaa"},
      {name:"Azul", value:"#88b5d1"},
      {name:"Amarelo", value:"#dfc16d"},
      {name:"Verde", value:"#91b48d"},
      {name:"Lilás", value:"#ae9bca"}
    ]
  },
  {
    id: "baptism-01",
    name: "Pure Blessing",
    category: "batizado",
    badge: "",
    image: "Images/batizados.jpg",
    description: "Clássico e delicado para um momento especial.",
    defaultName: "Batizado da Leonor",
    defaultDate: "18 de Outubro de 2026",
    defaultTime: "11:00",
    defaultPlace: "Igreja de São João",
    colors: [
      {name:"Rosa", value:"#d9a0aa"},
      {name:"Azul", value:"#91aebd"},
      {name:"Verde", value:"#a0ad92"},
      {name:"Creme", value:"#d6c5a8"},
      {name:"Lilás", value:"#b2a1bd"}
    ]
  },
  {
    id: "graduation-01",
    name: "New Chapter",
    category: "adulto",
    badge: "",
    image: "Images/formaturas.jpg",
    description: "Uma forma elegante de celebrar uma conquista.",
    defaultName: "A minha formatura",
    defaultDate: "20 de Julho de 2027",
    defaultTime: "18:00",
    defaultPlace: "Auditório Central",
    colors: [
      {name:"Rosa", value:"#d98ea2"},
      {name:"Azul", value:"#819cb1"},
      {name:"Verde", value:"#879c7d"},
      {name:"Vinho", value:"#9b6873"},
      {name:"Dourado", value:"#c4a15f"}
    ]
  }
];
