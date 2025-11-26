import React, { useState, useEffect, useMemo, useRef } from 'react';
import { fetchUserInfo, fetchUserCollections } from './services/bangumiService';
import GridRow from './components/GridRow';
import StatsChart from './components/StatsChart';
import { BangumiUser, GroupedAnime, ChartDataPoint } from './types';
import { Info, Download, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';

const DEFAULT_USER_ID = '605976';
const DEFAULT_START_YEAR = 2006;

// Theme Configuration
const THEMES = {
  default: {
    name: '卫宫红',
    primary: '#FF2E36', // Red (High score)
    light: '#FFEBEB',   // Light Red (Mid score)
    bg: '#F0F0F0',
    button: 'bg-red-600 hover:bg-red-700',
    buttonText: 'text-white'
  },
  miku: {
    name: '未来青',
    primary: '#39C5BB', // Teal
    light: '#E0F2F1',   // Light Teal
    bg: '#E0F2F1',
    button: 'bg-[#39C5BB] hover:bg-[#2DA8A0]',
    buttonText: 'text-white'
  },
  sakura: {
    name: '波奇粉',
    primary: '#FFB7C5', // Pink
    light: '#FFF0F5',   // Light Pink
    bg: '#FFF0F5',
    button: 'bg-[#FF9EAC] hover:bg-[#FF8598]',
    buttonText: 'text-white'
  },
  eva: {
    name: '涅普紫',
    primary: '#9C27B0', // Purple
    light: '#F3E5F5',   // Light Purple
    bg: '#F3E5F5',
    button: 'bg-[#9C27B0] hover:bg-[#7B1FA2]',
    buttonText: 'text-white'
  },
  dark: {
    name: '死神黑',
    primary: '#333333', // Black
    light: '#E5E5E5',   // Light Gray
    bg: '#999999',
    button: 'bg-black hover:bg-gray-800',
    buttonText: 'text-white'
  }
};

type ThemeKey = keyof typeof THEMES;

const App: React.FC = () => {
  const [inputUserId, setInputUserId] = useState('');
  const [currentId, setCurrentId] = useState(DEFAULT_USER_ID);
  const [user, setUser] = useState<BangumiUser | null>(null);
  const [groupedAnime, setGroupedAnime] = useState<GroupedAnime>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('default');
  const [showInfoInExport, setShowInfoInExport] = useState(true);
  const [showChartInExport, setShowChartInExport] = useState(true);
  const [startYear, setStartYear] = useState<number>(DEFAULT_START_YEAR);

  // Ref for image export
  const exportRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[currentTheme];

  const yearsOfInterest = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Ensure start year is valid
    const validStart = startYear < 1980 ? 1980 : startYear;
    for (let y = validStart; y <= currentYear; y++) {
      years.push(y.toString());
    }
    return years;
  }, [startYear]);

  const fetchData = async (uid: string) => {
    setLoading(true);
    setError(null);
    setUser(null);
    setGroupedAnime({});
    setCurrentId(uid);

    try {
      const userInfo = await fetchUserInfo(uid);
      setUser(userInfo);
      
      const collections = await fetchUserCollections(uid);

      const grouped: GroupedAnime = {};
      yearsOfInterest.forEach(year => {
        grouped[year] = [];
      });

      collections.forEach(item => {
        const date = item.subject.date;
        if (date) {
          const year = date.split('-')[0];
          // Add to grouped if it's within our range, or if it exists in our pre-filled keys
          if (grouped[year]) {
            // Include user rating in the subject object
            grouped[year].push({ ...item.subject, user_rate: item.rate });
          } else if (parseInt(year) >= startYear) {
             grouped[year] = [{ ...item.subject, user_rate: item.rate }];
          }
        }
      });

      setGroupedAnime(grouped);

    } catch (err: any) {
      setError(err.message || '获取数据失败，请检查 ID 是否正确。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startYear]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUserId.trim()) {
      fetchData(inputUserId.trim());
    }
  };

  const handleSaveImage = async () => {
    if (exportRef.current) {
      try {
        const canvas = await html2canvas(exportRef.current, {
          useCORS: true,
          scale: 2, 
          backgroundColor: theme.bg,
          ignoreElements: (element) => {
            // Explicitly ignore the avatar image to prevent loading errors
            if (element.id === 'user-profile-avatar') return true;
            return element.classList.contains('no-export');
          }
        });
        const link = document.createElement('a');
        link.download = `anime-sedai-${currentId}-${currentTheme}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Export failed", err);
        alert("图片保存失败，请重试");
      }
    }
  };

  const chartData: ChartDataPoint[] = useMemo(() => {
    return yearsOfInterest.map(year => ({
      year,
      count: groupedAnime[year]?.length || 0
    }));
  }, [groupedAnime, yearsOfInterest]);

  const totalWatched = useMemo(() => {
    return Object.values(groupedAnime).reduce((acc: number, curr: any) => acc + curr.length, 0);
  }, [groupedAnime]);

  return (
    <div className="min-h-screen pb-20 transition-colors duration-500" style={{ backgroundColor: theme.bg }}>
      
      {/* Centered Input Section */}
      <div className="bg-white/95 backdrop-blur-md sticky top-0 z-[100] shadow-md border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
            
            {/* Row 1: Large Search Input */}
            <form onSubmit={handleSearch} className="w-full max-w-lg flex h-14 shadow-lg transform hover:scale-[1.01] transition-transform">
                <input
                    type="text"
                    value={inputUserId}
                    onChange={(e) => setInputUserId(e.target.value)}
                    placeholder="输入 bangumi ID"
                    className="flex-1 px-4 h-full text-lg font-bold bg-white border-2 border-black text-gray-900 focus:outline-none placeholder-gray-400 border-r-0 text-center"
                />
                <button 
                    type="submit"
                    disabled={loading}
                    className={`${theme.button} ${theme.buttonText} h-full px-8 font-black text-lg uppercase border-2 border-black transition-colors disabled:opacity-50 whitespace-nowrap`}
                >
                    {loading ? '...' : '加载'}
                </button>
            </form>

            {/* Row 2: Settings Controls */}
            <div className="flex gap-3 items-center h-10 w-full max-w-lg justify-center">
                    
                {/* Start Year */}
                <div className="flex items-center bg-white border-2 border-black px-2 h-full shadow-sm flex-1 justify-center" title="开始年份">
                    <span className="text-xs font-bold mr-2 text-gray-500 uppercase whitespace-nowrap">开始年份</span>
                    <input 
                        type="number" 
                        value={startYear}
                        onChange={(e) => setStartYear(Number(e.target.value))}
                        className="w-16 font-bold bg-transparent outline-none text-center h-full text-sm"
                        min="1980"
                        max={new Date().getFullYear()}
                    />
                </div>

                {/* Theme Selector */}
                <div className="relative group z-[60] h-full w-24">
                    <button className="w-full h-full bg-white border-2 border-black hover:bg-gray-50 flex items-center justify-center transition-colors gap-2" title="切换主题">
                        <Palette className="w-4 h-4" style={{ color: theme.primary }} />
                        <span className="text-xs font-bold">主题</span>
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 top-[100%] w-40 hidden group-hover:block pt-2">
                        <div className="absolute top-0 left-0 w-full h-2 bg-transparent"></div>
                        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {Object.entries(THEMES).map(([key, t]) => (
                                <button
                                    key={key}
                                    onClick={() => setCurrentTheme(key as ThemeKey)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 border-b border-gray-100 last:border-0"
                                >
                                    <div className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: t.primary }}></div>
                                    <span className="text-sm font-bold">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="relative group z-[60] h-full w-24">
                    <button className="w-full h-full bg-white border-2 border-black hover:bg-gray-50 flex items-center justify-center transition-colors gap-2" title="保存图片">
                        <Download className="w-4 h-4 text-black" />
                        <span className="text-xs font-bold">导出</span>
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 top-[100%] w-60 hidden group-hover:block pt-2">
                        <div className="absolute top-0 left-0 w-full h-2 bg-transparent"></div>
                        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                            <h4 className="font-bold mb-3 text-sm border-b pb-2">导出设置</h4>
                            <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input type="checkbox" checked={showInfoInExport} onChange={e => setShowInfoInExport(e.target.checked)} className="accent-black w-4 h-4" />
                                <span className="text-sm font-medium">包含用户信息</span>
                            </label>
                            <label className="flex items-center gap-2 mb-4 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input type="checkbox" checked={showChartInExport} onChange={e => setShowChartInExport(e.target.checked)} className="accent-black w-4 h-4" />
                                <span className="text-sm font-medium">包含统计图表</span>
                            </label>
                            <button 
                                onClick={handleSaveImage}
                                className="w-full bg-black text-white py-2.5 text-sm font-bold hover:bg-gray-800 transition-colors border-2 border-transparent hover:border-black hover:bg-white hover:text-black"
                            >
                                保存为图片
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-2 md:px-4 py-8">
        
        {/* Error State */}
        {error && (
            <div className="max-w-4xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 shadow-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
             <div className="space-y-4 animate-pulse max-w-7xl mx-auto mt-8">
                <div className="h-32 bg-gray-200 border-2 border-black"></div>
                {[1,2,3].map(i => (
                    <div key={i} className="h-40 bg-gray-200 w-full border border-gray-300"></div>
                ))}
             </div>
        )}

        {/* EXPORT WRAPPER */}
        {!loading && !error && Object.keys(groupedAnime).length > 0 && (
          <div ref={exportRef} className="p-4 md:p-8 pb-20" style={{ backgroundColor: theme.bg }}>
            
            {/* User Profile Summary */}
            {user && showInfoInExport && (
              <div id="user-profile-container" className="mb-8 flex flex-col md:flex-row items-center justify-between bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-6">
                   {/* Avatar */}
                   <img 
                     id="user-profile-avatar"
                     src={user.avatar.large} 
                     alt={user.nickname} 
                     className="w-20 h-20 md:w-24 md:h-24 border-2 border-black object-cover bg-gray-100"
                     referrerPolicy="no-referrer"
                   />
                   <div id="user-profile-text" className="flex flex-col">
                     <h1 id="user-profile-nickname" className="text-3xl md:text-4xl font-black uppercase tracking-tight">{user.nickname}</h1>
                     <p id="user-profile-id" className="text-gray-500 text-base font-mono mt-1 font-bold">ID: {user.id}</p>
                   </div>
                </div>
                <div className="mt-4 md:mt-0 font-bold flex items-center gap-2 text-lg" style={{ color: theme.primary }}>
                    <Info className="w-6 h-6" />
                    <span>共看过 {totalWatched} 部番剧 ({startYear} - {new Date().getFullYear()})</span>
                </div>
              </div>
            )}

            {/* The Grid */}
            <div className="flex flex-col border-t-2 border-l-2 border-r-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                {yearsOfInterest.map((year) => (
                <GridRow 
                    key={year} 
                    year={year} 
                    animeList={groupedAnime[year] || []} 
                    primaryColor={theme.primary}
                    lightColor={theme.light}
                />
                ))}
            </div>

            {/* Charts */}
            {totalWatched > 0 && showChartInExport && (
                <StatsChart data={chartData} color={theme.primary} />
            )}

          </div>
        )}

      </main>
    </div>
  );
};

export default App;