/* =========================================================
   TONInvitation — CATEGORIAS
   Este ficheiro contém os dados das categorias e dos temas.
   Para adicionar uma categoria, cria um novo objeto nesta lista.
   ========================================================= */

/* =========================================================
   CATEGORIAS E TEMAS DO CATÁLOGO
   ========================================================= */

const INVITATION_CATEGORIES = [
  {
    id: "infantil",
    name: "Infantil",
    image: "Images/infantil.jpg",
    description: "Temas divertidos para festas dos mais pequenos.",
    type: "themes"
  },
  {
    id: "casamentos",
    name: "Casamentos",
    image: "Images/casamentos.jpg",
    description: "Convites românticos e elegantes para o grande dia.",
    type: "invitations"
  },
  {
    id: "adultos",
    name: "Adultos",
    image: "Images/adultos.jpg",
    description: "Aniversários e celebrações para adultos.",
    type: "invitations"
  },
  {
    id: "cha-bebe",
    name: "Chá de Bebé",
    image: "Images/cha_bebe.jpg",
    description: "Modelos delicados para celebrar a chegada do bebé.",
    type: "invitations"
  },
  {
    id: "batizados",
    name: "Batizados",
    image: "Images/batizados.jpg",
    description: "Convites delicados para um momento especial.",
    type: "invitations"
  },
  {
    id: "formaturas",
    name: "Formaturas",
    image: "Images/formaturas.jpg",
    description: "Modelos para celebrar uma grande conquista.",
    type: "invitations"
  },
  {
    id: "outros-eventos",
    name: "Outros Eventos",
    image: "Images/outros eventos.jpg",
    description: "Outras ocasiões especiais.",
    type: "invitations"
  }
];

/*
  Cada tema aponta para a imagem que representa a coleção.

  Para o Toy Story aceitamos os dois nomes mais prováveis da capa.
  A primeira opção é a que deve existir na tua pasta; a segunda é
  usada automaticamente se o primeiro nome não for encontrado.
*/
const INVITATION_THEMES = {
  infantil: [
    {
      id: "cars",
      name: "Cars",
      image: "Images/infantil.jpg",
      description: "Convites para fãs de Cars.",
      folder: "Cars"
    },
    {
      id: "kpop-demon-hunters",
      name: "K-Pop Demon Hunters",
      image: "Images/infantil.jpg",
      description: "Convites com o tema K-Pop Demon Hunters.",
      folder: "K-Pop Demon Hunters"
    },
    {
      id: "toy-story",
      name: "Toy Story",
      image: "Categorias/Infantil/Toy Story/Toy Story1/Toy Story_capa.png",
      alternateImages: "Categorias/Infantil/Toy Story/Toy Story1/Toy Story_capa.png",
      fallbackImage: "Images/infantil.jpg",
      description: "Convites com o tema Toy Story.",
      folder: "Toy Story"
    }
  ]
};
