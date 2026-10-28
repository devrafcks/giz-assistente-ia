export const $ = (seletor) => document.querySelector(seletor);

export const NOMES_CANAL = { whatsapp: 'WhatsApp', instagram: 'Instagram', email: 'E-mail' };

const SPRITE = 'assets/icones/icones.svg';
const ESTADOS = ['rodando', 'ok', 'alerta'];
const NOMES_ETAPA = {
  lgpd: 'Proteção de dados',
  entender: 'Entendendo o pedido',
  escrever: 'Escrevendo',
  revisar: 'Revisão de qualidade',
};
const NOMES_STATUS = { rodando: 'em andamento', ok: 'concluída', alerta: 'concluída com alertas' };

export function anunciar(texto) {
  $('#status').textContent = texto;
}

export function icone(nome) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `${SPRITE}#${nome}`);
  svg.append(use);
  return svg;
}

export function rotulo(botao, texto) {
  botao.querySelector('span').textContent = texto;
}

function tags(lista, classe = '') {
  const caixa = document.createElement('div');
  caixa.className = 'tags';
  for (const texto of lista) {
    const tag = document.createElement('span');
    tag.className = `tag ${classe}`;
    tag.textContent = texto;
    caixa.append(tag);
  }
  return caixa;
}

function elementosDaEtapa(etapa) {
  return [
    document.querySelector(`#etapas li[data-etapa="${etapa}"]`),
    document.querySelector(`#barra .par[data-etapa="${etapa}"]`),
  ];
}

export function reiniciarEtapas(etapas) {
  for (const etapa of etapas) {
    const [li, par] = elementosDaEtapa(etapa);
    li.classList.remove(...ESTADOS);
    par.classList.remove(...ESTADOS);
    li.querySelector('.detalhe').replaceChildren();
  }
}

export function mostrarErro(mensagem) {
  const caixa = $('#erro');
  caixa.replaceChildren(icone('atencao'), document.createTextNode(mensagem));
  caixa.hidden = false;
  document.querySelectorAll('#etapas li.rodando, #barra .par.rodando').forEach((el) => el.classList.remove('rodando'));
}

function detalheDaTriagem(dados) {
  const partes = [document.createTextNode(dados.resumo ?? '')];
  if (dados.pontos_chave?.length) partes.push(tags(dados.pontos_chave));
  if (dados.informacoes_faltando?.length) partes.push(tags(dados.informacoes_faltando.map((i) => `Falta: ${i}`), 'aviso'));
  if (dados.alertas?.length) partes.push(tags(dados.alertas.map((a) => `Atenção: ${a}`), 'aviso'));
  if (dados.instrucao_para_redator) {
    const bloco = document.createElement('details');
    bloco.className = 'meta-prompt';
    const titulo = document.createElement('summary');
    titulo.textContent = 'Instrução para o redator';
    const texto = document.createElement('p');
    texto.textContent = dados.instrucao_para_redator;
    bloco.append(titulo, texto);
    partes.push(bloco);
  }
  return partes;
}

export function atualizarEtapa(etapa, status, dados) {
  const [li, par] = elementosDaEtapa(etapa);
  if (!li) return;
  for (const el of [li, par]) {
    el.classList.remove(...ESTADOS);
    el.classList.add(status);
  }
  anunciar(`${NOMES_ETAPA[etapa]}: ${NOMES_STATUS[status]}.`);
  if (!dados) return;

  const detalhe = li.querySelector('.detalhe');
  if (etapa === 'lgpd') {
    detalhe.replaceChildren(
      dados.encontrados.length
        ? tags(dados.encontrados.map((d) => `${d.tipo} mascarado (${d.quantidade})`), 'aviso')
        : 'Nenhum dado pessoal encontrado.',
    );
  }
  if (etapa === 'entender') detalhe.replaceChildren(...detalheDaTriagem(dados));
  if (etapa === 'escrever') {
    detalhe.textContent = dados.ajuste ? 'Ajuste aplicado.' : 'Rascunho pronto.';
  }
  if (etapa === 'revisar') detalhe.textContent = `Nota da revisão: ${dados.nota}/10`;
}

function listaVerificada(ul, itens, titulo, comentario) {
  ul.replaceChildren(...itens.map((item) => {
    const li = document.createElement('li');
    li.className = item.ok ? 'ok' : 'falha';
    const texto = document.createElement('div');
    texto.textContent = item[titulo];
    if (item[comentario]) {
      const nota = document.createElement('em');
      nota.textContent = item[comentario];
      texto.append(nota);
    }
    li.append(icone(item.ok ? 'check' : 'atencao'), texto);
    return li;
  }));
}

export function mostrarResultado(r) {
  $('#resultado').hidden = false;
  $('#previa').className = `previa ${r.canal}`;
  $('#campo-assunto').hidden = !r.assunto;
  $('#assunto').value = r.assunto;
  $('#texto').value = r.texto;
  $('#previa-icone').setAttribute('href', `${SPRITE}#${r.canal}`);
  $('#previa-nome').textContent = NOMES_CANAL[r.canal];

  const notaHumano = $('#nota-humano');
  if (r.notaParaHumano) {
    const texto = document.createElement('span');
    texto.textContent = `Antes de publicar: ${r.notaParaHumano}`;
    notaHumano.replaceChildren(icone('atencao'), texto);
  } else {
    notaHumano.replaceChildren();
  }

  const nota = $('#nota');
  nota.textContent = `Qualidade ${r.nota}/10`;
  nota.className = `nota ${r.nota >= 8 ? 'boa' : 'media'}`;

  listaVerificada($('#perguntas'), r.perguntas ?? [], 'pergunta', 'resposta');
  listaVerificada($('#checklist'), r.checklist ?? [], 'item', 'comentario');

  $('#resultado').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function versaoAtual() {
  return {
    assunto: $('#campo-assunto').hidden ? '' : $('#assunto').value,
    texto: $('#texto').value,
  };
}

export function textoCompleto() {
  const { assunto, texto } = versaoAtual();
  return [assunto && `Assunto: ${assunto}`, texto].filter(Boolean).join('\n\n');
}
