import { LegalPage } from '@/components/legal-page'

export const metadata = {
  title: 'Termos de uso | Roupzy',
  description: 'Regras para uso do site Roupzy.'
}

export default function TermsPage() {
  return (
    <LegalPage kicker="INSTITUCIONAL / 02" title="Termos de uso" intro="As regras abaixo formam uma base clara para o uso responsável do Roupzy." updated="6 de setembro de 2026">
      <p className="legal-draft">Documento de produto em preparação. Ele deverá passar por revisão jurídica e receber os dados da entidade responsável antes de reger uma operação pública.</p>
      <h2>1. Aceite</h2><p>Ao acessar ou usar o Roupzy, a pessoa usuária declara que leu estas regras e que fornecerá informações verdadeiras, manterá seus dados de acesso protegidos e usará o site de forma lícita.</p>
      <h2>2. O serviço</h2><p>O Roupzy oferece ferramentas para registrar roupas, organizar informações e explorar combinações. Recursos, limites e disponibilidade podem evoluir conforme o serviço seja desenvolvido.</p>
      <h2>3. Recomendações</h2><p>As recomendações são sugestões baseadas nos dados disponíveis e não garantem adequação a medidas, clima, conforto, dress code ou preferências que não tenham sido informadas. A pessoa usuária deve revisar o resultado e decidir o que faz sentido vestir.</p>
      <h2>4. Conteúdo da pessoa usuária</h2><p>A pessoa usuária mantém seus direitos sobre fotos, textos e informações que inserir. Ela se responsabiliza por ter autorização para enviar o conteúdo e concede apenas a permissão necessária para que o Roupzy opere os recursos solicitados.</p>
      <h2>5. Uso proibido</h2><p>É proibido tentar acessar contas ou arquivos de terceiros, burlar limites, explorar vulnerabilidades, inserir código malicioso, usar o site para assédio ou fraude, ou interferir na disponibilidade e segurança da plataforma.</p>
      <h2>6. Planos e pagamentos</h2><p>Nenhum pagamento é considerado devido apenas por uma tela de planos ou por uma intenção de assinatura. Preços, limites, cancelamento e cobrança somente serão válidos quando publicados com uma integração de pagamento real e condições claras.</p>
      <h2>7. Encerramento</h2><p>A conta poderá ser encerrada pela pessoa usuária ou pela operação quando houver motivo legítimo, como solicitação do titular, violação destes termos ou necessidade de proteção da plataforma. Os procedimentos de exportação e exclusão serão informados em canal oficial.</p>
      <h2>8. Limitações</h2><p>O Roupzy será desenvolvido para ser confiável, mas serviços digitais podem sofrer indisponibilidade, manutenção ou falhas. Nada nestes termos elimina direitos que não possam ser afastados pela legislação aplicável.</p>
    </LegalPage>
  )
}
