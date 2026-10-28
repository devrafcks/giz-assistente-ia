import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import gerar from '../api/gerar.js';
import ajustar from '../api/ajustar.js';

const PORTA = process.env.PORT || 3000;
const PASTA_PUBLICA = join(import.meta.dirname, '..', 'public');
const ROTAS = { '/api/gerar': gerar, '/api/ajustar': ajustar };
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function adaptarResposta(res) {
  res.status = (codigo) => {
    res.statusCode = codigo;
    return res;
  };
  res.json = (objeto) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(objeto));
  };
}

async function lerCorpo(req) {
  let corpo = '';
  for await (const pedaco of req) corpo += pedaco;
  try {
    return JSON.parse(corpo || '{}');
  } catch {
    return {};
  }
}

async function servirArquivo(pathname, res) {
  const caminho = normalize(join(PASTA_PUBLICA, pathname === '/' ? 'index.html' : pathname));
  if (!caminho.startsWith(PASTA_PUBLICA)) {
    res.statusCode = 403;
    return res.end();
  }
  try {
    const arquivo = await readFile(caminho);
    res.setHeader('Content-Type', TIPOS[extname(caminho)] ?? 'application/octet-stream');
    res.end(arquivo);
  } catch {
    res.statusCode = 404;
    res.end('Não encontrado');
  }
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const rota = ROTAS[pathname];
  if (rota) {
    req.body = await lerCorpo(req);
    adaptarResposta(res);
    return rota(req, res);
  }
  return servirArquivo(pathname, res);
}).listen(PORTA, () => console.log(`Giz rodando em http://localhost:${PORTA}`));
