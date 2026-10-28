import { lerAprovados } from '../servicos/armazenamento.js';
import { NOMES_CANAL } from './tela.js';

export function formatarAprovado(item) {
  return {
    canal: NOMES_CANAL[item.canal] ?? item.canal,
    data: new Date(item.data).toLocaleString('pt-BR'),
    texto: item.texto,
  };
}

function criarCartao(item, aoAbrir) {
  const { canal, data, texto } = formatarAprovado(item);
  const li = document.createElement('li');
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'cartao-aprovado';
  botao.setAttribute('aria-haspopup', 'dialog');

  const topo = document.createElement('span');
  topo.className = 'cartao-topo';
  const nome = document.createElement('strong');
  nome.textContent = canal;
  const quando = document.createElement('time');
  quando.dateTime = new Date(item.data).toISOString();
  quando.textContent = data;
  topo.append(nome, quando);

  const resumo = document.createElement('span');
  resumo.className = 'cartao-texto';
  resumo.textContent = texto;

  botao.append(topo, resumo);
  botao.addEventListener('click', () => aoAbrir(item));
  li.append(botao);
  return li;
}

export function desenharHistorico(ul, aoAbrir) {
  const lista = lerAprovados();
  if (!lista.length) {
    const vazio = document.createElement('li');
    vazio.className = 'sem-itens';
    vazio.textContent = 'Nenhum texto aprovado ainda.';
    ul.replaceChildren(vazio);
    return;
  }
  ul.replaceChildren(...lista.map((item) => criarCartao(item, aoAbrir)));
}
