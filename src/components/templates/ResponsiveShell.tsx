import type { ReactNode } from 'react'

type ResponsiveShellProps = {
  children: ReactNode
}

export function ResponsiveShell({ children }: ResponsiveShellProps) {
  return (
    <div className="min-h-screen w-full px-4 py-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      {children}
    </div>
  )
}
