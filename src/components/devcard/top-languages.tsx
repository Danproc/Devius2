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
    { name: 'Shell', percentage: 5.1, color: '#89e051' },
    { name: 'Python', percentage: 5.6, color: '#3776ab' },
    { name: 'C++', percentage: 4.8, color: '#00599c' },
  ];

  const displayLanguages = languages || defaultLanguages;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-[#dde3ed]">
          Top Languages
        </h2>
        <p className="text-sm text-[#5b6a7f]">
          Detected from Repositories
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {displayLanguages.map((lang) => (
          <div key={lang.name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#dde3ed]">{lang.name}</span>
              <span className="text-[#5b6a7f]">{lang.percentage}%</span>
            </div>
            <div className="h-2 bg-[#121824] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
