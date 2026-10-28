# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML, CSS e JavaScript puros no front; função Node (serverless) na Vercel em `api/`. Gerenciador de pacotes: pnpm. Sem framework.

## Users

Recepcionista ou gerente de uma academia de bairro, no computador do balcão, com a academia em movimento ao redor. Faz pedidos rápidos de texto entre um atendimento e outro: avisos, convites, mensagens de reativação, resumos de reunião.

## Product Purpose

Assistente corporativo de IA da Giz (rede fictícia de academias). Transforma um briefing curto (objetivo, público, canal, tom, informações) em uma comunicação pronta, padronizada no tom da marca. Sucesso: menos tempo escrevendo, textos consistentes e nenhuma publicação sem aprovação humana.

Projeto acadêmico ("Seu Primeiro Agente de IA"), também usado em vídeo pitch de até 4 minutos e no portfólio.

## Positioning

Não é um chat. É um agente em quatro etapas visíveis: proteção de dados (sem IA), triagem do pedido, escrita com guia de marca e revisão com checklist, antes da aprovação humana.

## Operating Context

- Uso principal em desktop, no balcão. Precisa funcionar no celular, mas sem ser o foco.
- Saídas para WhatsApp, Instagram e e-mail.
- Modelo: Google Gemini 3.5 Flash-Lite, chamado só pelo servidor (a chave nunca vai ao navegador).

## Capabilities and Constraints

- Entrada estruturada com opções validadas no servidor e texto livre de até 1.500 caracteres.
- Mascara CPF, telefone, e-mail e cartão antes de enviar à IA.
- Mostra o progresso de cada etapa em tempo real (streaming NDJSON).
- O texto gerado é editável e pode ser ajustado por follow-up; aprovar salva em um histórico local do navegador.
- Modo demonstração (`?demo`) funciona sem a IA.

## Brand Commitments

- Nome: Giz (rede fictícia de academias e nome do assistente). O nome brinca com o giz de levantamento e o giz de escrever no quadro.
- Voz: energética, acolhedora, sem julgamento de corpo, sem promessa de resultado, sem orientação de saúde.
- Fonte principal escolhida pela pessoa usuária: Oswald.
- Arte: SVGs e ícones; nunca imagens de pessoas.

## Evidence on Hand

Nenhum cliente, depoimento ou métrica real. Não inventar números de uso ou ganho.

## Product Principles

1. A pessoa decide: a IA sugere, e um humano aprova antes de publicar.
2. Mostrar o processo: cada etapa do agente aparece na tela.
3. Privacidade por padrão: dado pessoal é removido antes de sair do servidor.
4. Rápido no balcão: do briefing ao texto em poucos cliques, com exemplos prontos.

## Accessibility & Inclusion

Linguagem inclusiva sobre corpos. Contraste AA, foco visível e respeito a `prefers-reduced-motion`.
