import { AVISO_INJECAO, GUIA_DE_MARCA, OPCOES, REGRAS_DE_CANAL, REGRAS_DE_TAMANHO, montarBriefing } from './marca.js';

export function promptRedator(canal, tamanho) {
  return `
Você é Leo, redator da Giz. Antes de escrever, você foi professor de musculação por seis anos,
então escreve como quem conversa com aluno no salão: direto, animado e sem enrolação.

${GUIA_DE_MARCA}

Regras do canal (${OPCOES.canal[canal]}):
${REGRAS_DE_CANAL[canal]}
${REGRAS_DE_TAMANHO[tamanho]}

${AVISO_INJECAO}

As mensagens de exemplo anteriores mostram o formato e o tom esperados para este canal.
Nunca copie fatos dos exemplos: use apenas o briefing atual.

Responda somente com JSON, neste formato:
{
  "assunto": "só para e-mail; nos outros canais, string vazia",
  "texto": "o corpo da mensagem pronto para uso, com quebras de linha"
}
`.trim();
}

const EXEMPLOS = {
  whatsapp: {
    briefing: {
      objetivo: 'comunicado', publico: 'alunos', canal: 'whatsapp', tom: 'informativo', tamanho: 'curto',
      informacoes: 'Manutenção do ar-condicionado da sala de musculação na quarta 12/03 das 6h às 10h. A sala de funcional fica aberta.',
    },
    resposta: {
      assunto: '',
      texto: 'Bom dia! Aviso rápido sobre a *quarta, 12/03* ❄️\n\nDas 6h às 10h a sala de musculação fica em manutenção do ar-condicionado.\nA sala de funcional funciona normal nesse horário.\n\nQualquer dúvida, chama a recepção. Bom treino!\nEquipe Giz',
    },
  },
  instagram: {
    briefing: {
      objetivo: 'evento', publico: 'alunos', canal: 'instagram', tom: 'motivador', tamanho: 'medio',
      informacoes: 'Aulão sábado 22/03 às 9h, ritmo e funcional, todos os níveis. Alunos podem levar convidados. Vagas na recepção.',
    },
    resposta: {
      assunto: '',
      texto: 'Sábado tem aulão e você está convidado. 🔥\n\nDia 22/03, às 9h, a gente junta ritmo e funcional numa aula só, para todos os níveis.\n\nTraz aquele amigo que vive dizendo que vai começar: convidados são bem-vindos.\n\nGaranta sua vaga na recepção.\n\n#AcademiaGiz #Aulao #TreinoEmGrupo #Funcional',
    },
  },
  email: {
    briefing: {
      objetivo: 'boas_vindas', publico: 'novos', canal: 'email', tom: 'acolhedor', tamanho: 'medio',
      informacoes: 'Primeira semana: avaliação física gratuita, agendar na recepção. Reserva de aulas pelo app. Horário: seg a sex 6h às 23h, sábado 8h às 14h.',
    },
    resposta: {
      assunto: 'Boas-vindas à Giz: seus primeiros passos',
      texto: 'Olá!\n\nQue bom ter você com a gente. Para começar bem, separamos três coisas:\n\n1. Sua avaliação física é gratuita: agende na recepção nesta primeira semana.\n2. No app você reserva as aulas coletivas.\n3. Funcionamos de segunda a sexta, das 6h às 23h, e aos sábados, das 8h às 14h.\n\nNo começo, cada treino conta. Estamos aqui para ajudar no que precisar.\n\nEquipe Giz',
    },
  },
};

export function exemplosDoCanal(canal) {
  const { briefing, resposta } = EXEMPLOS[canal];
  return [
    { papel: 'user', texto: montarBriefing(briefing) },
    { papel: 'model', texto: JSON.stringify(resposta) },
  ];
}

export function mensagemDeEscrita(briefing, triagem) {
  return `
${briefing}

<instrucao_da_coordenacao>
${triagem.instrucao_para_redator ?? ''}
</instrucao_da_coordenacao>

<pontos_chave>
${(triagem.pontos_chave ?? []).map((p) => `- ${p}`).join('\n')}
</pontos_chave>
`.trim();
}
