import React from 'react';
import { BangumiSubject } from '../types';

interface GridRowProps {
  year: string;
  animeList: BangumiSubject[];
  primaryColor: string;
  lightColor: string;
}

const GridRow: React.FC<GridRowProps> = ({ year, animeList, primaryColor, lightColor }) => {
  
  // Helper to determine background color based on rating
  const getStyleForAnime = (rating?: number) => {
    // Default / No rating / 1-5: White
    if (!rating || rating <= 5) {
      return { 
        backgroundColor: '#ffffff', 
        color: '#1f2937' // gray-800
      };
    }
    // 6-8: Light Theme Color
    if (rating >= 6 && rating <= 8) {
      return { 
        backgroundColor: lightColor, 
        color: '#1f2937' // gray-800
      };
    }
    // 9-10: Dark Theme Color
    if (rating >= 9) {
      return { 
        backgroundColor: primaryColor, 
        color: '#ffffff' // White text for contrast on dark bg
      };
    }
    return { backgroundColor: '#ffffff', color: '#1f2937' };
  };

  return (
    <div className="relative flex w-full items-stretch">
      {/* Absolute bottom border overlay to cover cell borders */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black z-10 pointer-events-none" />

      {/* Year Column */}
      <div 
        className="relative w-28 md:w-32 text-white flex flex-col items-center justify-center shrink-0 border-r-2 border-black px-1"
        style={{ backgroundColor: primaryColor }}
      >
        <span className="text-xl md:text-3xl font-black tracking-tighter drop-shadow-sm z-20 relative text-center">
          {year}
        </span>
      </div>

      {/* Anime Cells */}
      <div className="flex-1 flex flex-wrap bg-white content-start min-w-0 w-full">
        {animeList.length > 0 ? (
          animeList.map((anime) => {
            const style = getStyleForAnime(anime.user_rate);
            return (
              <div
                key={anime.id}
                className="group relative w-1/2 sm:w-1/3 md:w-1/4 lg:w-[12.5%] xl:w-[10%] border-r border-b border-gray-200 flex flex-col items-center justify-start p-2 hover:brightness-95 transition-[filter] box-border"
                style={{ backgroundColor: style.backgroundColor }}
                title={`${anime.name_cn || anime.name} (评分: ${anime.user_rate || '-'})`}
              >
                {/* Text Container */}
                <div 
                  className="text-xs md:text-sm font-medium text-center break-words w-full h-full min-h-[2.5rem] flex items-center justify-center leading-tight py-1"
                  style={{ color: style.color }}
                >
                  {anime.name_cn || anime.name}
                </div>
                
                {/* Tooltip with Image on Hover */}
                <div className="absolute z-[150] bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-black text-white p-2 rounded text-xs w-32 shadow-xl pointer-events-none">
                  <img 
                      src={anime.images?.common || anime.images?.medium || anime.images?.small} 
                      alt={anime.name} 
                      className="w-full h-auto mb-1 rounded-sm bg-gray-800"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                  />
                  <span>{anime.name}</span>
                  {anime.user_rate && <span className="mt-1 font-bold text-yellow-400">★ {anime.user_rate}</span>}
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full min-h-[100px] flex items-center justify-center text-gray-300 italic p-4 text-sm">
            本年度无记录
          </div>
        )}
      </div>
    </div>
  );
};

export default GridRow;