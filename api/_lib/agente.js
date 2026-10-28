import { gerarJson } from './gemini.js';
import { protegerDados } from './privacidade.js';
import { montarBriefing } from './prompts/marca.js';
import { PROMPT_ENTENDER } from './prompts/entender.js';
import { exemplosDoCanal, mensagemDeEscrita, promptRedator } from './prompts/escrever.js';
import { mensagemDeRevisao, promptRevisor } from './prompts/revisar.js';
import { mensagensDeAjuste } from './prompts/ajustar.js';

function etapaProteger(avisar, textos) {
  avisar('lgpd', 'rodando');
  const protegido = protegerDados(...textos);
  avisar('lgpd', protegido.encontrados.length ? 'alerta' : 'ok', { encontrados: protegido.encontrados });
  return protegido;
}

async function etapaEntender(avisar, briefing) {
  avisar('entender', 'rodando');
  const triagem = await gerarJson({
    sistema: PROMPT_ENTENDER,
    mensagens: [{ papel: 'user', texto: briefing }],
    temperatura: 0.2,
  });
  avisar('entender', triagem.alertas?.length ? 'alerta' : 'ok', triagem);
  return triagem;
}

async function etapaEscrever(avisar, { entrada, mensagens, ajuste = false }) {
  avisar('escrever', 'rodando');
  const rascunho = await gerarJson({
    sistema: promptRedator(entrada.canal, entrada.tamanho),
    mensagens,
    temperatura: 0.8,
  });
  avisar('escrever', 'ok', { ajuste });
  return rascunho;
}

async function etapaRevisar(avisar, { entrada, briefing, rascunho, pedido }) {
  avisar('revisar', 'rodando');
  const revisao = await gerarJson({
    sistema: promptRevisor(entrada.canal),
    mensagens: [{ papel: 'user', texto: mensagemDeRevisao(briefing, rascunho, pedido) }],
    temperatura: 0.2,
  });
  const falhou = [...(revisao.checklist ?? []), ...(revisao.perguntas_verificacao ?? [])].some((item) => !item.ok);
  avisar('revisar', falhou ? 'alerta' : 'ok', { nota: revisao.nota });
  return revisao;
}

function montarResultado({ entrada, rascunho, revisao, triagem, encontrados }) {
  return {
    canal: entrada.canal,
    assunto: revisao.assunto_final || rascunho.assunto || '',
    texto: revisao.texto_final || rascunho.texto || '',
    nota: revisao.nota,
    checklist: revisao.checklist ?? [],
    perguntas: revisao.perguntas_verificacao ?? [],
    notaParaHumano: revisao.nota_para_humano ?? '',
    triagem,
    dadosProtegidos: encontrados,
    modelo: revisao._modelo,
  };
}

export async function executarAgente(entrada, avisar = () => {}) {
  const { textos: [informacoes], encontrados } = etapaProteger(avisar, [entrada.informacoes]);
  const briefing = montarBriefing({ ...entrada, informacoes });

  const triagem = await etapaEntender(avisar, briefing);

  const rascunho = await etapaEscrever(avisar, {
    entrada,
    mensagens: [...exemplosDoCanal(entrada.canal), { papel: 'user', texto: mensagemDeEscrita(briefing, triagem) }],
  });

  const revisao = await etapaRevisar(avisar, { entrada, briefing, rascunho });
  return montarResultado({ entrada, rascunho, revisao, triagem, encontrados });
}

export async function executarAjuste({ entrada, versaoAtual, pedido }, avisar = () => {}) {
  const { textos, encontrados } = etapaProteger(avisar, [entrada.informacoes, versaoAtual.texto, pedido]);
  const [informacoes, textoAtual, pedidoLimpo] = textos;
  const briefing = montarBriefing({ ...entrada, informacoes });

  const rascunho = await etapaEscrever(avisar, {
    entrada,
    ajuste: true,
    mensagens: mensagensDeAjuste(briefing, { ...versaoAtual, texto: textoAtual }, pedidoLimpo),
  });

  const revisao = await etapaRevisar(avisar, { entrada, briefing, rascunho, pedido: pedidoLimpo });
  return montarResultado({ entrada, rascunho, revisao, triagem: null, encontrados });
}
