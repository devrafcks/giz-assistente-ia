export async function* transmitir(rota, dados) {
  const resposta = await fetch(rota, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    throw new Error(corpo.erro || `Erro ${resposta.status}`);
  }

  const leitor = resposta.body.getReader();
  const decodificador = new TextDecoder();
  let pendente = '';
  while (true) {
    const { value, done } = await leitor.read();
    if (done) break;
    pendente += decodificador.decode(value, { stream: true });
    const linhas = pendente.split('\n');
    pendente = linhas.pop();
    for (const linha of linhas) if (linha.trim()) yield JSON.parse(linha);
  }
  if (pendente.trim()) yield JSON.parse(pendente);
}
