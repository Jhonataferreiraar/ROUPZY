import Image from 'next/image'

export function BrandMark({ className = 'brand-mark', size = 48, alt = '' }) {
  return <Image className={className} src="/brand/roupzy-mark.svg" alt={alt} width={size} height={size} />
}

export function Brand() {
  return (
    <span className="brand-lockup">
      <BrandMark className="brand-symbol" size={34} />
      <span className="brand-wordmark">ROUPZY</span>
    </span>
  )
}
