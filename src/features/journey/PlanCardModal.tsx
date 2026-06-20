import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { PlanCard as PlanCardT } from '@/types';
import { BlurUpImage } from '@/components/fx/BlurUpImage';
import { CUBIC } from '@/lib/motion';
import { CATEGORIA_META } from './PlanCard';

interface Props {
  plan: PlanCardT;
  destinoId: string;
  onClose: () => void;
}

/** Vista ampliada de un plan: foto en alta + descripción + acceso al planeo. */
export function PlanCardModal({ plan, destinoId, onClose }: Props) {
  const meta = CATEGORIA_META[plan.categoria];
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Una imagen de mayor resolución para la vista grande.
  const bigImg = plan.img.replace(/w=\d+/, 'w=1600');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
      <motion.div
        className="absolute inset-0 bg-obsidian/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        layoutId={`plan-img-${plan.id}`}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl"
        transition={{ ease: CUBIC.land, duration: 0.5 }}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <BlurUpImage src={bigImg} alt={plan.titulo} />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-obsidian/60 text-white/80 backdrop-blur-sm transition hover:text-white"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-obsidian/60 px-3 py-1 text-xs uppercase tracking-wider text-white/85 backdrop-blur-sm">
              <span aria-hidden>{meta.icon}</span>
              {meta.label}
            </span>
            <h3 className="mt-2 font-display text-2xl text-white sm:text-3xl">{plan.titulo}</h3>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="glass grain space-y-4 p-5"
        >
          <p className="font-sans text-sm leading-relaxed text-white/75">{plan.blurb}</p>
          <button
            type="button"
            data-cursor="hover"
            onClick={() => navigate(`/viaje/${slug}/planeo?destino=${destinoId}`)}
            className="neon-border w-full rounded-xl py-2.5 text-sm font-medium uppercase tracking-wider transition hover:brightness-125 active:scale-[0.98]"
          >
            Anotar esto en el planeo
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
