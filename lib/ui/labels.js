const adminRoleLabels = {
  support: 'Suporte',
  manager: 'Gerente',
  owner: 'Proprietário'
}

const adminOutcomeLabels = {
  success: 'Sucesso',
  denied: 'Negado',
  failed: 'Falha'
}

const adminActionLabels = {
  create_plan: 'Criou um plano',
  update_plan: 'Atualizou um plano',
  create_feature_flag: 'Criou um recurso controlado',
  update_feature_flag: 'Atualizou um recurso controlado',
  create_system_setting: 'Criou uma configuração',
  update_system_setting: 'Atualizou uma configuração',
  update_contact_request: 'Atualizou um contato',
  update_feedback: 'Atualizou uma opinião',
  grant_admin_role: 'Concedeu uma função administrativa',
  revoke_admin_role: 'Removeu uma função administrativa',
  block_user: 'Bloqueou um usuário',
  unblock_user: 'Desbloqueou um usuário',
  delete_account: 'Excluiu uma conta'
}

const adminResourceLabels = {
  plan: 'plano',
  flag: 'recurso controlado',
  setting: 'configuração',
  contact: 'contato',
  feedback: 'opinião',
  user: 'usuário',
  ai: 'inteligência artificial',
  account: 'conta',
  clothing_item: 'peça',
  outfit: 'look',
  subscription: 'assinatura',
  media_asset: 'imagem',
  audit_log: 'registro de auditoria'
}

const adminStatusLabels = {
  new: 'Novo',
  in_progress: 'Em andamento',
  reviewing: 'Em análise',
  resolved: 'Resolvido',
  spam: 'Spam',
  archived: 'Arquivado'
}

const feedbackCategoryLabels = {
  product: 'Produto',
  look: 'Sugestão de look',
  bug: 'Problema',
  other: 'Outro assunto'
}

const environmentLabels = {
  production: 'Produção',
  staging: 'Homologação',
  development: 'Desenvolvimento'
}

const clothingCategoryLabels = {
  top: 'Parte de cima',
  bottom: 'Parte de baixo',
  one_piece: 'Peça única',
  outerwear: 'Terceira peça',
  shoe: 'Sapato',
  bag: 'Bolsa',
  accessory: 'Acessório',
  unknown: 'A confirmar'
}

const matchTypeLabels = {
  color: 'cor',
  silhouette: 'silhueta',
  layer: 'camada',
  texture: 'textura',
  occasion: 'ocasião',
  mixed: 'combinação de atributos'
}

const subscriptionStatusLabels = {
  active: 'Ativa',
  trialing: 'Em período de teste',
  past_due: 'Pagamento pendente',
  canceled: 'Cancelada',
  cancelled: 'Cancelada',
  unpaid: 'Pagamento não realizado',
  incomplete: 'Incompleta',
  incomplete_expired: 'Expirada',
  paused: 'Pausada'
}

const planCodeLabels = {
  free: 'Inicial',
  pro: 'Completo',
  team: 'Equipe'
}

function fallbackLabel(value, fallback = 'Não informado') {
  if (!value) return fallback
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function adminRoleLabel(value) {
  return adminRoleLabels[value] || fallbackLabel(value)
}

export function adminOutcomeLabel(value) {
  return adminOutcomeLabels[value] || fallbackLabel(value)
}

export function adminActionLabel(value) {
  return adminActionLabels[value] || fallbackLabel(value)
}

export function adminResourceLabel(value) {
  return adminResourceLabels[value] || fallbackLabel(value)
}

export function adminStatusLabel(value) {
  return adminStatusLabels[value] || fallbackLabel(value)
}

export function feedbackCategoryLabel(value) {
  return feedbackCategoryLabels[value] || fallbackLabel(value)
}

export function environmentLabel(value) {
  return environmentLabels[value] || fallbackLabel(value)
}

export function clothingCategoryLabel(value) {
  return clothingCategoryLabels[value] || fallbackLabel(value)
}

export function matchTypeLabel(value) {
  return matchTypeLabels[value] || fallbackLabel(value)
}

export function subscriptionStatusLabel(value) {
  return subscriptionStatusLabels[value] || fallbackLabel(value)
}

export function planCodeLabel(value) {
  return planCodeLabels[value] || fallbackLabel(value).toUpperCase()
}
