import { ErroAgente } from './erros.js';
import { OPCOES } from './prompts/marca.js';

const LIMITE_INFORMACOES = 1500;
const LIMITE_TEXTO_ATUAL = 3000;
const LIMITE_PEDIDO = 300;

function textoObrigatorio(valor, { campo, minimo, maximo }) {
  const texto = String(valor ?? '').trim();
  if (texto.length < minimo) {
    throw new ErroAgente(`Preencha ${campo} com pelo menos ${minimo} caracteres.`, 400);
  }
  if (texto.length > maximo) {
    throw new ErroAgente(`${campo[0].toUpperCase()}${campo.slice(1)} pode ter no máximo ${maximo} caracteres.`, 400);
  }
  return texto;
}

export function validarBriefing(corpo) {
  const entrada = {};
  for (const campo of Object.keys(OPCOES)) {
    const valor = corpo?.[campo];
    if (!Object.hasOwn(OPCOES[campo], valor)) {
      throw new ErroAgente(`Campo "${campo}" inválido.`, 400);
    }
    entrada[campo] = valor;
  }
  entrada.informacoes = textoObrigatorio(corpo?.informacoes, {
    campo: 'as informações principais', minimo: 10, maximo: LIMITE_INFORMACOES,
  });
  return entrada;
}

export function validarAjuste(corpo) {
  const entrada = validarBriefing(corpo?.briefing);
  const atual = corpo?.versaoAtual ?? {};
  return {
    entrada,
    versaoAtual: {
      assunto: String(atual.assunto ?? '').slice(0, 200),
      texto: textoObrigatorio(atual.texto, { campo: 'o texto atual', minimo: 1, maximo: LIMITE_TEXTO_ATUAL }),
    },
    pedido: textoObrigatorio(corpo?.pedido, { campo: 'o pedido de ajuste', minimo: 3, maximo: LIMITE_PEDIDO }),
  };
}
