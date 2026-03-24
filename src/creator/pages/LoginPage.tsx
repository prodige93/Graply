import RoleSelector from '../components/RoleSelector';
import CampaignsMarquee from '../components/CampaignsMarquee';
import HelpSidebar from '../components/HelpSidebar';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#000' }}>
      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        <CampaignsMarquee />
      </div>
      <div className="hidden md:block w-px flex-shrink-0 h-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
      <div className="w-full md:w-[42%] flex-shrink-0 h-full overflow-hidden">
        <RoleSelector />
      </div>
      <HelpSidebar isMars={false} />
    </div>
  );
}
