import { EXEMPLOS, SUGESTOES_DE_AJUSTE } from './dados/exemplos.js';
import { transmitir } from './servicos/api.js';
import { simularAjuste, simularGeracao } from './servicos/demo.js';
import { salvarAprovado } from './servicos/armazenamento.js';
import { abrirAprovado, textoDoDialogo } from './interface/dialogo.js';
import { desenharHistorico } from './interface/historico.js';
import {
  $, anunciar, atualizarEtapa, mostrarErro, mostrarResultado, reiniciarEtapas, rotulo, textoCompleto, versaoAtual,
} from './interface/tela.js';

const MODO_DEMO = new URLSearchParams(location.search).has('demo');
const TODAS_AS_ETAPAS = ['lgpd', 'entender', 'escrever', 'revisar'];
const ETAPAS_DO_AJUSTE = ['lgpd', 'escrever', 'revisar'];

const form = $('#form');
const botaoGerar = $('#botao-gerar');
const botaoAjustar = $('#botao-ajustar');
const listaAprovados = $('#historico');
let ultimoBriefing = null;
let ultimoCanal = null;

function atualizarContador() {
  $('#contador').textContent = form.elements.informacoes.value.length;
}

function preencherExemplo(nome) {
  for (const [campo, valor] of Object.entries(EXEMPLOS[nome])) {
    const elementos = form.elements[campo];
    if (elementos instanceof RadioNodeList) {
      for (const radio of elementos) radio.checked = radio.value === valor;
    } else {
      elementos.value = valor;
    }
  }
  atualizarContador();
}

async function executar({ botao, textoOcupado, textoLivre, etapas, eventos }) {
  const botoes = [botaoGerar, botaoAjustar, $('#botao-refazer')];
  botoes.forEach((b) => (b.disabled = true));
  rotulo(botao, textoOcupado);
  $('#etapas').setAttribute('aria-busy', 'true');
  $('#erro').hidden = true;
  reiniciarEtapas(etapas);

  try {
    for await (const evento of eventos) {
      if (evento.tipo === 'etapa') atualizarEtapa(evento.etapa, evento.status, evento.dados);
      if (evento.tipo === 'resultado') {
        ultimoCanal = evento.resultado.canal;
        mostrarResultado(evento.resultado);
        anunciar(`Texto pronto. Nota da revisão: ${evento.resultado.nota} de 10.`);
      }
      if (evento.tipo === 'erro') throw new Error(evento.erro);
    }
  } catch (erro) {
    mostrarErro(erro.message || 'Algo deu errado. Tente de novo.');
  } finally {
    botoes.forEach((b) => (b.disabled = false));
    rotulo(botao, textoLivre);
    $('#etapas').removeAttribute('aria-busy');
  }
}

function gerar() {
  const dados = Object.fromEntries(new FormData(form));
  if (dados.informacoes.trim().length < 10) {
    mostrarErro('Escreva as informações principais (pelo menos 10 caracteres).');
    form.elements.informacoes.focus();
    return;
  }
  ultimoBriefing = dados;
  $('#vazio').hidden = true;
  $('#resultado').hidden = true;
  executar({
    botao: botaoGerar,
    textoOcupado: 'Gerando...',
    textoLivre: 'Gerar comunicação',
    etapas: TODAS_AS_ETAPAS,
    eventos: MODO_DEMO ? simularGeracao(dados) : transmitir('/api/gerar', dados),
  });
}

function ajustar(pedido) {
  if (!ultimoBriefing || pedido.trim().length < 3) {
    $('#pedido-ajuste').focus();
    return;
  }
  const dados = { briefing: ultimoBriefing, versaoAtual: versaoAtual(), pedido: pedido.trim() };
  executar({
    botao: botaoAjustar,
    textoOcupado: 'Ajustando...',
    textoLivre: 'Ajustar',
    etapas: ETAPAS_DO_AJUSTE,
    eventos: MODO_DEMO ? simularAjuste(dados) : transmitir('/api/ajustar', dados),
  });
  $('#pedido-ajuste').value = '';
}

async function copiar(botao, texto) {
  try {
    await navigator.clipboard.writeText(texto);
    rotulo(botao, 'Copiado');
  } catch {
    rotulo(botao, 'Não deu para copiar');
  }
  setTimeout(() => rotulo(botao, 'Copiar'), 1500);
}

function redesenharHistorico() {
  desenharHistorico(listaAprovados, abrirAprovado);
}

function criarSugestoes() {
  const sugestoes = $('#sugestoes-ajuste');
  for (const texto of SUGESTOES_DE_AJUSTE) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = texto;
    botao.addEventListener('click', () => ajustar(texto));
    sugestoes.append(botao);
  }
}

if (MODO_DEMO) $('#selo-modo').hidden = false;

document.querySelectorAll('[data-exemplo]').forEach((botao) => {
  botao.addEventListener('click', () => preencherExemplo(botao.dataset.exemplo));
});

form.elements.informacoes.addEventListener('input', atualizarContador);
form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  gerar();
});

$('#form-ajuste').addEventListener('submit', (evento) => {
  evento.preventDefault();
  ajustar($('#pedido-ajuste').value);
});

$('#botao-refazer').addEventListener('click', gerar);
$('#botao-copiar').addEventListener('click', (evento) => copiar(evento.currentTarget, textoCompleto()));
$('#dialogo-copiar').addEventListener('click', (evento) => copiar(evento.currentTarget, textoDoDialogo()));

$('#botao-aprovar').addEventListener('click', (evento) => {
  if (!ultimoCanal) return;
  salvarAprovado(ultimoCanal, textoCompleto());
  redesenharHistorico();
  const botao = evento.currentTarget;
  rotulo(botao, 'Aprovado');
  anunciar('Texto aprovado e salvo em Aprovados.');
  setTimeout(() => rotulo(botao, 'Aprovar'), 1500);
});

criarSugestoes();
redesenharHistorico();
