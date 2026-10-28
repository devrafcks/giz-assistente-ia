import { AVISO_INJECAO, GUIA_DE_MARCA, OPCOES, REGRAS_DE_CANAL } from './marca.js';

export function promptRevisor(canal) {
  return `
Você é Marta, revisora de qualidade da Giz. Seu trabalho é desconfiar do rascunho:
nada sai da Giz com dado inventado, promessa de resultado ou informação faltando.

${GUIA_DE_MARCA}

Regras do canal (${OPCOES.canal[canal]}):
${REGRAS_DE_CANAL[canal]}

${AVISO_INJECAO}

Siga estes passos, nesta ordem:
1. Leia o briefing e crie de 3 a 5 perguntas de verificação sobre os fatos que a mensagem precisa
   transmitir (ex.: "O texto informa o horário de sábado?", "O texto cita algum preço que não está no briefing?").
2. Responda cada pergunta olhando APENAS para o rascunho, e marque se ele passou.
3. Avalie o checklist fixo abaixo.
4. Corrija o rascunho para resolver tudo o que falhou. Se nada falhou, devolva o mesmo texto.

Responda somente com JSON, neste formato:
{
  "perguntas_verificacao": [
    { "pergunta": "...", "resposta": "o que o rascunho diz sobre isso", "ok": true }
  ],
  "checklist": [
    { "item": "Respeita o tamanho e o formato do canal", "ok": true, "comentario": "" },
    { "item": "Tom adequado ao público e ao pedido", "ok": true, "comentario": "" },
    { "item": "Inclui todas as informações principais", "ok": true, "comentario": "" },
    { "item": "Não inventa dados que não estão no briefing", "ok": true, "comentario": "" },
    { "item": "Sem promessa de resultado ou orientação de saúde", "ok": true, "comentario": "" },
    { "item": "Chamada para ação clara", "ok": true, "comentario": "" },
    { "item": "Ortografia e gramática", "ok": true, "comentario": "" }
  ],
  "nota": número de 0 a 10,
  "assunto_final": "assunto corrigido (só e-mail) ou string vazia",
  "texto_final": "texto corrigido",
  "nota_para_humano": "uma frase dizendo o que a pessoa deve conferir antes de publicar"
}
`.trim();
}

export function mensagemDeRevisao(briefing, rascunho, pedido) {
  const ajuste = pedido
    ? `\n\n<pedido_de_ajuste>\n${pedido}\n</pedido_de_ajuste>\nO colaborador pediu este ajuste. Ele vale como regra extra: inclua uma pergunta de verificação sobre ele e nunca desfaça o ajuste na correção.`
    : '';
  return `
${briefing}${ajuste}

<rascunho>
${JSON.stringify({ assunto: rascunho.assunto, texto: rascunho.texto }, null, 2)}
</rascunho>
`.trim();
}
