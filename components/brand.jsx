import Image from 'next/image'

export function Brand() {
  return (
    <span className="brand-lockup">
      <Image className="brand-symbol" src="/brand/roupzy-mark.svg" alt="" width={34} height={34} />
      <span className="brand-wordmark">ROUPZY</span>
    </span>
  )
}
