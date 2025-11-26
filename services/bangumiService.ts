import { BangumiCollectionItem, BangumiUser } from '../types';

const BGM_API_BASE = 'https://api.bgm.tv/v0';

// Headers for Bangumi API
// Note: In production, you should include a valid User-Agent as per Bangumi policy.
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'AnimeSedaiGrid/1.0 (demo-app)',
};

export const fetchUserInfo = async (username: string): Promise<BangumiUser> => {
  const response = await fetch(`${BGM_API_BASE}/users/${username}`, {
    headers: HEADERS,
  });
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
};

export const fetchUserCollections = async (username: string): Promise<BangumiCollectionItem[]> => {
  // Fetching watched anime (subject_type=2, type=2)
  // Limitation: Pagination. For this demo, we fetch the first 300 items to keep it responsive.
  // A full app would handle pagination recursively.
  const limit = 100;
  let allItems: BangumiCollectionItem[] = [];
  
  // Fetch 3 pages to get a good dataset (300 items)
  // Note: Standard API rate limits apply.
  const fetchPage = async (offset: number) => {
    const params = new URLSearchParams({
        subject_type: '2', // Anime
        type: '2', // Watched
        limit: limit.toString(),
        offset: offset.toString(),
    });
    
    const response = await fetch(`${BGM_API_BASE}/users/${username}/collections?${params.toString()}`, {
        headers: HEADERS,
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  };

  const page1 = await fetchPage(0);
  allItems = [...page1];

  // If the user has a lot, try to fetch a bit more for a better grid
  if (page1.length === limit) {
     const page2 = await fetchPage(limit);
     allItems = [...allItems, ...page2];
     if (page2.length === limit) {
         const page3 = await fetchPage(limit * 2);
         allItems = [...allItems, ...page3];
     }
  }

  return allItems;
};
