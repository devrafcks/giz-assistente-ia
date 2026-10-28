# Parte teórica: análise e discussão

**Projeto:** Giz · Assistente de comunicação
**Desafio:** Seu Primeiro Agente de IA: Criando um Assistente Corporativo Inteligente

---

## 1. Contextualização do problema e da solução

A Giz é uma rede fictícia de academias de bairro em crescimento. A recepção e a gerência escrevem todos os dias os mesmos tipos de comunicação: horário de feriado, aula nova, mensagem para aluno que parou de ir, resumo de reunião da equipe. Sem padrão, surgem três problemas:

1. **Tempo:** cada texto começa do zero, entre um atendimento e outro no balcão.
2. **Inconsistência:** cada pessoa escreve com um tom e um tamanho diferentes, e o texto nem sempre combina com o canal (um e-mail colado no WhatsApp, um post sem chamada para ação).
3. **Risco:** textos de academia tendem a escorregar para promessas de resultado físico, comentários sobre corpo e, às vezes, dados pessoais de alunos.

A solução é um assistente com **entrada estruturada**, não um chat aberto. O colaborador escolhe objetivo, público, canal (WhatsApp, Instagram ou e-mail), tom e tamanho e escreve só os fatos. Um agente de quatro etapas transforma isso num texto pronto para revisão, e a pessoa pode pedir ajustes em linguagem natural antes de aprovar.

## 2. Modelo de IA e justificativa

**Google Gemini 3.5 Flash-Lite** (`gemini-3.5-flash-lite`), com `gemini-flash-lite-latest` como reserva automática.

- **Leveza e velocidade:** é a versão mais leve da família. Nos testes, cada chamada levou cerca de 1,5 s. Uma geração completa (três chamadas) ficou em torno de 5 s, e um ajuste em torno de 3,5 s. Para quem está no balcão, isso é o que separa "uso" de "desisto".
- **Tarefa adequada ao modelo:** os textos são curtos, com regras claras e exemplos. Um modelo maior não trouxe ganho perceptível nos testes e custaria mais tempo e cota.
- **Custo:** tem plano gratuito no Google AI Studio, suficiente para protótipo e demonstração.
- **Saída estruturada:** aceita `responseMimeType: application/json`, o que permite encadear etapas com segurança.
- **Resiliência:** o sistema troca sozinho para o modelo reserva quando o principal responde 404 ou 503. Isso aconteceu de fato durante o desenvolvimento: uma versão anterior foi descontinuada.

## 3. Estratégia de prompt e instruções

A estratégia separa responsabilidades: cada etapa tem um prompt curto, um papel e uma técnica de engenharia de prompt escolhida para aquela tarefa.

| Etapa | Técnica | Por que essa técnica | Temperatura |
|---|---|---|---|
| Entender | **Zero-shot** | Classificar e extrair fatos é uma tarefa que o modelo já faz bem só com instruções e um formato de saída. Exemplos aqui só enviesariam a classificação. | 0,2 |
| Entender | **Meta prompting** | A triagem não escreve o texto: ela escreve o prompt do redator (`instrucao_para_redator`), adaptado a cada pedido. Esse prompt aparece na tela, o que deixa o raciocínio auditável. | 0,2 |
| Todas | **Persona e role prompting** | Bia (coordenadora experiente), Leo (ex-professor que virou redator) e Marta (revisora desconfiada). A persona ajusta o vocabulário e o nível de rigor de cada etapa. | — |
| Escrever | **Few-shot** | Formato e tom variam muito por canal. Um par de exemplo briefing → resposta do mesmo canal, enviado como turnos de conversa, ensina mais do que uma descrição, com a regra explícita de nunca copiar fatos do exemplo. | 0,8 |
| Revisar | **Verificação de perguntas e respostas** | A revisora cria de 3 a 5 perguntas sobre os fatos do briefing, responde olhando só para o rascunho e corrige o que falhou. Isso ataca diretamente a alucinação. | 0,2 |
| Ajustar | **Follow-up** | O modelo recebe o briefing, a última versão (com as edições da pessoa) e o novo pedido, como continuação da conversa. A revisão recebe o pedido como regra extra, para não desfazer o ajuste. | 0,8 |

Regras transversais:

- **Guia de marca** comum a todas as etapas: voz, tratamento por "você" e regras inegociáveis (nunca prometer resultado, nunca orientar saúde, nunca comentar corpo, nunca inventar dados, nunca incluir dados pessoais).
- **Marcadores para lacunas:** quando falta uma informação, o modelo escreve `[HORÁRIO A CONFIRMAR]` em vez de inventar.
- **Regras por canal:** limites de caracteres e de emojis, assunto no e-mail e hashtags no Instagram.
- **Delimitação contra injeção de prompt:** o texto livre vai dentro de `<briefing>` e `<pedido_de_ajuste>`, com a instrução de tratá-lo como dado. Os campos de seleção só aceitam valores de uma lista validada no servidor.

