import LandingCampaignCard, { type LandingCampaignCardData } from './LandingCampaignCard';

const landingCampaigns: LandingCampaignCardData[] = [
  {
    image: '/imapoly.png',
    tags: ['UGC', 'Crypto'],
    timeAgo: '6 days ago',
    title: 'PolyMarket Clipping Campaign',
    brand: 'Polymarket',
    verified: true,
    socials: ['instagram', 'youtube', 'tiktok'],
    earned: '$1,261.71',
    budget: '$10,000',
    ratePerView: '$0.75',
    progress: 13,
    approval: '9%',
    views: '2.4M',
    creators: '94',
  },
  {
    image: '/imastake.png',
    tags: ['Clipping', 'Entertainment'],
    timeAgo: '1 week ago',
    title: 'Stake.com Official Clipping',
    brand: 'Stake',
    verified: true,
    socials: ['instagram', 'youtube', 'tiktok'],
    earned: '$8,146.56',
    budget: '$10,000',
    ratePerView: '$0.75',
    progress: 81,
    approval: '65%',
    views: '23.7M',
    creators: '613',
  },
  {
    image: '/imapump.png',
    tags: ['UGC', 'Crypto'],
    timeAgo: '2 days ago',
    title: 'Pump.fun Launch Campaign',
    brand: 'Pump.fun',
    verified: false,
    socials: ['tiktok', 'youtube'],
    earned: '$4,275.39',
    budget: '$7,500',
    ratePerView: '$1.25',
    progress: 57,
    approval: '18%',
    views: '359.3K',
    creators: '1,053',
  },
  {
    image: '/fffff.jpeg',
    tags: ['UGC', 'Crypto'],
    timeAgo: '14 hours ago',
    title: 'Phantom Wallet UGC Campaign',
    brand: 'Phantom',
    verified: true,
    socials: ['youtube', 'tiktok', 'instagram'],
    earned: '$275.53',
    budget: '$14,740',
    ratePerView: '$1.00',
    progress: 2,
    approval: '100%',
    views: '255.1K',
    creators: '150',
  },
  {
    image: '/cod.png',
    tags: ['Clipping', 'Gaming'],
    timeAgo: '3 weeks ago',
    title: 'Call of Duty BO7 Official Clipping Campaign',
    brand: 'Activision',
    verified: true,
    socials: ['tiktok', 'instagram'],
    earned: '$8,607.73',
    budget: '$37,500',
    ratePerView: '$1.00',
    progress: 23,
    approval: '12%',
    views: '6.0M',
    creators: '3,112',
  },
  {
    image: '/imafanta.png',
    tags: ['UGC', 'Produit'],
    timeAgo: '3 weeks ago',
    title: 'Fanta Summer UGC Challenge',
    brand: 'Fanta',
    verified: true,
    socials: ['instagram', 'tiktok'],
    earned: '$3,420.00',
    budget: '$15,000',
    ratePerView: '$2.00',
    progress: 23,
    approval: '34%',
    views: '1.7M',
    creators: '487',
  },
  {
    image: '/imawhoop.png',
    tags: ['Clipping', 'Fitness'],
    timeAgo: '5 days ago',
    title: 'WHOOP Athlete Clipping Campaign',
    brand: 'WHOOP',
    verified: true,
    socials: ['instagram', 'youtube', 'tiktok'],
    earned: '$5,890.12',
    budget: '$12,000',
    ratePerView: '$1.50',
    progress: 49,
    approval: '42%',
    views: '4.2M',
    creators: '312',
  },
  {
    image: '/imabose.png',
    tags: ['UGC', 'Produit'],
    timeAgo: '1 month ago',
    title: 'Bose QuietComfort UGC Campaign',
    brand: 'Bose',
    verified: true,
    socials: ['tiktok', 'instagram'],
    earned: '$6,150.00',
    budget: '$20,000',
    ratePerView: '$1.75',
    progress: 31,
    approval: '28%',
    views: '3.5M',
    creators: '728',
  },
];

function CampaignMarquee({
  items,
  direction = 'left',
}: {
  items: LandingCampaignCardData[];
  direction?: 'left' | 'right';
}) {
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex gap-4 sm:gap-6 ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        }`}
        style={{ width: 'max-content' }}
      >
        {duplicatedItems.map((campaign, i) => (
          <div key={i} className="w-[260px] sm:w-[340px] flex-shrink-0 h-[360px] sm:h-[420px]">
            <LandingCampaignCard data={campaign} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PopularCampaigns({ isMars = false }: { isMars?: boolean }) {
  const firstRow = landingCampaigns.slice(0, 4);
  const secondRow = landingCampaigns.slice(4, 8);

  return (
    <section id="marques" className="bg-black">
      <div className="bg-gray-50 pt-10 pb-24 rounded-b-[48px] sm:rounded-b-[72px]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-700 bg-gray-900 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-xs font-semibold text-white tracking-wide uppercase">
                Campagnes en cours
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              {isMars ? (
                <>
                  <span className="sm:hidden">Ils font déjà des<br />millions de vues</span>
                  <span className="hidden sm:inline">Des marques comme la vôtre<br />font déjà des millions de vues</span>
                </>
              ) : (
                'Decouvrez les campagnes du moment'
              )}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
              {isMars ? (
                <>
                  <span className="sm:hidden">Rejoignez-les et lancez<br />votre première campagne.</span>
                  <span className="hidden sm:inline">Rejoignez-les et lancez votre première campagne.</span>
                </>
              ) : (
                'Rejoignez les meilleures marques et commencez a creer.'
              )}
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-14">
          <CampaignMarquee items={firstRow} direction="left" />
          <CampaignMarquee items={secondRow} direction="right" />
        </div>

        <div className="flex justify-center px-6">
          <a href="#campaigns" className="relative group cursor-pointer select-none">
            <div
              className="absolute -inset-[7px] rounded-full pointer-events-none"
              style={{ border: '1.5px solid rgba(0,0,0,0.12)' }}
            />
            <div
              className="absolute -inset-[1.5px] rounded-full pointer-events-none"
              style={{ border: '1.5px solid rgba(0,0,0,0.2)' }}
            />
            <div
              className="relative rounded-full px-6 sm:px-8 py-2 sm:py-2.5 transition-all duration-300 group-hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(180deg, rgba(35,35,35,0.95) 0%, rgba(15,15,15,0.98) 50%, rgba(8,8,8,1) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.4)',
              }}
            >
              <span className="relative z-10 text-white font-semibold text-base sm:text-lg tracking-wide inline-flex items-center gap-1.5">
                Voir les campagnes
                <svg width="18" height="18" viewBox="0 0 14 14" fill="none" className="relative -top-px shrink-0">
                  <path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
