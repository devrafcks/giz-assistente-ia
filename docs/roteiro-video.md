# Roteiro do vídeo pitch (até 4 minutos)

Grave a tela com o site aberto (Loom ou OBS) e publique no YouTube como "não listado".
Dica: deixe a aba com `?demo` aberta como plano B, caso a cota da IA acabe na hora.

| Tempo | Na tela | O que falar |
|---|---|---|
| **0:00–0:30** · Problema | Topo do site ("Seus textos em forma.") | "Na Giz, a recepção e a gerência escrevem todo dia os mesmos textos: feriado, aula nova, aluno que sumiu, resumo de reunião. Cada um escreve de um jeito, demora, e às vezes sai promessa que a academia não pode fazer ou até o telefone de um aluno." |
| **0:30–0:55** · Solução | Legenda das 4 anilhas | "Criei o Giz, o assistente de comunicação da academia. Não é um chat: é um agente com quatro etapas, cada uma com sua própria instrução. Proteger, entender, escrever e revisar. E quem publica é sempre uma pessoa." |
| **0:55–1:20** · Ferramentas | README aberto ou slide rápido | "Usei o Google Gemini pela API, rodando em uma função Node na Vercel. A chave fica só no servidor, nunca no navegador. O front é HTML, CSS e JavaScript puros." |
| **1:20–2:40** · Demo 1 | Clicar em **Reunião** → canal E-mail → **Gerar** | "Vou usar um caso real: o resumo da reunião de segunda. Repare que eu colei o telefone da Carla." Ao rodar: "Primeira anilha: o sistema mascarou o telefone antes de mandar para a IA. Segunda: o agente entendeu o pedido e já avisou que esse telefone está faltando no texto. Terceira: escreveu no formato de e-mail, com assunto. Quarta: revisou com um checklist e deu nota." Mostrar o alerta "Antes de publicar" e abrir o checklist. |
| **2:40–3:20** · Demo 2 | Clicar em **Aluno sumido** (WhatsApp, acolhedor) → **Gerar** | "Agora um caso delicado: chamar de volta um aluno que sumiu, sem cobrar e sem falar de corpo. O guia da marca proíbe promessa de resultado." Editar uma palavra no texto e clicar em **Aprovar**. "Eu posso editar, e só quando aprovo ele vai para o histórico." |
| **3:20–3:45** · Riscos | Parar no histórico | "Cuidei de quatro riscos: LGPD, com o mascaramento antes da IA; alucinação, porque ele marca o que falta em vez de inventar; viés, com regras contra julgar corpo; e segurança, com a chave no servidor e limite de uso." |
| **3:45–4:00** · Ganho | Voltar ao topo | "O ganho principal: um texto padronizado, no tom da marca e pronto para o canal em segundos. E o colaborador continua no controle. Obrigado!" |

## Checklist antes de gravar

- [ ] O site está no ar na Vercel, com a `GEMINI_API_KEY` configurada.
- [ ] Fiz um teste rápido para "acordar" a função e confirmar a cota.
- [ ] Limpei o histórico do navegador (ou deixei um ou dois aprovados de exemplo).
- [ ] Zoom do navegador em 100% ou 110% e janela em tela cheia.
- [ ] Desativei as notificações do computador.
