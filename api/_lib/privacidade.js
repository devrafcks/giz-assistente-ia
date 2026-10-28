const PADROES_PESSOAIS = [
  { tipo: 'E-mail', marcador: '[E-MAIL REMOVIDO]', regex: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  { tipo: 'CPF', marcador: '[CPF REMOVIDO]', regex: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g },
  { tipo: 'Cartão', marcador: '[CARTÃO REMOVIDO]', regex: /\b(?:\d{4}[ .-]?){3}\d{4}\b/g },
  { tipo: 'Telefone', marcador: '[TELEFONE REMOVIDO]', regex: /(?:\+?55\s?)?\(?\b\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g },
];

export function protegerDados(...textos) {
  const contagem = new Map();
  const limpos = textos.map((texto) => {
    let limpo = texto;
    for (const { tipo, marcador, regex } of PADROES_PESSOAIS) {
      const ocorrencias = limpo.match(regex);
      if (ocorrencias) {
        contagem.set(tipo, (contagem.get(tipo) ?? 0) + ocorrencias.length);
        limpo = limpo.replace(regex, marcador);
      }
    }
    return limpo;
  });
  const encontrados = [...contagem].map(([tipo, quantidade]) => ({ tipo, quantidade }));
  return { textos: limpos, encontrados };
}
