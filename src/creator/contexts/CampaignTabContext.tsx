import { createContext, useContext, useState, type ReactNode } from 'react';

export type CampaignTab = 'active' | 'pending' | 'completed' | 'saved' | 'stats';

const CampaignTabContext = createContext<{
  tab: CampaignTab;
  setTab: (t: CampaignTab) => void;
}>({ tab: 'active', setTab: () => {} });

export function CampaignTabProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<CampaignTab>('active');
  return (
    <CampaignTabContext.Provider value={{ tab, setTab }}>
      {children}
    </CampaignTabContext.Provider>
  );
}

export function useCampaignTab() {
  return useContext(CampaignTabContext);
}
