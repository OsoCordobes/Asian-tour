import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/** Imagen con blur-up: arranca borrosa/escala y entra nítida al cargar. */
export function BlurUpImage({ src, alt, className, ...rest }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn(
        'h-full w-full object-cover transition-all duration-700 ease-out',
        loaded ? 'scale-100 blur-0' : 'scale-105 blur-xl',
        className,
      )}
      {...rest}
    />
  );
}
