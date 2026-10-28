import { formatarAprovado } from './historico.js';
import { $ } from './tela.js';

const dialogo = $('#dialogo-aprovado');

export function abrirAprovado(item) {
  const { canal, data, texto } = formatarAprovado(item);
  $('#dialogo-canal').textContent = canal;
  $('#dialogo-data').textContent = data;
  $('#dialogo-texto').textContent = texto;
  dialogo.showModal();
}

export function textoDoDialogo() {
  return $('#dialogo-texto').textContent;
}

$('#dialogo-fechar').addEventListener('click', () => dialogo.close());
dialogo.addEventListener('click', (evento) => {
  if (evento.target === dialogo) dialogo.close();
});
