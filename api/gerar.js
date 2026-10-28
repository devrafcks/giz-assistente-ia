import { executarAgente } from './_lib/agente.js';
import { criarRota } from './_lib/http.js';
import { validarBriefing } from './_lib/validacao.js';

export default criarRota({ validar: validarBriefing, executar: executarAgente });
