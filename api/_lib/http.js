import { ErroAgente } from './erros.js';

const JANELA_MS = 60_000;
const MAX_POR_JANELA = 10;
const acessos = new Map();

function ipDe(req) {
  return String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'anonimo').split(',')[0].trim();
}

function excedeuLimite(ip) {
  const agora = Date.now();
  const recentes = (acessos.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  recentes.push(agora);
  acessos.set(ip, recentes);
  return recentes.length > MAX_POR_JANELA;
}

export function criarRota({ validar, executar }) {
  return async function rota(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ erro: 'Use POST.' });
    }
    if (excedeuLimite(ipDe(req))) {
      return res.status(429).json({ erro: 'Muitos pedidos seguidos. Espere um minuto.' });
    }

    let entrada;
    try {
      entrada = validar(req.body);
    } catch (erro) {
      return res.status(erro.status ?? 400).json({ erro: erro.message });
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const enviar = (evento) => res.write(JSON.stringify(evento) + '\n');

    try {
      const resultado = await executar(entrada, (etapa, status, dados) => enviar({ tipo: 'etapa', etapa, status, dados }));
      enviar({ tipo: 'resultado', resultado });
    } catch (erro) {
      if (!(erro instanceof ErroAgente)) console.error(erro);
      enviar({ tipo: 'erro', erro: erro instanceof ErroAgente ? erro.message : 'Erro inesperado no servidor.' });
    }
    res.end();
  };
}
