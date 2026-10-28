export class ErroAgente extends Error {
  constructor(mensagem, status = 500) {
    super(mensagem);
    this.status = status;
  }
}