## 4. Fluxo de funcionamento

1. **Entrada:** formulário com cinco campos fechados e um campo de texto de até 1.500 caracteres.
2. **Servidor (função Node na Vercel):** valida os campos, aplica um limite de uso por IP e abre uma resposta em streaming.
3. **Proteger (sem IA):** expressões regulares substituem CPF, telefone, e-mail e cartão por marcadores como `[TELEFONE REMOVIDO]`. Só depois disso algo é enviado ao Gemini.
4. **Entender:** triagem em JSON, com fatos, lacunas, alertas e a instrução para o redator.
5. **Escrever:** exemplo do canal, briefing e instrução da triagem.
6. **Revisar:** perguntas de verificação, checklist fixo, correção, nota e uma orientação para o humano.
7. **Saída:** cada etapa aparece na tela assim que termina (uma anilha entra na barra). O texto final é editável.
8. **Ajuste (follow-up):** a pessoa pede uma mudança ("sem emojis", "comece pelo horário"). O fluxo repete proteger, escrever e revisar sobre a versão atual.
9. **Aprovação humana:** só a pessoa aprova. Os aprovados vão para um histórico local.

## 5. Benefícios, limitações e supervisão humana

**Benefícios**
- Um texto adequado ao canal em segundos, a partir de poucas linhas de fatos.
- Padronização: o guia de marca é aplicado sempre, por qualquer colaborador.
- Prevenção: dados pessoais são removidos antes de sair do servidor, e promessas proibidas são barradas na escrita e na revisão.
- Transparência: a pessoa vê o que o agente entendeu, o que estava faltando, a instrução gerada e as perguntas de verificação.

**Limitações**
- O modelo pode errar o tom ou interpretar mal um briefing ambíguo.
- A revisão é feita por um modelo da mesma família que escreveu, então pode deixar passar o mesmo tipo de erro.
- O mascaramento por regex não reconhece nomes, endereços ou dados de saúde escritos por extenso.
- Depende de um serviço externo (disponibilidade, cotas e mudanças de versão do modelo).

**Quando a supervisão humana é obrigatória**
- **Sempre antes de publicar:** o sistema não envia nada, só sugere.
- Quando aparece um alerta na triagem ou um item reprovado na verificação.
- Quando o texto contém marcadores como `[... A CONFIRMAR]` ou `[... REMOVIDO]`.
- Em temas sensíveis: saúde, lesões, cobrança, cancelamento, reclamações e comunicados sobre pessoas da equipe.
- Em qualquer comunicação com preço, prazo ou condição comercial.

## 6. Análise de riscos

| Risco | Como aparece | Mitigação na solução |
|---|---|---|
| **Privacidade / LGPD** | Colaborador cola telefone, CPF ou e-mail de aluno no briefing ou no pedido de ajuste | Mascaramento no servidor antes do envio ao modelo, inclusive no ajuste; o conteúdo dos pedidos não é registrado em log; histórico só no navegador. Princípios aplicados: necessidade e minimização (art. 6º, III) e segurança (art. 6º, VII). |
| **Alucinação** | Modelo inventa horário, preço ou nome | Regra contra inventar dados, marcadores `[A CONFIRMAR]`, perguntas de verificação comparando rascunho e briefing e aprovação humana. |
| **Viés** | Linguagem que associa academia a corpo "ideal" ou exclui públicos | Guia de marca proíbe comentários sobre corpo e promessas estéticas; tom acolhedor disponível; checklist de tom adequado ao público. |
| **Injeção de prompt** | Texto do usuário tenta mudar as regras ("ignore as instruções...") | Briefing e pedido delimitados e tratados como dado; selects validados contra lista fixa; limites de tamanho. |
| **Segurança da chave** | Chave de API exposta no navegador | A chave existe só como variável de ambiente na Vercel; o navegador conversa apenas com `/api/gerar` e `/api/ajustar`. |
| **Abuso e custo** | Uso automatizado esgotando a cota | Limite de pedidos por IP por minuto, tamanho máximo das entradas e modelo leve. |
| **Dependência do fornecedor** | Modelo descontinuado ou fora do ar | Modelo reserva automático, usado quando o principal é descontinuado ou fica fora do ar. |

**Conclusão:** a IA generativa entrega mais quando está dentro de um processo: entrada estruturada, etapas com papéis e técnicas de prompt escolhidas para cada tarefa, proteção de dados antes do modelo e uma pessoa com a palavra final. O assistente não substitui o colaborador. Ele tira o trabalho repetitivo de escrever e deixa com a pessoa o que exige julgamento.
