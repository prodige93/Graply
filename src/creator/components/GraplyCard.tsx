import grapeYellowImg from '@/shared/assets/grape-yellow.png';
import timesSquarePromo from '@/shared/assets/times-square-promo.png';
import badgeEnterpriseVerified from '@/shared/assets/badge-enterprise-verified.png';

const VerifiedIcon = () => (
  <img src={badgeEnterpriseVerified} alt="verified" style={{ width: 21, height: 21, flexShrink: 0, objectFit: 'contain' }} />
);

export default function GraplyCard() {
  return (
    <div style={{
      borderRadius: 20,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'default',
      width: '100%',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 60px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)';
      }}
    >
      <div style={{
        position: 'relative',
        background: 'linear-gradient(160deg, #e8e0f0 0%, #d0c4e8 50%, #e4d8f4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        overflow: 'hidden',
        minHeight: 200,
      }}>
        <img
          src={timesSquarePromo}
          alt="Graply"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            inset: 0,
          }}
        />
      </div>

      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            overflow: 'hidden',
            border: '1.5px solid rgba(255,255,255,0.12)',
            flexShrink: 0,
          }}>
            <img
              src={grapeYellowImg}
              alt="Graply"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Graply</span>
            <VerifiedIcon />
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 500, flexShrink: 0 }}>
            2 week ago
          </span>
        </div>

        <h3 style={{
          fontSize: 15,
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          Graply booste vos ventes.
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{
            padding: '4px 11px',
            borderRadius: 9999,
            fontSize: 10,
            fontWeight: 700,
            background: 'linear-gradient(135deg, rgba(255,100,200,0.35) 0%, rgba(255,0,180,0.18) 50%, rgba(200,0,150,0.28) 100%)',
            border: '1px solid rgba(255,130,210,0.55)',
            color: '#ffffff',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: 'inset 0 1px 0 rgba(255,200,240,0.3), 0 0 10px rgba(255,0,180,0.2)',
            textShadow: '0 0 8px rgba(255,150,220,0.6)',
            letterSpacing: '0.03em',
            outline: '2px solid rgba(10,10,15,1)',
            zIndex: 3,
            position: 'relative' as const,
          }}>
            UGC
          </span>
          <span style={{
            padding: '4px 11px',
            borderRadius: 9999,
            fontSize: 10,
            fontWeight: 700,
            background: 'rgba(57,31,154,0.25)',
            border: '1px solid rgba(57,31,154,0.5)',
            color: '#ffffff',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.2)',
            letterSpacing: '0.03em',
            outline: '2px solid rgba(10,10,15,1)',
            marginLeft: -6,
            zIndex: 2,
            position: 'relative' as const,
          }}>
            Clipping
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 11px', borderRadius: 9999,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)',
            outline: '2px solid rgba(10,10,15,1)',
            marginLeft: -6,
            zIndex: 1,
            position: 'relative' as const,
          }}>
            <svg viewBox="0 0 16 16" style={{ width: 10, height: 10, fill: 'rgba(255,255,255,0.45)' }}>
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 6a5 5 0 0 0-10 0h10z"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>521</span>
          </div>
        </div>

        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.06)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>$7,240.89</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', fontWeight: 500, marginLeft: 3 }}>/$10,000</span>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: '5px 11px', borderRadius: 9999,
            background: 'linear-gradient(145deg, rgba(177,188,255,0.22) 0%, rgba(177,188,255,0.08) 50%, rgba(120,133,255,0.18) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(177,188,255,0.45)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(120,133,255,0.2) inset, 0 2px 8px rgba(177,188,255,0.15)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>$1.5</span>
            <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>/1K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
