import GrapeLoader from '@/creator/components/GrapeLoader';

/**
 * Chargement de routes lazy : garde un rail gauche (largeur proche des sidebars desktop)
 * pour éviter un plein écran vide sans structure, dans les deux apps.
 */
export default function AppShellFallback() {
  return (
    <div className="min-h-screen flex text-white overflow-hidden" style={{ background: '#050404' }}>
      <aside
        className="hidden lg:flex w-80 shrink-0 h-screen border-r border-white/[0.06]"
        style={{ background: 'rgba(8,8,12,0.96)' }}
        aria-hidden
      />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <div className="flex-1 flex items-center justify-center py-16">
          <GrapeLoader size="md" />
        </div>
      </div>
    </div>
  );
}
