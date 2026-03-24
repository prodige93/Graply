import { useState, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import EarthShowcase from '../components/EarthShowcase';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import PopularCampaigns from '../components/PopularCampaigns';
import CampaignSteps from '../components/CampaignSteps';
import FAQ from '../components/FAQ';
import RaisinVideo from '../components/RaisinVideo';
import ErrorBoundary from '../components/ErrorBoundary';
import HelpSidebar from '../components/HelpSidebar';
import Footer from '../components/Footer';

export default function LandingPage() {
  const [isMars, setIsMars] = useState(false);
  const handleToggle = useCallback(() => setIsMars((prev) => !prev), []);

  useEffect(() => {
    document.documentElement.classList.add('lp-page');
    return () => {
      document.documentElement.classList.remove('lp-page');
    };
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <Navbar isMars={isMars} />
      <ErrorBoundary>
        <Hero isMars={isMars} onToggle={handleToggle} />
      </ErrorBoundary>
      <HowItWorks isMars={isMars} />
      <PopularCampaigns isMars={isMars} />
      <ErrorBoundary>
        <EarthShowcase isMars={isMars} />
      </ErrorBoundary>
      <CampaignSteps isMars={isMars} />
      <FAQ isMars={isMars} />
      <ErrorBoundary>
        <RaisinVideo isMars={isMars} />
      </ErrorBoundary>
      <Footer isMars={isMars} />
      <HelpSidebar isMars={isMars} />
    </div>
  );
}
