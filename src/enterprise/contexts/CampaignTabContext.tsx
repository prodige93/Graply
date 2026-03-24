import { createContext, useContext, useState, type ReactNode } from 'react';

export type EnterpriseCampaignTab = 'active' | 'paused' | 'saved' | 'drafts';

const CampaignTabContext = createContext<{
  tab: EnterpriseCampaignTab;
  setTab: (t: EnterpriseCampaignTab) => void;
}>({ tab: 'active', setTab: () => {} });

export function CampaignTabProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<EnterpriseCampaignTab>('active');
  return (
    <CampaignTabContext.Provider value={{ tab, setTab }}>
      {children}
    </CampaignTabContext.Provider>
  );
}

export function useCampaignTab() {
  return useContext(CampaignTabContext);
}
