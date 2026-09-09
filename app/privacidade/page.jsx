import { LegalPage } from '@/components/legal-page'

export const metadata = {
  title: 'Política de privacidade | Roupzy',
  description: 'Como o Roupzy trata informações pessoais, imagens e preferências.'
}

export default function PrivacyPage() {
  return (
    <LegalPage kicker="INSTITUCIONAL / 01" title="Política de privacidade" intro="Esta página explica, em linguagem simples, quais dados o Roupzy pretende tratar e para quais finalidades." updated="6 de setembro de 2026">
      <p className="legal-draft">Documento de produto em preparação. Antes da abertura pública, este texto deverá ser revisado e complementado com a identificação jurídica da entidade responsável, canais oficiais e demais informações exigidas pela legislação aplicável.</p>
      <h2>1. O que o Roupzy faz</h2><p>O Roupzy é uma plataforma web de organização e descoberta de estilo pessoal. A pessoa usuária pode registrar peças, revisar atributos sugeridos, guardar preferências e receber combinações com base no próprio closet.</p>
      <h2>2. Dados tratados</h2><p>Dependendo do uso, poderão ser tratados dados de cadastro e autenticação, informações inseridas no perfil, fotografias de peças, atributos das roupas, preferências, feedbacks, histórico de uso, solicitações de suporte e registros técnicos necessários à segurança e ao funcionamento do site.</p>
      <h2>3. Finalidades</h2><p>Os dados são tratados para criar e proteger a conta, organizar o closet, gerar recomendações solicitadas pela pessoa usuária, melhorar a experiência, atender solicitações, prevenir abuso e cumprir obrigações legais. Qualquer uso de imagem ou dado para uma finalidade nova deverá ser informado de forma adequada.</p>
      <h2>4. Imagens e inteligência artificial</h2><p>As imagens enviadas para análise devem ser usadas para a finalidade solicitada. O Roupzy deve manter controles para que resultados de IA sejam tratados como sugestões, possam ser corrigidos e não sejam apresentados como certezas quando houver incerteza.</p>
      <h2>5. Compartilhamento</h2><p>O compartilhamento deverá se limitar a fornecedores necessários ao funcionamento da plataforma, como infraestrutura, armazenamento, autenticação e processamento de IA, sempre com medidas de segurança e contratos compatíveis. O Roupzy não deve vender imagens do closet ou credenciais de acesso.</p>
      <h2>6. Segurança e retenção</h2><p>A plataforma deve aplicar controle de acesso, isolamento entre contas, armazenamento privado e registros de auditoria compatíveis com o risco. Os dados devem ser mantidos pelo tempo necessário às finalidades informadas ou às obrigações aplicáveis.</p>
      <h2>7. Direitos da pessoa usuária</h2><p>Conforme a legislação aplicável, a pessoa usuária poderá solicitar confirmação, acesso, correção, informação sobre uso, eliminação quando cabível e revisão de decisões automatizadas. Os canais e prazos oficiais serão publicados antes do lançamento.</p>
      <h2>8. Alterações</h2><p>Esta política poderá ser atualizada para refletir mudanças reais no site. A versão vigente deverá indicar a data da atualização e ser apresentada de maneira acessível.</p>
    </LegalPage>
  )
}
