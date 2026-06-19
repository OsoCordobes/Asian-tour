import { motion } from 'framer-motion';
import { CUBIC, STAGGER } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface Props {
  text: string;
  className?: string;
  /** Animar al entrar al viewport (true) o al montar (false). */
  whileInView?: boolean;
  delay?: number;
}

/** Tipografía cinética: las palabras suben con stagger y clip-reveal. */
export function KineticText({ text, className, whileInView = true, delay = 0 }: Props) {
  const words = text.split(' ');
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: STAGGER.tight, delayChildren: delay } },
  };
  const word = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration: 0.7, ease: CUBIC.land } },
  };
  return (
    <motion.span
      className={cn('inline-flex flex-wrap', className)}
      variants={container}
      initial="hidden"
      {...(whileInView
        ? { whileInView: 'show', viewport: { once: true, amount: 0.6 } }
        : { animate: 'show' })}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="mr-[0.25em] overflow-hidden py-[0.05em]" aria-hidden>
          <motion.span className="inline-block" variants={word}>
            {w}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
