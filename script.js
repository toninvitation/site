const menu = document.getElementById("menu");
const botao = document.getElementById("menu-mobile");

botao.addEventListener("click", () => {
    menu.classList.toggle("ativo");
    botao.classList.toggle("aberto");
});

document.querySelectorAll("#menu a").forEach(link => {

    link.addEventListener("click", () => {
        menu.classList.remove("ativo");
        botao.classList.remove("aberto");
    });

});


/* ========================================= */
/* CARROSSEL DE AVALIAÇÕES */
/* ========================================= */

const listaAvaliacoes = document.querySelector(".avaliacoes-lista");
const avaliacoes = document.querySelectorAll(".avaliacao");

const botaoAnterior = document.querySelector(".avaliacao-prev");
const botaoSeguinte = document.querySelector(".avaliacao-next");

let avaliacaoAtual = 0;


function obterQuantidadeVisivel(){

    if(window.innerWidth <= 900){

        return 1;

    }

    return 3;

}


function atualizarAvaliacoes(){

    const quantidadeVisivel = obterQuantidadeVisivel();

    const largura = 100 / quantidadeVisivel;

    listaAvaliacoes.style.transform =
        `translateX(-${avaliacaoAtual * largura}%)`;

}


botaoSeguinte.addEventListener("click", () => {

    const quantidadeVisivel = obterQuantidadeVisivel();

    const maximo =
        avaliacoes.length - quantidadeVisivel;


    if(avaliacaoAtual < maximo){

        avaliacaoAtual++;

    }else{

        avaliacaoAtual = 0;

    }


    atualizarAvaliacoes();

});


botaoAnterior.addEventListener("click", () => {

    const quantidadeVisivel = obterQuantidadeVisivel();


    const maximo =
        avaliacoes.length - quantidadeVisivel;


    if(avaliacaoAtual > 0){

        avaliacaoAtual--;

    }else{

        avaliacaoAtual = maximo;

    }


    atualizarAvaliacoes();

});


window.addEventListener("resize", () => {

    const quantidadeVisivel = obterQuantidadeVisivel();

    const maximo =
        avaliacoes.length - quantidadeVisivel;


    if(avaliacaoAtual > maximo){

        avaliacaoAtual = maximo;

    }


    atualizarAvaliacoes();

});


atualizarAvaliacoes();