# SaaS, planos e billing — Roupzy

Status: tabelas, limites e contrato de billing implementados. Checkout e cobrança dependem de um adaptador de provedor real.

## Modelo comercial

O produto começa com uma arquitetura de planos configuráveis. A página pública só exibe plano, preço, moeda, intervalo e benefícios provenientes de configuração publicada. Não haverá “pagamento concluído” sem retorno verificado de um gateway real.

O candidato operacional inicial é Mercado Pago por adequação ao público brasileiro; a interface permanece neutra para permitir Stripe. A escolha final depende de conta, taxas, recorrência, disponibilidade regional, requisitos de webhook e aprovação comercial.

## Entitlements

Código de plano e capacidade são coisas diferentes. `plans` descreve o catálogo; `subscriptions` espelha o gateway; `entitlements` representa o que a conta pode fazer agora.

Capacidades iniciais possíveis:

- quantidade máxima de peças ativas;
- análises de peça por ciclo;
- análises de inspiração por ciclo;
- gerações de look por ciclo;
- histórico e estatísticas avançadas;
- exportação e recursos futuros.

Um caso de uso consulta entitlement no servidor. O cliente pode mostrar estado estimado para a experiência, mas não concede acesso. O consumo é reservado atomicamente para impedir que duas requisições ultrapassem a quota.

## Estados de assinatura

Os estados externos são normalizados para `trialing`, `active`, `past_due`, `canceled`, `incomplete`, `paused` e `unknown`. A política de produto define quais capacidades permanecem durante carência, cancelamento e falha. O estado local nunca pode ser alterado por payload do navegador.

## Webhooks

O endpoint preserva o corpo necessário para validar assinatura, rejeita eventos sem autenticação, registra `provider + external_event_id` de forma única e processa cada evento em transação idempotente. Eventos fora de ordem usam `occurred_at` e versão do recurso quando o provedor fornecer.

Cada transição relevante gera `billing_events` e `audit_logs` sem guardar secrets. Reprocessamento é explícito, limitado e observável.

## Admin

Admin pode editar nome, descrição, limites e status de publicação por allowlist. Alteração de preço, moeda, período, entitlement ou configuração global exige papel adequado, confirmação no produto e auditoria. A área não recebe uma API key completa do gateway.

## Métricas reais

Medir somente eventos existentes: contas ativas, peças adicionadas, análises concluídas/falhas, gerações válidas, quota negada, conversão do gateway, churn conforme dados reais e custo de IA registrado. Dados de demonstração devem ser identificados e nunca misturados à produção.
