import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GraplyCard from './GraplyCard';
import ViewsChart from './ViewsChart';
import PayoutsChart from './PayoutsChart';

export default function CampaignsMarquee() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#000',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '48px 32px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 65%)',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', right: '-8%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,120,42,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <button
        onClick={() => navigate('/lp')}
        style={{
          position: 'absolute',
          top: 28,
          left: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.45)',
          fontSize: 14,
          cursor: 'pointer',
          transition: 'color 0.2s ease',
          padding: 0,
          zIndex: 10,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
      >
        <ArrowLeft size={18} />
      </button>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 56, textAlign: 'center' as const }}>
          <h2 style={{
            fontSize: 'clamp(20px, 2.5vw, 32px)',
            fontWeight: 300,
            color: '#fff',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            marginBottom: 0,
            marginTop: 0,
            textShadow: 'none',
            whiteSpace: 'nowrap',
          }}>
            L'endroit où{' '}
            <span style={{
              color: '#A15EFF',
              textShadow: '0 0 30px rgba(161,94,255,1), 0 0 70px rgba(161,94,255,0.7), 0 0 140px rgba(161,94,255,0.4), 0 0 200px rgba(161,94,255,0.2)',
            }}>marques</span>{' '}
            et{' '}
            <span style={{
              color: '#FFA672',
              textShadow: '0 0 30px rgba(255,166,114,1), 0 0 70px rgba(255,166,114,0.7), 0 0 140px rgba(255,166,114,0.4), 0 0 200px rgba(255,166,114,0.2)',
            }}>créateurs</span>{' '}
            se rencontrent.
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
          position: 'relative',
        }}>
          <div style={{
            transform: 'rotateY(12deg) translateX(24px) scale(0.88)',
            transformOrigin: 'right center',
            transformStyle: 'preserve-3d',
            flex: '0 0 auto',
            width: 'clamp(200px, 22vw, 280px)',
            zIndex: 1,
            filter: 'brightness(0.7)',
            transition: 'all 0.4s ease',
            borderRadius: 20,
            overflow: 'hidden',
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = 'brightness(0.9)';
              el.style.transform = 'rotateY(6deg) translateX(12px) scale(0.93)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = 'brightness(0.7)';
              el.style.transform = 'rotateY(12deg) translateX(24px) scale(0.88)';
            }}
          >
            <PayoutsChart />
          </div>

          <div style={{
            flex: '0 0 auto',
            width: 'clamp(240px, 26vw, 300px)',
            zIndex: 10,
            position: 'relative',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            borderRadius: 20,
          }}>
            <GraplyCard />
          </div>

          <div style={{
            transform: 'rotateY(-12deg) translateX(-24px) scale(0.88)',
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            flex: '0 0 auto',
            width: 'clamp(200px, 22vw, 280px)',
            zIndex: 1,
            filter: 'brightness(0.7)',
            transition: 'all 0.4s ease',
            borderRadius: 20,
            overflow: 'hidden',
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = 'brightness(0.9)';
              el.style.transform = 'rotateY(-6deg) translateX(-12px) scale(0.93)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.filter = 'brightness(0.7)';
              el.style.transform = 'rotateY(-12deg) translateX(-24px) scale(0.88)';
            }}
          >
            <ViewsChart />
          </div>
        </div>

        <div style={{
          marginTop: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 120,
        }}>
          {[
            { label: 'Createurs actifs', value: '13K', plusColor: '#A15EFF', plusGlow: '0 0 8px rgba(161,94,255,0.8), 0 0 20px rgba(161,94,255,0.4)' },
            { label: 'Campagnes actives', value: '1000', plusColor: '#FFFFFF', plusGlow: '0 0 8px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4)' },
            { label: 'Verses aux createurs', value: '2M€', plusColor: '#FFA672', plusGlow: '0 0 8px rgba(255,166,114,0.8), 0 0 20px rgba(255,166,114,0.4)' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: 22, fontWeight: 700, color: stat.plusColor, textShadow: stat.plusGlow, lineHeight: 1 }}>+</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
