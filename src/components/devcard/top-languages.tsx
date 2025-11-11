interface LanguageStats {
  name: string;
  percentage: number;
  color: string;
}

interface TopLanguagesProps {
  languages?: LanguageStats[];
}

export function TopLanguages({ languages }: TopLanguagesProps) {
  // Default language data matching the mockup
  const defaultLanguages: LanguageStats[] = [
    { name: 'TypeScript', percentage: 65.5, color: '#3178c6' },
    { name: 'Javascript', percentage: 12.2, color: '#f7df1e' },
    { name: 'Shell', percentage: 6.1, color: '#89e051' },
    { name: 'Python', percentage: 5.6, color: '#3776ab' },
    { name: 'C++', percentage: 4.8, color: '#00599c' },
  ];

  const displayLanguages = languages || defaultLanguages;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium text-[#dde3ed]">
          Top Languages
        </h2>
        <p className="text-sm text-[#5b6a7f]">
          Detected from repositories
        </p>
      </div>

      {/* Language pills with colored dots - arranged in rows */}
      <div className="flex flex-wrap gap-3">
        {displayLanguages.map((lang) => (
          <div key={lang.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-[#dde3ed]">{lang.name}</span>
            <span className="text-[#5b6a7f]">{lang.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
