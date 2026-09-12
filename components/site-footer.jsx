import Link from 'next/link'
import { Brand } from './brand'

const footerGroups = [
  { title: 'Produto', links: [['/como-funciona', 'Como funciona'], ['/recursos', 'Recursos'], ['/planos', 'Planos'], ['/faq', 'Perguntas frequentes']] },
  { title: 'Roupzy', links: [['/sobre', 'A empresa'], ['/contato', 'Contato'], ['/login', 'Entrar'], ['/cadastro', 'Criar conta']] },
  { title: 'Confiança', links: [['/privacidade', 'Privacidade'], ['/termos', 'Termos de uso'], ['/cookies', 'Cookies']] }
]

export function SiteFooter() {
  return (
    <footer className="ri-footer rv-footer">
      <div className="ri-container ri-footer-lead rv-shell">
        <div><Brand /><p>Um espaço pessoal para organizar, combinar e redescobrir as roupas que já são suas.</p></div>
        <div className="ri-footer-invite rv-footer-invite"><span>ATUALIZAÇÕES DO ROUPZY</span><strong>Novidades com propósito,<br />{' '}sem ocupar seu armário.</strong><Link className="ri-footer-link" href="/contato">Quero acompanhar <span className="ri-arrow" aria-hidden="true" /></Link></div>
      </div>
      <div className="ri-container ri-footer-map rv-shell">
        {footerGroups.map((group) => <nav aria-label={group.title} key={group.title}><strong>{group.title}</strong>{group.links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>)}
        <div className="rv-footer-note"><span>ROUPZY / BRASIL</span><p>Moda pessoal com tecnologia discreta.</p></div>
      </div>
      <div className="ri-container rv-shell rv-footer-bottom"><span>© 2026 Roupzy</span><span>Feito para vestir a vida real.</span><a href="#top">Voltar ao início <span className="ri-arrow ri-arrow-up" aria-hidden="true" /></a></div>
    </footer>
  )
}
