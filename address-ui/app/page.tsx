"use client";
import { useState, useEffect } from "react";
import { 
  Bot, 
  Sparkles, 
  MapPin, 
  Building2,
  Map, 
  Home,
  Compass, 
  Route, 
  Grid, 
  Landmark, 
  Navigation,
  CheckCircle2,
  Activity,
  Cpu,
  Sun,
  Moon,
  Search,
  AlertTriangle
} from "lucide-react";

export default function HomePage() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleParse = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error parsing address:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (key: string) => {
    switch (key.toUpperCase()) {
      case "BUILDING": return <Building2 className="text-blue-500 dark:text-blue-400" size={20} />;
      case "UNIT": return <Home className="text-emerald-500 dark:text-emerald-400" size={20} />;
      case "BLOCK": return <Grid className="text-orange-500 dark:text-orange-400" size={20} />;
      case "STREET": return <Route className="text-pink-500 dark:text-pink-400" size={20} />;
      case "SOCIETY": return <Landmark className="text-purple-500 dark:text-purple-400" size={20} />;
      case "AREA": return <Map className="text-yellow-500 dark:text-yellow-400" size={20} />;
      case "TOWN": return <MapPin className="text-red-500 dark:text-red-400" size={20} />;
      case "CITY": return <Building2 className="text-cyan-500 dark:text-cyan-400" size={20} />;
      case "PROVINCE": return <Compass className="text-indigo-500 dark:text-indigo-400" size={20} />;
      case "LANDMARK": return <Navigation className="text-teal-500 dark:text-teal-400" size={20} />;
      default: return <MapPin className="text-slate-400" size={20} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Cpu size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">D Innovations</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Engine Online
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-10 mt-6 mb-12">
          
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 shadow-lg dark:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-colors duration-300">
              <Bot size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">
              AI Address Intelligence
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl text-lg transition-colors duration-300">
              Powered by a custom deep learning NER model. Enter a chaotic Roman Urdu address below.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto w-full space-y-3">
            <div className="relative group w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-20 dark:opacity-25 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all duration-300">
                <div className="pl-4 text-slate-400 dark:text-slate-500">
                  <Search size={22} />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleParse()}
                  placeholder="e.g. flat 444 building A falaknaz dreams malir..."
                  className="flex-1 px-4 py-4 bg-transparent focus:outline-none text-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  onClick={handleParse}
                  disabled={loading || !address.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Activity className="animate-pulse" size={20} />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span className="hidden sm:inline">Extract</span>
                      <kbd className="hidden sm:flex items-center justify-center px-2 py-1 text-[10px] font-bold font-mono text-indigo-100 bg-black/20 rounded border border-white/10 ml-2">
                        ↵ ENTER
                      </kbd>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <AlertTriangle size={14} className="opacity-80" />
              <span>AI models can make mistakes. Please verify the extracted data.</span>
            </div>
          </div>

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl flex items-start sm:items-center flex-col sm:flex-row gap-8 transition-colors duration-300">
                <div className="flex flex-col items-center shrink-0 gap-3">
                  <div className="flex items-center justify-center h-24 w-24 rounded-full border-4 border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{result.success_ratio}</span>
                  </div>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-300 font-bold tracking-widest uppercase">Confidence</span>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 size={18} />
                    <span>Standardized Output</span>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white tracking-wide leading-relaxed">
                    {result.formatted_address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(result.structured_address).map(([key, value]) => (
                  <div 
                    key={key} 
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-md hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col gap-3 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                        {getEntityIcon(key)}
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {key}
                      </span>
                    </div>
                    <span className="text-lg font-medium text-slate-800 dark:text-slate-100 capitalize">
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>
              
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 transition-colors duration-300 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} D Innovations. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
      
    </div>
  );
}