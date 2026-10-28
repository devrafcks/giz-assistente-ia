const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

const CHECKLIST = [
  { item: 'Respeita o tamanho e o formato do canal', ok: true, comentario: '' },
  { item: 'Tom adequado ao público e ao pedido', ok: true, comentario: '' },
  { item: 'Inclui todas as informações principais', ok: true, comentario: '' },
  { item: 'Não inventa dados que não estão no briefing', ok: true, comentario: '' },
  { item: 'Sem promessa de resultado ou orientação de saúde', ok: true, comentario: '' },
  { item: 'Chamada para ação clara', ok: false, comentario: 'Poderia indicar onde tirar dúvidas.' },
  { item: 'Ortografia e gramática', ok: true, comentario: '' },
];

const PERGUNTAS = [
  { pergunta: 'O texto informa o horário de sábado, 15/11?', resposta: 'Sim: das 8h às 14h.', ok: true },
  { pergunta: 'O texto avisa que as aulas coletivas foram canceladas?', resposta: 'Sim.', ok: true },
  { pergunta: 'O texto cita algum dado que não está no briefing?', resposta: 'Não.', ok: true },
];

function resultado(canal, texto) {
  return {
    canal,
    assunto: canal === 'email' ? 'Horário especial no feriado de 15/11' : '',
    texto,
    nota: 9,
    checklist: CHECKLIST,
    perguntas: PERGUNTAS,
    notaParaHumano: 'Confirme se o horário de domingo está certo.',
    modelo: 'modo demonstração',
  };
}

function* protecao(texto) {
  const temTelefone = /\d{4}-?\d{4}/.test(texto);
  yield {
    tipo: 'etapa', etapa: 'lgpd', status: temTelefone ? 'alerta' : 'ok',
    dados: { encontrados: temTelefone ? [{ tipo: 'Telefone', quantidade: 1 }] : [] },
  };
}

export async function* simularGeracao(dados) {
  yield { tipo: 'etapa', etapa: 'lgpd', status: 'rodando' };
  await esperar(400);
  yield* protecao(dados.informacoes);

  yield { tipo: 'etapa', etapa: 'entender', status: 'rodando' };
  await esperar(900);
  yield {
    tipo: 'etapa', etapa: 'entender', status: 'ok',
    dados: {
      resumo: 'Avisar os alunos sobre o horário especial do feriado.',
      pontos_chave: ['15/11 das 8h às 14h', 'Aulas coletivas canceladas', 'Domingo normal'],
      informacoes_faltando: [],
      alertas: [],
      instrucao_para_redator: 'Abra com a data do feriado. Dê o horário de sábado em destaque e, logo depois, avise que as aulas coletivas não acontecem. Feche com o horário de domingo e uma frase animada.',
    },
  };

  yield { tipo: 'etapa', etapa: 'escrever', status: 'rodando' };
  await esperar(1100);
  yield { tipo: 'etapa', etapa: 'escrever', status: 'ok', dados: { ajuste: false } };

  yield { tipo: 'etapa', etapa: 'revisar', status: 'rodando' };
  await esperar(900);
  yield { tipo: 'etapa', etapa: 'revisar', status: 'ok', dados: { nota: 9 } };

  yield {
    tipo: 'resultado',
    resultado: resultado(dados.canal, 'Oi! Passando para avisar sobre o feriado 📅\n\n*Sábado, 15/11:* abrimos das 8h às 14h.\nAs aulas coletivas não acontecem nesse dia.\n\n*Domingo, 16/11:* horário normal, das 8h às 13h.\n\nBora manter o ritmo! 💪\nEquipe Giz'),
  };
}

export async function* simularAjuste({ briefing, pedido }) {
  yield { tipo: 'etapa', etapa: 'lgpd', status: 'rodando' };
  await esperar(300);
  yield* protecao(briefing.informacoes);

  yield { tipo: 'etapa', etapa: 'escrever', status: 'rodando' };
  await esperar(900);
  yield { tipo: 'etapa', etapa: 'escrever', status: 'ok', dados: { ajuste: true } };

  yield { tipo: 'etapa', etapa: 'revisar', status: 'rodando' };
  await esperar(700);
  yield { tipo: 'etapa', etapa: 'revisar', status: 'ok', dados: { nota: 9 } };

  yield {
    tipo: 'resultado',
    resultado: resultado(briefing.canal, `Feriado chegando! (${pedido})\n\n*Sábado, 15/11:* das 8h às 14h, sem aulas coletivas.\n*Domingo, 16/11:* das 8h às 13h.\n\nEquipe Giz`),
  };
}
