export interface CreatorCampaign {
  id: string;
  name: string;
  brand: string;
  brandLogo: string;
  photo: string;
  thumb: string;
  platforms: string[];
  category: string;
  contentType: string;
  ratePerK: string;
  ratePerView: string;
  totalEarned: number;
  earned: string;
  budget: string;
  videosPosted: number;
  totalViews: number;
  views: number;
  creators: string;
  progress: number;
  status: 'active' | 'paused' | 'completed';
  joinedAt: string;
}

export interface PendingApplication {
  id: string;
  name: string;
  brand: string;
  brandLogo: string;
  photo: string;
  thumb: string;
  platforms: string[];
  category: string;
  ratePerK: string;
  appliedAt: string;
  applicantsCount: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface SubmittedVideo {
  id: string;
  campaignId: string;
  campaignName: string;
  brand: string;
  campaignPhoto: string;
  platform: string;
  videoUrl: string;
  submittedAt: string;
  status: 'in_review' | 'approved' | 'rejected';
}

type Listener = () => void;
const listeners = new Set<Listener>();

let creatorCampaigns: CreatorCampaign[] = [
  {
    id: 'pumpfun-launch',
    name: 'Pump.fun Launch Campaign',
    brand: 'Pump.fun',
    brandLogo: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['tiktok', 'youtube'],
    category: 'Crypto',
    contentType: 'UGC',
    ratePerK: '$1.25',
    ratePerView: '$1.25',
    totalEarned: 4275.39,
    earned: '$4,275.39',
    budget: '$7,500',
    videosPosted: 7,
    totalViews: 359300,
    views: 359300,
    creators: '1,053',
    progress: 57,
    status: 'active',
    joinedAt: '13 mars 2026',
  },
  {
    id: 'apple-iphone17-ugc',
    name: 'Apple — iPhone 17 Pro Max UGC',
    brand: 'Apple',
    brandLogo: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['tiktok', 'instagram'],
    category: 'Technologie',
    contentType: 'UGC',
    ratePerK: '$0.20',
    ratePerView: '$1.20',
    totalEarned: 96.40,
    earned: '$96.40',
    budget: '$25,000',
    videosPosted: 3,
    totalViews: 482000,
    views: 482000,
    creators: '2,841',
    progress: 17,
    status: 'active',
    joinedAt: '5 mars 2026',
  },
  {
    id: 'cod-bo7-clipping',
    name: 'Call of Duty BO7 Official Clipping',
    brand: 'Activision',
    brandLogo: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['tiktok', 'instagram'],
    category: 'Gaming',
    contentType: 'Clipping',
    ratePerK: '$0.18',
    ratePerView: '$1.00',
    totalEarned: 62.40,
    earned: '$62.40',
    budget: '$37,500',
    videosPosted: 2,
    totalViews: 312000,
    views: 312000,
    creators: '3,112',
    progress: 23,
    status: 'active',
    joinedAt: '8 mars 2026',
  },
  {
    id: 'nike-air-max-clipping',
    name: 'Nike Air Max Day - Best Clips',
    brand: 'Nike',
    brandLogo: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['tiktok', 'instagram', 'youtube'],
    category: 'Lifestyle',
    contentType: 'Clipping',
    ratePerK: '$0.80',
    ratePerView: '$1.80',
    totalEarned: 18940,
    earned: '$18,940.00',
    budget: '$35,000',
    videosPosted: 2,
    totalViews: 218000,
    views: 218000,
    creators: '2,000',
    progress: 95,
    status: 'completed',
    joinedAt: '12 jan 2026',
  },
  {
    id: 'samsung-galaxy-s25',
    name: 'Samsung Galaxy S25 Ultra - Créateurs',
    brand: 'Samsung',
    brandLogo: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['youtube', 'instagram', 'tiktok'],
    category: 'Technologie',
    contentType: 'UGC',
    ratePerK: '$1.50',
    ratePerView: '$3.00',
    totalEarned: 12300,
    earned: '$12,300.00',
    budget: '$75,000',
    videosPosted: 1,
    totalViews: 95000,
    views: 95000,
    creators: '890',
    progress: 82,
    status: 'completed',
    joinedAt: '3 fev 2026',
  },
];

let pendingApplications: PendingApplication[] = [
  {
    id: 'app-1',
    name: 'Nike Air Max 2026 — UGC Lifestyle',
    brand: 'Nike',
    brandLogo: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['instagram', 'tiktok'],
    category: 'UGC',
    ratePerK: '$0.22',
    appliedAt: '13 mars 2026',
    applicantsCount: 47,
    status: 'pending',
  },
  {
    id: 'app-2',
    name: 'Samsung Galaxy S25 — Unboxing',
    brand: 'Samsung',
    brandLogo: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['youtube', 'tiktok'],
    category: 'UGC',
    ratePerK: '$0.25',
    appliedAt: '14 mars 2026',
    applicantsCount: 83,
    status: 'pending',
  },
  {
    id: 'app-3',
    name: 'Pump.fun Launch Campaign',
    brand: 'Pump.fun',
    brandLogo: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['tiktok', 'youtube'],
    category: 'UGC',
    ratePerK: '$1.25',
    appliedAt: '10 mars 2026',
    applicantsCount: 312,
    status: 'accepted',
  },
  {
    id: 'app-4',
    name: 'Apple — iPhone 17 Pro Max UGC',
    brand: 'Apple',
    brandLogo: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['tiktok', 'instagram'],
    category: 'UGC',
    ratePerK: '$0.20',
    appliedAt: '2 mars 2026',
    applicantsCount: 1240,
    status: 'accepted',
  },
  {
    id: 'app-5',
    name: 'Adidas — Run the Future',
    brand: 'Adidas',
    brandLogo: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=100',
    photo: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600',
    thumb: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    platforms: ['instagram'],
    category: 'UGC',
    ratePerK: '$0.15',
    appliedAt: '28 fev 2026',
    applicantsCount: 890,
    status: 'rejected',
  },
];

let submittedVideos: SubmittedVideo[] = [
  {
    id: 'vid-1',
    campaignId: 'pumpfun-launch',
    campaignName: 'Pump.fun Launch Campaign',
    brand: 'Pump.fun',
    campaignPhoto: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400',
    platform: 'tiktok',
    videoUrl: 'https://www.tiktok.com/@user/video/123456789',
    submittedAt: '14 mars 2026',
    status: 'in_review',
  },
  {
    id: 'vid-2',
    campaignId: 'apple-iphone17-ugc',
    campaignName: 'Apple — iPhone 17 Pro Max UGC',
    brand: 'Apple',
    campaignPhoto: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
    platform: 'instagram',
    videoUrl: 'https://www.instagram.com/reel/abc123',
    submittedAt: '13 mars 2026',
    status: 'in_review',
  },
  {
    id: 'vid-3',
    campaignId: 'cod-bo7-clipping',
    campaignName: 'Call of Duty BO7 Official Clipping',
    brand: 'Activision',
    campaignPhoto: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=400',
    platform: 'tiktok',
    videoUrl: 'https://www.tiktok.com/@user/video/987654321',
    submittedAt: '12 mars 2026',
    status: 'in_review',
  },
  {
    id: 'vid-4',
    campaignId: 'nike-air-max-clipping',
    campaignName: 'Nike Air Max Day - Best Clips',
    brand: 'Nike',
    campaignPhoto: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    platform: 'instagram',
    videoUrl: 'https://www.instagram.com/reel/nike456',
    submittedAt: '8 mars 2026',
    status: 'approved',
  },
  {
    id: 'vid-5',
    campaignId: 'samsung-galaxy-s25',
    campaignName: 'Samsung Galaxy S25 Ultra - Créateurs',
    brand: 'Samsung',
    campaignPhoto: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    platform: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=samsung789',
    submittedAt: '5 mars 2026',
    status: 'rejected',
  },
];

function notify() {
  listeners.forEach((fn) => fn());
}

export function getCreatorCampaigns() {
  return creatorCampaigns;
}

export function getPendingApplications() {
  return pendingApplications;
}

export function getSubmittedVideos() {
  return submittedVideos;
}

export function getAllApplications() {
  return pendingApplications;
}

export function updateCreatorCampaign(id: string, updates: Partial<CreatorCampaign>) {
  creatorCampaigns = creatorCampaigns.map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  notify();
}

export function addCreatorCampaign(campaign: CreatorCampaign) {
  creatorCampaigns = [campaign, ...creatorCampaigns];
  notify();
}

export function removeCreatorCampaign(id: string) {
  creatorCampaigns = creatorCampaigns.filter((c) => c.id !== id);
  notify();
}

export function removeApplication(id: string) {
  pendingApplications = pendingApplications.filter((a) => a.id !== id);
  notify();
}

export function addSubmittedVideo(video: SubmittedVideo) {
  submittedVideos = [video, ...submittedVideos];
  notify();
}

export function removeSubmittedVideo(id: string) {
  submittedVideos = submittedVideos.filter((v) => v.id !== id);
  notify();
}

export function subscribeCreatorCampaigns(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
