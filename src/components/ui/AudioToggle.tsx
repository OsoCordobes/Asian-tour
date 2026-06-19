import { useExperience } from '@/store/experience';

/**
 * Botón flotante de sonido. Si el gate no fue pasado, lo desbloquea; si ya hay
 * audio, alterna mute. Fallback para quien entró en silencio.
 */
export function AudioToggle() {
  const audioUnlocked = useExperience((s) => s.audioUnlocked);
  const muted = useExperience((s) => s.muted);
  const unlockAudio = useExperience((s) => s.unlockAudio);
  const toggleMute = useExperience((s) => s.toggleMute);

  const active = audioUnlocked && !muted;
  const label = !audioUnlocked ? 'Activar sonido' : muted ? 'Sonido apagado' : 'Sonido';

  return (
    <button
      data-cursor="hover"
      aria-label={label}
      title={label}
      onClick={() => (audioUnlocked ? toggleMute() : unlockAudio())}
      className="glass flex h-11 w-11 items-center justify-center rounded-full text-lg transition hover:brightness-125 active:scale-95"
    >
      <span aria-hidden>{active ? '🔊' : '🔇'}</span>
    </button>
  );
}
