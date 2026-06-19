import type { ReactNode } from 'react';
import { useActiveSection } from '@/hooks/useActiveSection';

interface Props {
  id: string;
  onActive: (id: string) => void;
  align: 'left' | 'right';
  children: ReactNode;
}

/** Sección full-svh que reporta cuándo está activa (reemplaza el pin). */
export function DestinoSection({ id, onActive, align, children }: Props) {
  const ref = useActiveSection(id, onActive);
  return (
    <div
      ref={ref}
      className={`flex min-svh items-center px-6 py-24 md:px-16 ${
        align === 'right' ? 'justify-end' : 'justify-start'
      }`}
    >
      {children}
    </div>
  );
}
