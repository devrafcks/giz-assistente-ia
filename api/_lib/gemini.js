import { ErroAgente } from './erros.js';

const URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODELOS = [...new Set([process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'])];
const STATUS_TENTAR_RESERVA = new Set([404, 500, 503]);
const TEMPO_LIMITE_MS = 30_000;

export async function gerarJson({ sistema, mensagens, temperatura }) {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    throw new ErroAgente('A chave GEMINI_API_KEY não está configurada no servidor.', 500);
  }

  const corpo = JSON.stringify({
    systemInstruction: { parts: [{ text: sistema }] },
    contents: mensagens.map(({ papel, texto }) => ({ role: papel, parts: [{ text: texto }] })),
    generationConfig: { temperature: temperatura, responseMimeType: 'application/json' },
  });

  for (const [i, modelo] of MODELOS.entries()) {
    const resposta = await chamar(modelo, chave, corpo);
    const ultimaTentativa = i === MODELOS.length - 1;
    if (resposta.ok || ultimaTentativa || !STATUS_TENTAR_RESERVA.has(resposta.status)) {
      return lerResposta(resposta, modelo);
    }
    console.error(`Gemini ${modelo} respondeu ${resposta.status}, tentando modelo reserva`);
  }
}

async function chamar(modelo, chave, corpo) {
  try {
    return await fetch(`${URL_BASE}/${modelo}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
      body: corpo,
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
  } catch {
    throw new ErroAgente('A IA demorou demais para responder. Tente de novo.', 504);
  }
}

async function lerResposta(resposta, modelo) {
  if (!resposta.ok) {
    console.error(`Gemini ${modelo} respondeu ${resposta.status}`);
    if (resposta.status === 429) {
      throw new ErroAgente('Limite de uso da IA atingido. Espere um minuto e tente de novo.', 429);
    }
    throw new ErroAgente('Não foi possível consultar a IA agora.', 502);
  }

  const dados = await resposta.json();
  const texto = dados.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  return { ...lerJson(texto), _modelo: dados.modelVersion || modelo };
}

function lerJson(texto) {
  const semCercas = texto.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  try {
    return JSON.parse(semCercas);
  } catch {
    throw new ErroAgente('A IA devolveu uma resposta em formato inesperado. Tente de novo.', 502);
  }
}
