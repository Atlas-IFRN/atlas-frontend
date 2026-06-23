# Componentes e responsividade

## Breakpoints oficiais

Os breakpoints oficiais da aplicacao ficam definidos em `tailwind.config.ts`:

| Token | Largura minima | Uso esperado |
| --- | --- | --- |
| `sm` | `640px` | Ajustes para celulares grandes e telas pequenas |
| `md` | `768px` | Tablets e layouts com mais espaco horizontal |
| `lg` | `1024px` | Desktop compacto |
| `xl` | `1280px` | Desktop amplo |

## Estrategia mobile-first

Os componentes devem ser implementados primeiro para a menor largura suportada. As classes sem prefixo representam o comportamento base mobile. Ajustes para telas maiores devem ser adicionados de forma progressiva com os prefixos `sm:`, `md:`, `lg:` e `xl:`.

Exemplo:

```tsx
<div className="px-4 py-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
  {children}
</div>
```

Nesse exemplo, o componente comeca com `px-4` no mobile e aumenta o padding horizontal conforme a largura da tela alcanca cada breakpoint oficial. O componente `ResponsiveShell`, em `src/components/templates/ResponsiveShell.tsx`, usa esse padrao como referencia.
