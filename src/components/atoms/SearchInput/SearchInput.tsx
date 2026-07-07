import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import './SearchInput.css'

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
>

export function SearchInput({
  className,
  'aria-label': ariaLabel = 'Buscar',
  ...props
}: SearchInputProps) {
  const searchClassName = ['atlas-search-input', className]
    .filter(Boolean)
    .join(' ')

  return (
    <label className={searchClassName}>
      <Search className="atlas-search-input__icon" aria-hidden="true" />
      <input
        {...props}
        aria-label={ariaLabel}
        className="atlas-search-input__field"
        type="search"
      />
    </label>
  )
}
