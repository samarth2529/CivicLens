import { Sparkles, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../common/Button';

interface HeaderProps {
  onReset: () => void;
  selectedPresetTitle?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ onReset, selectedPresetTitle }) => {
  return (
    <header className="border-b border-[#e3e8ee] bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#1a73e8] via-[#8e24aa] to-[#ea4335] p-[1.5px] flex items-center justify-center shrink-0 shadow-sm">
            <div className="h-full w-full bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#1a73e8]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg tracking-tight text-[#1f1f1f] font-sans">
                Civic<span className="gemini-blue-purple-text font-bold">Lens</span>
              </span>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#f0f4f9] text-[#444746] border border-[#e3e8ee]">
                Human-in-the-loop
              </span>
            </div>
          </div>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center space-x-3">
          {selectedPresetTitle ? (
            <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-[#b06000] bg-[#fef7e0] border border-[#feefc3] px-3 py-1.5 rounded-full">
              <Layers className="w-3.5 h-3.5 text-[#b06000] shrink-0" />
              <span className="truncate max-w-[220px]">Benchmark: {selectedPresetTitle}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2 text-xs text-[#5e5e5e] bg-[#f0f4f9] px-3.5 py-1.5 rounded-full border border-[#e3e8ee]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-[#1f1f1f]">Deterministic Engine Active</span>
              <span className="text-[#8e8e8e]">&bull;</span>
              <span className="text-[#5e5e5e]">Gemini 3.6 Flash</span>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            icon={<RefreshCw className="w-3.5 h-3.5 text-[#5e5e5e]" />}
          >
            <span className="hidden sm:inline">Start New Application</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
