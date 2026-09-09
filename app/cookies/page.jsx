import { LegalPage } from '@/components/legal-page'

export const metadata = {
  title: 'Política de cookies | Roupzy',
  description: 'Como o Roupzy pretende usar cookies e tecnologias semelhantes.'
}

export default function CookiesPage() {
  return (
    <LegalPage kicker="INSTITUCIONAL / 03" title="Política de cookies" intro="Cookies são pequenos arquivos usados para lembrar preferências e apoiar o funcionamento de um site." updated="6 de setembro de 2026">
      <p className="legal-draft">Documento de produto em preparação. A versão final deverá refletir os cookies realmente instalados no navegador e as ferramentas efetivamente utilizadas.</p>
      <h2>1. Cookies necessários</h2><p>O site pode usar cookies estritamente necessários para manter uma sessão, proteger formulários, equilibrar tráfego e preservar preferências essenciais. Eles não devem ser usados para criar um perfil publicitário.</p>
      <h2>2. Medição e preferências</h2><p>Ferramentas de análise, publicidade ou personalização não devem ser ativadas sem que a finalidade, o fornecedor, o prazo e a forma de escolha sejam informados de maneira adequada.</p>
      <h2>3. Como controlar</h2><p>A maioria dos navegadores permite bloquear, apagar ou limitar cookies nas configurações. Bloquear cookies necessários pode impedir partes do site de funcionar corretamente.</p>
      <h2>4. Atualizações</h2><p>Esta política será atualizada sempre que novas tecnologias forem adicionadas ou removidas. O Roupzy deve manter uma lista atualizada do que estiver em operação.</p>
    </LegalPage>
  )
}
