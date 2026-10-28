import { executarAjuste } from './_lib/agente.js';
import { criarRota } from './_lib/http.js';
import { validarAjuste } from './_lib/validacao.js';

export default criarRota({ validar: validarAjuste, executar: executarAjuste });
