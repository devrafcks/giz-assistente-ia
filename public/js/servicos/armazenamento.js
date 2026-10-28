const CHAVE = 'giz-aprovados';
const LIMITE = 20;

export function lerAprovados() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? [];
  } catch {
    return [];
  }
}

export function salvarAprovado(canal, texto) {
  const lista = [{ canal, texto, data: Date.now() }, ...lerAprovados()].slice(0, LIMITE);
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    return;
  }
}
