import { useState, useEffect } from 'react';
import { Wifi, Cpu, Activity, Zap } from 'lucide-react';

export function StatusPanel() {
  const [time, setTime] = useState('');
  const [cpu, setCpu] = useState(45);
  const [memory, setMemory] = useState(62);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    const statusInterval = setInterval(() => {
      setCpu(Math.floor(Math.random() * 30) + 35);
      setMemory(Math.floor(Math.random() * 20) + 55);
    }, 2000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-20 p-3 md:p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2 md:space-y-3">
          <div className="bg-[#0a192f]/80 backdrop-blur-md border border-[#64ffda]/30 rounded-lg px-3 py-2 md:px-4 md:py-3 shadow-lg shadow-[#64ffda]/10">
            <div className="flex items-center gap-2 md:gap-3">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-[#64ffda] animate-pulse" />
              <div>
                <div className="text-[#64ffda] text-[10px] md:text-xs font-mono uppercase tracking-wider">
                  System Status
                </div>
                <div className="text-white font-mono text-base md:text-lg">{time}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0a192f]/80 backdrop-blur-md border border-[#64ffda]/30 rounded-lg px-3 py-2 md:px-4 md:py-3 shadow-lg shadow-[#64ffda]/10">
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 md:w-4 md:h-4 text-[#64ffda]" />
                <div className="w-16 md:w-20 h-2 bg-[#0a192f] rounded-full overflow-hidden border border-[#64ffda]/30">
                  <div 
                    className="h-full bg-[#64ffda] transition-all duration-500"
                    style={{ width: `${cpu}%` }}
                  />
                </div>
                <span className="text-[#64ffda] font-mono text-xs md:text-sm">{cpu}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-[#64ffda]" />
                <div className="w-16 md:w-20 h-2 bg-[#0a192f] rounded-full overflow-hidden border border-[#64ffda]/30">
                  <div 
                    className="h-full bg-[#64ffda] transition-all duration-500"
                    style={{ width: `${memory}%` }}
                  />
                </div>
                <span className="text-[#64ffda] font-mono text-xs md:text-sm">{memory}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0a192f]/80 backdrop-blur-md border border-[#64ffda]/30 rounded-lg px-3 py-2 md:px-4 md:py-3 shadow-lg shadow-[#64ffda]/10 hidden sm:block">
          <div className="flex items-center gap-2 md:gap-3">
            <Wifi className="w-4 h-4 md:w-5 md:h-5 text-[#64ffda]" />
            <div>
              <div className="text-[#64ffda] text-[10px] md:text-xs font-mono uppercase tracking-wider">
                Network
              </div>
              <div className="text-white font-mono text-xs md:text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse" />
                ONLINE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
