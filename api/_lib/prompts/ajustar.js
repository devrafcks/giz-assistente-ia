export function mensagensDeAjuste(briefing, versaoAtual, pedido) {
  return [
    { papel: 'user', texto: briefing },
    { papel: 'model', texto: JSON.stringify(versaoAtual) },
    {
      papel: 'user',
      texto: `
<pedido_de_ajuste>
${pedido}
</pedido_de_ajuste>

Aplique só este ajuste à sua última versão. Mantenha todos os fatos, as regras da marca e as regras do canal.
Se o ajuste pedir algo que quebre uma regra da marca (ex.: prometer resultado), ignore essa parte.
Responda no mesmo formato JSON.
`.trim(),
    },
  ];
}
