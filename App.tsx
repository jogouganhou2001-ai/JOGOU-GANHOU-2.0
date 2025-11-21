
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewState, DrawStats, UserProfile, Report } from './types';
import { TICKET_PRICE, INITIAL_PRIZE, PRIZE_PERCENTAGE, MOCK_WINNERS, TRANSPARENCY_REPORTS } from './constants';
import { Navbar } from './components/Navbar';
import { Button } from './components/Button';
import { 
  Trophy, CheckCircle2, Info, Gift, Share2, Copy, Star, Bell, FileText, Megaphone, TrendingUp,
  Activity, Sparkles, Zap, Dices, Check, Lock, Mail, ArrowRight, LogOut, Upload, Image, X
} from './components/Icons';
import { getPrizeDream, getTransparencyExplanation, getReportSummary } from './services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- Visual Effects Components ---

const MoneyRain = () => {
  const [particles, setParticles] = useState<Array<{id: number, left: string, duration: string, delay: string, size: string}>>([]);

  useEffect(() => {
    // Create fewer particles for better performance but enough for vibe
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 5 + 5}s`,
      delay: `${Math.random() * 5}s`,
      size: `${Math.random() * 1.5 + 0.5}rem`
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      {particles.map(p => (
        <div 
          key={p.id}
          className="money-particle absolute text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            fontSize: p.size
          }}
        >
          $
        </div>
      ))}
    </div>
  );
};

const WinnerMarquee = () => {
    const winners = [
        "🔥 Carlos S. acabou de ganhar R$ 1.250!",
        "💰 Maria P. sacou R$ 500 agora!",
        "🚀 João L. entrou no sorteio!",
        "💎 Ana B. ganhou 5 tickets grátis!",
        "🔥 Pedro H. está concorrendo ao Jackpot!",
    ];

    return (
        <div className="bg-gradient-to-r from-black via-yellow-900/80 to-black border-b border-yellow-600/30 py-1 overflow-hidden relative z-50 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            <div className="animate-marquee whitespace-nowrap flex gap-8 text-xs font-bold text-yellow-400 uppercase tracking-wider items-center">
                {winners.map((w, i) => (
                    <span key={i} className="flex items-center gap-2">
                        <Sparkles size={10} className="text-white animate-pulse" /> {w}
                    </span>
                ))}
                {/* Duplicate for smooth loop */}
                {winners.map((w, i) => (
                    <span key={`dup-${i}`} className="flex items-center gap-2">
                        <Sparkles size={10} className="text-white animate-pulse" /> {w}
                    </span>
                ))}
            </div>
        </div>
    );
};

// --- Treasure Chest Component ---

interface TreasureChestProps {
  fillPercentage: number;
  isExploding: boolean;
}

const TreasureChest: React.FC<TreasureChestProps> = ({ fillPercentage, isExploding }) => {
  // Clamp percentage between 0 and 100
  const fill = Math.min(Math.max(fillPercentage, 0), 100);
  
  // Calculate coin height inside chest (svg coordinates)
  // Chest body interior is approx y=40 to y=80. Height is 40 units.
  // We want fill to go from y=80 (empty) to y=40 (full).
  const liquidHeight = 80 - (fill * 0.4);
  
  // Tension shake intensity based on fill
  const shakeClass = fill > 80 ? 'animate-[shake_0.2s_infinite]' : fill > 50 ? 'animate-[shake_1s_infinite]' : '';

  return (
    <div className={`relative w-56 h-56 mx-auto transition-all duration-200 ${isExploding ? 'scale-125' : 'scale-100'} ${shakeClass}`}>
      
      {/* Explosive Flash */}
      <div className={`absolute inset-0 bg-white/80 rounded-full blur-2xl transition-opacity duration-75 ${isExploding ? 'opacity-100' : 'opacity-0'} z-50 pointer-events-none`}></div>

      {/* Ambient Glow */}
      <div className={`absolute inset-0 bg-yellow-500/20 blur-[50px] rounded-full transition-all duration-300 ${isExploding ? 'opacity-100 scale-150 bg-yellow-400/40' : 'opacity-50'}`}></div>
      
      {/* Exploding Coins Particles */}
      {isExploding && (
         <>
            {[...Array(12)].map((_, i) => (
              <div key={i} 
                className="absolute top-1/2 left-1/2 w-6 h-6 bg-gradient-to-br from-yellow-200 to-yellow-600 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)] border border-white/50"
                style={{
                  transform: `translate(-50%, -50%)`,
                  animation: `flyOut-${i} 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards`
                }}
              >
                <style>{`
                  @keyframes flyOut-${i} {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                    100% { transform: translate(calc(-50% + ${(Math.random() - 0.5) * 300}px), calc(-50% + ${(Math.random() - 0.5) * 300}px)) scale(1.2) rotate(${Math.random() * 720}deg); opacity: 0; }
                  }
                `}</style>
              </div>
            ))}
         </>
      )}

      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] overflow-visible">
        <defs>
           <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#fef9c3" /> {/* Very light yellow */}
             <stop offset="30%" stopColor="#facc15" />
             <stop offset="70%" stopColor="#ca8a04" />
             <stop offset="100%" stopColor="#854d0e" />
           </linearGradient>
           
           <linearGradient id="shinyGold" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" stopColor="#ca8a04" />
             <stop offset="40%" stopColor="#fef08a" /> {/* Highlight band */}
             <stop offset="60%" stopColor="#eab308" />
             <stop offset="100%" stopColor="#a16207" />
           </linearGradient>

           <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur stdDeviation="2" result="blur" />
             <feComposite in="SourceGraphic" in2="blur" operator="over" />
           </filter>
           
           <mask id="chestMask">
             <path d="M10,40 Q10,90 50,95 Q90,90 90,40 Z" fill="white" />
           </mask>
        </defs>

        {/* --- Falling Coins Animation (Into Chest) --- */}
        {!isExploding && (
           <g opacity="0.8">
             {[...Array(3)].map((_, i) => (
               <circle key={i} r="3" fill="#fef08a" className="drop-shadow-md">
                 <animate 
                   attributeName="cy" 
                   from="0" 
                   to="60" 
                   dur={`${0.6 + i * 0.2}s`} 
                   repeatCount="indefinite" 
                   begin={`${i * 0.3}s`}
                 />
                 <animate 
                   attributeName="cx" 
                   values={`${40 + i * 10};${45 + i * 10};${40 + i * 10}`}
                   dur="2s" 
                   repeatCount="indefinite"
                 />
                 <animate attributeName="opacity" values="0;1;0" dur={`${0.6 + i * 0.2}s`} repeatCount="indefinite" />
               </circle>
             ))}
           </g>
        )}

        {/* Chest Base Background (Back) */}
        <path d="M10,35 Q10,90 50,95 Q90,90 90,35 L90,35 Z" fill="#451a03" stroke="#78350f" strokeWidth="2" />

        {/* Coins Filling - Animated */}
        <g mask="url(#chestMask)">
           <rect x="0" y="0" width="100" height="100" fill="#290b03" /> {/* Dark inside */}
           
           {/* The Coins Liquid */}
           <rect 
             x="0" 
             y={liquidHeight} 
             width="100" 
             height="100" 
             fill="url(#goldGradient)"
             className="transition-all duration-1000 ease-out"
           />
           
           {/* Sparkling Surface */}
           <g transform={`translate(0, ${liquidHeight})`}>
             <circle cx="20" cy="5" r="4" fill="url(#shinyGold)" opacity="0.8" />
             <circle cx="40" cy="2" r="5" fill="url(#shinyGold)" />
             <circle cx="60" cy="6" r="3" fill="url(#shinyGold)" opacity="0.9" />
             <circle cx="80" cy="3" r="4" fill="url(#shinyGold)" />
             {/* Sparkles on surface */}
             <path d="M30,0 L32,5 L30,10 L28,5 Z" fill="white" className="animate-spin" style={{transformBox: 'fill-box', transformOrigin: 'center'}} />
             <path d="M70,5 L72,10 L70,15 L68,10 Z" fill="white" className="animate-spin" style={{transformBox: 'fill-box', transformOrigin: 'center', animationDuration: '2s'}} />
           </g>
        </g>

        {/* Chest Front Bands (Glossy) */}
        <path d="M10,35 Q10,90 50,95 Q90,90 90,35" fill="none" stroke="url(#shinyGold)" strokeWidth="5" filter="url(#glow)" />
        <path d="M50,35 L50,95" stroke="url(#shinyGold)" strokeWidth="10" />
        
        {/* Keyhole */}
        <circle cx="50" cy="55" r="7" fill="#171717" stroke="#facc15" strokeWidth="2" />
        <path d="M50,52 L50,58" stroke="#facc15" strokeWidth="2" />

        {/* Chest Lid (Top) - Animates open dramtically */}
        <g className={`transition-all duration-200 origin-bottom ${isExploding ? '-rotate-45 -translate-y-6' : 'rotate-0'}`} style={{ transformOrigin: '50% 35%' }}>
           {/* Lid Shape */}
           <path d="M5,35 Q50,5 95,35" fill="#5e2805" stroke="#78350f" strokeWidth="2" />
           <path d="M5,35 Q50,5 95,35" fill="none" stroke="url(#shinyGold)" strokeWidth="4" strokeDasharray="10,80,10" /> {/* Metal corners */}
           <path d="M45,15 L55,15 L55,35 L45,35 Z" fill="url(#shinyGold)" stroke="white" strokeWidth="0.5" /> {/* Center Latch */}
        </g>
        
        {/* Highlight Overlay for extra gloss */}
        <path d="M20,45 Q30,45 30,55" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M75,40 Q80,30 85,40" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// --- Login Screen Component ---

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            setLoading(false);
            onLogin();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <MoneyRain />
            
            {/* Glow Effects */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-sm relative z-10 animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black tracking-tighter italic drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
                        <span className="text-white">JOGOU</span><br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600 text-6xl">GANHOU</span>
                    </h1>
                    <p className="text-emerald-400 text-xs font-bold tracking-[0.3em] uppercase mt-2 animate-pulse">
                        O app da virada
                    </p>
                </div>

                <form onSubmit={handleLogin} className="bg-slate-900/80 backdrop-blur-xl border border-yellow-500/30 p-8 rounded-3xl shadow-2xl space-y-5 relative overflow-hidden group">
                    {/* Gloss overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div>
                        <label className="block text-xs font-bold text-yellow-500 uppercase mb-2 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input 
                                type="email" 
                                placeholder="seu@email.com"
                                className="w-full bg-black/50 border border-slate-700 focus:border-yellow-500 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-colors placeholder:text-slate-600 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-yellow-500 uppercase mb-2 ml-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full bg-black/50 border border-slate-700 focus:border-yellow-500 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-colors placeholder:text-slate-600 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 text-black font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? (
                            <Activity className="animate-spin" />
                        ) : (
                            <>
                                ENTRAR <ArrowRight size={20} strokeWidth={3} />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <a href="#" className="text-xs text-slate-400 hover:text-white transition-colors">Esqueci minha senha</a>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-xs">Não tem conta?</p>
                    <button className="text-yellow-400 font-bold text-sm hover:underline mt-1">
                        CRIAR CONTA GRÁTIS
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Roulette Component ---

interface RouletteModalProps {
    onClose: () => void;
    onWin: (boost: string) => void;
}

const RouletteModal: React.FC<RouletteModalProps> = ({ onClose, onWin }) => {
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<string | null>(null);

    const handleSpin = () => {
        if (spinning) return;
        setSpinning(true);
        
        // Random rotation between 1080 (3 spins) and 2160 (6 spins) + random offset
        const spinAmount = 1800 + Math.random() * 360;
        setRotation(prev => prev + spinAmount);

        // Determine result based on weighted probability
        setTimeout(() => {
            const r = Math.random() * 100;
            let won = "";

            if (r < 40) {
                won = "+10% SORTE";
            } else if (r < 70) {
                won = "+15% SORTE";
            } else if (r < 85) {
                won = "+20% SORTE";
            } else if (r < 95) {
                won = "+50% SORTE";
            } else if (r < 99) {
                won = "DOBRO";
            } else {
                won = "JACKPOT";
            }

            setResult(won);
            setSpinning(false);
            
            // Auto close after showing result
            setTimeout(() => {
                onWin(won);
                onClose();
            }, 2000);
        }, 4000); // Match CSS transition duration
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border-2 border-yellow-600 rounded-3xl p-6 w-full max-w-xs text-center relative overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>
                
                <h2 className="text-2xl font-black text-white mb-1 uppercase italic tracking-tighter">Roleta da <span className="text-yellow-500">Sorte</span></h2>
                <p className="text-xs text-slate-400 mb-6">Gire para aumentar suas chances!</p>

                <div className="relative w-64 h-64 mx-auto mb-8">
                    {/* Marker */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 z-20">
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-600 drop-shadow-lg"></div>
                    </div>

                    {/* Wheel */}
                    <div 
                        className="w-full h-full rounded-full border-4 border-yellow-600 relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-slate-800"
                        style={{ 
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 4s cubic-bezier(0.1, 0.05, 0.1, 1)'
                        }}
                    >
                        {/* Segments (Simplified visual representation) */}
                        <div className="absolute inset-0 bg-[conic-gradient(#eab308_0deg_60deg,#ca8a04_60deg_120deg,#eab308_120deg_180deg,#ca8a04_180deg_240deg,#eab308_240deg_300deg,#ca8a04_300deg_360deg)]"></div>
                        
                        {/* Inner Circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-900 rounded-full border-4 border-yellow-500 flex items-center justify-center z-10 shadow-xl">
                            <Star size={24} className="text-yellow-400 animate-pulse" />
                        </div>
                    </div>
                </div>

                {result ? (
                    <div className="animate-bounce">
                        <div className="text-yellow-400 font-black text-3xl drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">{result}</div>
                        <p className="text-white text-sm font-bold">ATIVADO!</p>
                    </div>
                ) : (
                    <button 
                        onClick={handleSpin}
                        disabled={spinning}
                        className="w-full bg-gradient-to-b from-red-500 to-red-700 text-white font-black text-xl py-4 rounded-xl shadow-[0_5px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                        {spinning ? 'Girando...' : 'GIRAR AGORA'}
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Payment Modal Component ---

interface PaymentModalProps {
    onClose: () => void;
    onConfirm: () => void;
    price: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onConfirm, price }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // Generate a complex looking QR code to simulate real PIX
    const pixPayload = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913Jogou Ganhou6008Sao Paulo62070503***6304";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(pixPayload)}`;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleClearFile = () => {
        setFile(null);
    };

    const handleConfirmClick = () => {
        if (!file) return;
        setIsUploading(true);
        
        // Simulate upload delay
        setTimeout(() => {
            setIsUploading(false);
            onConfirm();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-fade-in overflow-y-auto">
            <div className="bg-slate-900 border border-yellow-500/40 rounded-3xl w-full max-w-sm relative overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.2)] my-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-700 to-yellow-500 p-4 text-center shadow-lg">
                    <h2 className="text-xl font-black text-black uppercase tracking-tight">Pagamento via PIX</h2>
                    <p className="text-yellow-900 font-bold text-xs">Escaneie o QR Code para participar</p>
                </div>

                <div className="p-6 flex flex-col items-center gap-4">
                    {/* Price Tag */}
                    <div className="bg-black/50 border border-yellow-500/30 px-6 py-2 rounded-full flex items-center gap-3">
                        <span className="text-slate-400 text-xs uppercase font-bold">Total:</span>
                        <span className="text-2xl font-black text-emerald-400">R$ {price.toFixed(2)}</span>
                    </div>

                    {/* QR Code Area */}
                    <div className="relative group bg-white p-2 rounded-xl shadow-2xl">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
                        <div className="relative bg-white rounded-lg overflow-hidden">
                             <img 
                                src={qrCodeUrl} 
                                alt="QR Code PIX" 
                                className="w-48 h-48 object-contain mix-blend-multiply"
                            />
                        </div>
                    </div>

                    {/* Copy Paste */}
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex justify-between items-center gap-2 w-full group cursor-pointer transition-colors hover:bg-slate-800" onClick={() => navigator.clipboard.writeText(pixPayload)}>
                         <div className="text-left overflow-hidden">
                             <p className="text-[10px] text-slate-400 uppercase font-bold">Pix Copia e Cola</p>
                             <p className="text-xs text-slate-200 font-mono truncate w-full opacity-70 group-hover:opacity-100 transition-opacity">
                                 {pixPayload}
                             </p>
                         </div>
                         <button className="text-yellow-400 bg-yellow-500/10 p-2 rounded-md hover:bg-yellow-500/20 transition-colors">
                             <Copy size={18} />
                         </button>
                     </div>

                    {/* Upload Receipt Section */}
                    <div className="w-full space-y-2 border-t border-slate-800 pt-4">
                         <p className="text-xs text-slate-400 font-bold uppercase mb-1 ml-1">Anexar Comprovante <span className="text-red-500">*</span></p>
                         
                         {!file ? (
                             <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer bg-black/30 hover:bg-slate-800 hover:border-yellow-500/50 transition-all group">
                                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                     <Upload className="w-8 h-8 text-slate-500 group-hover:text-yellow-500 mb-2 transition-colors" />
                                     <p className="text-xs text-slate-500 group-hover:text-slate-300">Clique para enviar imagem</p>
                                 </div>
                                 <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                             </label>
                         ) : (
                             <div className="flex items-center justify-between p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                                 <div className="flex items-center gap-3 overflow-hidden">
                                     <div className="p-2 bg-emerald-500/20 rounded-lg">
                                         <Image size={20} className="text-emerald-400" />
                                     </div>
                                     <div className="min-w-0">
                                         <p className="text-xs text-emerald-300 font-bold truncate max-w-[150px]">{file.name}</p>
                                         <p className="text-[10px] text-emerald-500/70">Pronto para enviar</p>
                                     </div>
                                 </div>
                                 <button onClick={handleClearFile} className="p-1.5 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-400 transition-colors">
                                     <X size={16} />
                                 </button>
                             </div>
                         )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 w-full pt-2">
                        <button 
                            onClick={onClose}
                            disabled={isUploading}
                            className="py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleConfirmClick}
                            disabled={!file || isUploading}
                            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none text-white font-black py-3 rounded-xl shadow-[0_5px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 text-sm group"
                        >
                            {isUploading ? (
                                <>
                                    <Activity size={18} className="animate-spin" />
                                    ENVIANDO...
                                </>
                            ) : (
                                <>
                                    <Check size={18} strokeWidth={3} className="group-active:scale-125 transition-transform" />
                                    {file ? 'CONFIRMAR' : 'ANEXAR RECIBO'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Lucky Number Modal ---

interface LuckyNumberModalProps {
    luckyNumber: string;
    onClose: () => void;
}

const LuckyNumberModal: React.FC<LuckyNumberModalProps> = ({ luckyNumber, onClose }) => {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-fade-in">
             <MoneyRain />
             
             <div className="bg-gradient-to-b from-slate-900 to-black border-2 border-yellow-500 rounded-3xl w-full max-w-sm relative overflow-hidden shadow-[0_0_100px_rgba(234,179,8,0.4)] p-8 text-center animate-[shake_0.5s]">
                {/* Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#212121_50%,#E2E8F0_100%)] opacity-10 blur-xl animate-spin-slow pointer-events-none"></div>

                <div className="relative z-10">
                    <Sparkles className="text-yellow-400 w-16 h-16 mx-auto mb-4 animate-pulse" />
                    
                    <h2 className="text-3xl font-black text-white uppercase italic mb-2">Pagamento Confirmado!</h2>
                    <p className="text-slate-400 text-sm mb-8">Você está concorrendo oficialmente.</p>
                    
                    <div className="bg-yellow-500 p-1 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.6)] mb-8 transform rotate-[-2deg] hover:rotate-0 transition-transform">
                        <div className="bg-black border-2 border-dashed border-yellow-600 rounded-xl p-6 relative overflow-hidden">
                             <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-500 rounded-full"></div>
                             <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-500 rounded-full"></div>
                             
                             <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-[0.4em] mb-2">Seu Número da Sorte</p>
                             <div className="text-4xl font-mono font-black text-white tracking-widest drop-shadow-lg">
                                {luckyNumber}
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full bg-white text-black font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.5)] active:scale-95 transition-all"
                    >
                        TORCER AGORA! 🤞
                    </button>
                </div>
             </div>
        </div>
    );
}

// --- Sub-Components ---

const Header = ({ onLogout }: { onLogout: () => void }) => (
  <header className="pt-6 pb-20 px-6 relative overflow-hidden">
    {/* Casino Lights Background */}
    <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-50px] left-[50%] translate-x-[-50%] w-[120%] h-[300px] bg-gradient-to-b from-purple-900/40 to-transparent rounded-[100%] blur-3xl"></div>
    </div>

    <div className="max-w-md mx-auto relative z-10 flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-black tracking-tighter italic drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
          <span className="text-white">JOGOU</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600">GANHOU</span>
        </h1>
        <p className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-1 mt-1">
           <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></span>
           Cassino Ao Vivo
        </p>
      </div>
      <button onClick={onLogout} className="bg-black/80 border border-red-500/30 p-2.5 rounded-full relative shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-950/50 transition-colors">
        <LogOut size={20} className="text-red-400" />
      </button>
    </div>
  </header>
);

const AdBanner = () => (
    <div className="max-w-md mx-auto px-6 mt-6 mb-2">
        <div className="bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/30 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden group shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="bg-purple-900/50 p-2 rounded-lg shrink-0 border border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <Megaphone size={20} className="text-purple-300" />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Patrocínio Master</p>
                <p className="text-xs font-medium text-slate-300">Prêmio turbinado por <span className="font-bold text-white text-shadow">BetGold Brasil</span></p>
            </div>
        </div>
    </div>
);

interface PrizeCardProps {
    stats: DrawStats;
    dreamText: string;
    displayPrize: number;
    isVerified: boolean;
    isExploding: boolean;
}

const PrizeCard = ({ stats, dreamText, displayPrize, isVerified, isExploding }: PrizeCardProps) => (
  <div className="mx-4 -mt-12 relative z-20 max-w-md md:mx-auto">
    
    {/* Casino Board Container */}
    <div className="bg-black border-2 border-yellow-600 rounded-3xl p-1 relative shadow-[0_0_40px_rgba(234,179,8,0.15)] overflow-visible">
        
        {/* Lights Frame */}
        <div className="absolute -inset-1 bg-gradient-to-b from-yellow-400 to-orange-700 rounded-[1.6rem] -z-10 blur-[2px] opacity-60 animate-pulse"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-yellow-500 px-4 py-1 rounded-full uppercase text-[10px] font-black text-yellow-400 tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.8)] z-30">
            Jackpot
        </div>

        <div className="bg-gradient-to-b from-slate-900 to-black rounded-[1.3rem] p-5 pb-8 relative overflow-hidden">
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50"></div>

            <div className="text-center mb-2 relative z-10">
                <div className="flex justify-center gap-2 mb-4">
                     <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-all duration-200 ${
                         isVerified 
                         ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                         : 'bg-red-950 text-red-500 border-red-500/50 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                     }`}>
                        {isVerified ? <CheckCircle2 size={10} /> : <Activity size={10} className="animate-spin" />}
                        {isVerified ? 'Auditado' : 'Ao Vivo'}
                     </div>
                </div>
                
                {/* TREASURE CHEST DISPLAY */}
                <div className="mb-4">
                  <TreasureChest 
                    fillPercentage={(displayPrize / stats.nextTier) * 100} 
                    isExploding={isExploding} 
                  />
                </div>

                {/* VALUE BADGE UNDER CHEST */}
                <div className="relative inline-block bg-black/60 backdrop-blur border border-yellow-500/50 px-6 py-2 rounded-2xl shadow-[0_5px_20px_rgba(0,0,0,0.5)] transform -translate-y-4">
                    <h2 className={`text-4xl leading-none font-black tracking-tighter font-sans transition-all duration-100 ${
                        isVerified 
                        ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                        : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]'
                    }`}>
                        <span className="text-lg align-top text-slate-500 font-bold mr-1 mt-1 inline-block">R$</span>
                        {displayPrize.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                </div>
                
                {dreamText && (
                    <p className="text-xs text-yellow-200/80 -mt-2 font-medium animate-fade-in drop-shadow-sm">
                    ✨ {dreamText} ✨
                    </p>
                )}
            </div>

            {/* Stats Grid - Neon Style */}
            <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center p-2 rounded bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
                    <div className="font-black text-white text-lg drop-shadow-md">{stats.participants.toLocaleString('pt-BR')}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Jogadores</div>
                </div>
                <div className="text-center p-2 rounded bg-slate-900/80 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
                     <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-500/30 blur-lg rounded-full"></div>
                    <div className="font-black text-emerald-400 text-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">R$ {TICKET_PRICE.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Entrada</div>
                </div>
                <div className="text-center p-2 rounded bg-red-950/30 border border-red-900/50 backdrop-blur-sm relative">
                    <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                    <div className="font-black text-red-500 text-lg drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] font-mono">{stats.timeRemaining}</div>
                    <div className="text-[9px] text-red-400/70 font-bold uppercase">Fecha em</div>
                </div>
            </div>
        </div>
    </div>
  </div>
);

// --- Screens ---

const HomeScreen: React.FC<{ 
  stats: DrawStats; 
  onParticipateClick: () => void; 
  dreamText: string; 
  loadingDream: boolean;
  displayPrize: number;
  isVerified: boolean;
  isShaking: boolean;
  user: UserProfile;
  onOpenRoulette: () => void;
  onLogout: () => void;
}> = ({ stats, onParticipateClick, dreamText, loadingDream, displayPrize, isVerified, isShaking, user, onOpenRoulette, onLogout }) => {
  return (
    <div className={`pb-24 relative ${isShaking ? 'animate-shake' : ''}`}>
      <MoneyRain />
      <WinnerMarquee />
      <Header onLogout={onLogout} />
      <PrizeCard 
        stats={stats} 
        dreamText={loadingDream ? "Calculando..." : dreamText} 
        displayPrize={displayPrize}
        isVerified={isVerified}
        isExploding={isShaking}
      />

      <div className="max-w-md mx-auto px-6 mt-8 relative z-30">
        
        {/* Roulette Trigger */}
        {!user.luckBoost && (
            <button 
                onClick={onOpenRoulette}
                className="w-full mb-4 bg-slate-900 hover:bg-slate-800 border border-yellow-500/30 text-yellow-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
                <Dices size={20} className="animate-bounce" />
                GIRAR ROLETA DA SORTE
            </button>
        )}

        {user.luckBoost && (
            <div className="mb-4 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white p-2 rounded-xl text-center font-black border border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse flex items-center justify-center gap-2">
                <Zap size={16} className="text-white" />
                {user.luckBoost} ATIVADO!
            </div>
        )}

        <button 
            onClick={onParticipateClick} 
            className="w-full group relative focus:outline-none transform active:scale-95 transition-transform duration-100"
        >
             {/* Glow Background */}
             <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-200 animate-pulse"></div>
             
             {/* Button Body */}
             <div className="relative px-8 py-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl leading-none flex items-center justify-center border-t border-yellow-200 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <Zap className="text-black fill-black animate-bounce" size={24} />
                        <span className="text-2xl font-black text-black tracking-wide drop-shadow-sm">PARTICIPAR</span>
                        <Zap className="text-black fill-black animate-bounce delay-100" size={24} />
                    </div>
                    <span className="text-yellow-900 font-bold bg-yellow-300/50 px-2 py-0.5 rounded text-xs uppercase tracking-widest">
                        Apenas R$ {TICKET_PRICE.toFixed(2)}
                    </span>
                </div>

                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite]"></div>
             </div>
        </button>

        <AdBanner />

        <div className="bg-slate-900/80 p-4 rounded-xl flex items-center gap-4 border border-slate-800 mt-4 shadow-lg">
          <div className="bg-blue-500/10 p-2 rounded-full border border-blue-500/20">
             <Activity className="text-blue-400 animate-spin-slow" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm mb-0.5">Sorteios Frenéticos ⚡</h3>
            <p className="text-xs text-slate-400">
              A cada <span className="text-white font-bold">30 min</span> um ganhador leva tudo. Não pisque!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RewardsScreen: React.FC<{ user: UserProfile; toggleNotifications: () => void }> = ({ user, toggleNotifications }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(user.referralCode);
        alert('Código copiado!');
    };

    return (
        <div className="pb-24 max-w-md mx-auto min-h-screen bg-black animate-fade-in text-slate-200">
            <div className="bg-gradient-to-b from-purple-900 to-black p-6 pt-12 pb-8 rounded-b-[2rem] shadow-[0_10px_30px_rgba(88,28,135,0.2)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                <h1 className="text-3xl font-black text-white mb-1 italic">VIP <span className="text-purple-400">CLUB</span></h1>
                <p className="text-purple-300/80 text-sm font-medium">Jogue como um rei, ganhe como um imperador.</p>
            </div>

            <div className="p-6 -mt-6 relative z-10">
                {/* Loyalty Card */}
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMTgxODE4Ii8+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMjIyIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvc3ZnPg==')] opacity-20"></div>
                    
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                                <Star className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Loyalty Status</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Gold Member</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative z-10 mb-2">
                         <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-slate-300">Progresso para Bônus</span>
                            <span className="text-xs font-bold text-yellow-400">{user.loyaltyProgress}/{user.loyaltyTarget}</span>
                         </div>
                         <div className="h-4 bg-black rounded-full border border-slate-700 p-0.5">
                            <div 
                                className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)] relative overflow-hidden"
                                style={{ width: `${(user.loyaltyProgress / user.loyaltyTarget) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-shimmer opacity-50"></div>
                            </div>
                         </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-4 relative z-10 bg-black/30 py-2 rounded-lg border border-slate-800">
                        Faltam <span className="text-white font-bold">{user.loyaltyTarget - user.loyaltyProgress} jogadas</span> para seu Ticket Grátis!
                    </p>
                </div>

                {/* Referral Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl shadow-lg border border-slate-800 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                            <Gift className="text-emerald-400" size={20} />
                        </div>
                        <h3 className="font-bold text-white">Indique & Fature</h3>
                    </div>
                    
                    <div className="bg-black p-4 rounded-xl flex justify-between items-center mb-4 border border-emerald-900/50 shadow-inner">
                        <code className="font-mono font-black text-emerald-400 text-xl tracking-widest drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{user.referralCode}</code>
                        <button onClick={copyToClipboard} className="text-slate-500 hover:text-white transition-colors active:scale-90 transform">
                            <Copy size={20} />
                        </button>
                    </div>
                    
                    <Button variant="primary" fullWidth className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(5,150,105,0.3)] border-t border-emerald-400/50">
                        <Share2 size={18} />
                        ENVIAR PARA AMIGOS
                    </Button>
                </div>
            </div>
        </div>
    );
};

const RulesScreen: React.FC<{ stats: DrawStats }> = ({ stats }) => {
  const [explanation, setExplanation] = useState<string>("");
  const [reportSummaries, setReportSummaries] = useState<Record<string, string>>({});

  useEffect(() => {
    getTransparencyExplanation().then(setExplanation);
    
    const loadSummaries = async () => {
        const newSummaries: Record<string, string> = {};
        for (const report of TRANSPARENCY_REPORTS) {
            if (!reportSummaries[report.id]) {
                newSummaries[report.id] = await getReportSummary(report.month, report.totalCollected, report.totalPaid);
            }
        }
        setReportSummaries(prev => ({...prev, ...newSummaries}));
    };
    loadSummaries();
  }, []);

  const data = [
    { name: 'Prêmio', value: 70, color: '#eab308' }, 
    { name: 'Manutenção', value: 20, color: '#3b82f6' }, 
    { name: 'Marketing', value: 10, color: '#64748b' }, 
  ];

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-black animate-fade-in text-slate-200">
      <div className="bg-slate-900 p-6 pt-12 pb-8 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-2">Transparência <span className="text-yellow-500">100%</span></h1>
        <p className="text-slate-400 text-sm">
          Sem letras miúdas. Aqui o jogo é aberto.
        </p>
      </div>

      <div className="p-6">
        <div className="h-64 w-full relative mb-8">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', borderRadius: '8px' }} />
            </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="block text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">70%</span>
                    <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Volta pra Você</span>
                </div>
            </div>
        </div>

        <div className="space-y-4 mb-8">
            {data.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800/50 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                        <span className="font-bold text-slate-200">{item.name}</span>
                    </div>
                    <span className="font-black text-xl text-white">{item.value}%</span>
                </div>
            ))}
        </div>

        <div className="bg-emerald-950/30 p-5 rounded-xl border border-emerald-500/20 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
                <CheckCircle2 size={20} className="text-emerald-400" />
                <h3 className="font-bold text-emerald-100 text-sm">Auditoria em Tempo Real</h3>
            </div>
            <p className="text-xs text-emerald-200/70 leading-relaxed relative z-10 font-medium">
                {explanation || "Carregando explicação..."}
            </p>
        </div>
      </div>
    </div>
  );
};

const HistoryScreen = () => {
  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-black animate-fade-in text-slate-200">
       <div className="bg-slate-900 p-6 pt-12 pb-6 border-b border-slate-800 sticky top-0 z-30 shadow-2xl">
        <h1 className="text-2xl font-black text-white italic tracking-tight">HALL DA <span className="text-yellow-500">FAMA</span></h1>
        <p className="text-slate-400 text-sm">Eles acreditaram e mudaram de vida.</p>
      </div>

      <div className="p-6 space-y-4">
        {MOCK_WINNERS.map((winner, idx) => (
            <div key={winner.id} className="bg-slate-900 p-4 rounded-2xl shadow-lg border border-slate-800 flex gap-4 relative overflow-hidden group">
                 {/* Rank Number */}
                 <div className="absolute -right-4 -bottom-4 text-8xl font-black text-slate-800/50 z-0 pointer-events-none italic">
                    #{idx + 1}
                 </div>

                <div className="relative z-10 shrink-0">
                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-b from-yellow-400 to-yellow-700 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                        <img 
                            src={winner.avatar} 
                            alt={winner.name} 
                            className="w-full h-full rounded-full object-cover border-2 border-black"
                        />
                    </div>
                </div>

                <div className="flex-1 relative z-10">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-white text-lg">{winner.name}</h3>
                    </div>
                    <div className="mb-2">
                        <span className="text-sm font-black text-yellow-400 bg-black/50 border border-yellow-500/30 px-3 py-1 rounded-lg inline-block shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                            R$ {winner.prize.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="text-xs text-slate-400 italic relative pl-3 border-l-2 border-slate-700">
                        "{winner.testimonial}"
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [stats, setStats] = useState<DrawStats>({
    currentPrize: INITIAL_PRIZE,
    participants: 4215,
    timeRemaining: '28 min',
    ticketPrice: TICKET_PRICE,
    nextTier: 50000 // 50k Goal
  });
  const [dreamText, setDreamText] = useState<string>("");
  const [loadingDream, setLoadingDream] = useState<boolean>(false);

  // Dynamic Prize Display Logic
  const [displayPrize, setDisplayPrize] = useState<number>(stats.currentPrize);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [tickCount, setTickCount] = useState<number>(0);

  // Animation States
  const [isShaking, setIsShaking] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  // Lucky Number Logic
  const [luckyNumber, setLuckyNumber] = useState<string | null>(null);
  const [showLuckyNumber, setShowLuckyNumber] = useState(false);

  // User State
  const [user, setUser] = useState<UserProfile>({
      referralCode: 'WIN-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '777',
      referralCount: 3,
      loyaltyProgress: 7,
      loyaltyTarget: 10,
      freeTickets: 0,
      notificationsEnabled: true,
      luckBoost: undefined
  });

  // Initial Dream Load
  useEffect(() => {
    updateDream(stats.currentPrize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Prize Ticker Effect
  useEffect(() => {
    const interval = setInterval(() => {
        setTickCount(prev => prev + 1);
        
        const shouldShowReal = (tickCount + 1) % 3 === 0; // More frequent real updates

        if (shouldShowReal) {
            setDisplayPrize(stats.currentPrize);
            setIsVerified(true);
        } else {
            // Add random "noise" simulating transactions
            const fluctuation = Math.random() * 150 + 50;
            setDisplayPrize(stats.currentPrize + fluctuation);
            setIsVerified(false);
        }
    }, 1800); // Faster updates

    return () => clearInterval(interval);
  }, [tickCount, stats.currentPrize]);

  const updateDream = async (amount: number) => {
    setLoadingDream(true);
    const text = await getPrizeDream(amount);
    setDreamText(text);
    setLoadingDream(false);
  };

  const handleLogin = () => {
      setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentView(ViewState.HOME);
  };

  const handleParticipateClick = () => {
      setShowPayment(true);
  };

  const generateLuckyNumber = () => {
      // Generate format XXXX-XX
      const p1 = Math.floor(1000 + Math.random() * 9000);
      const p2 = Math.floor(10 + Math.random() * 90);
      return `${p1}-${p2}`;
  };

  const handlePaymentConfirmed = () => {
    setShowPayment(false);
    
    // Generate and show lucky number
    const num = generateLuckyNumber();
    setLuckyNumber(num);
    setShowLuckyNumber(true);

    const newPrize = stats.currentPrize + (TICKET_PRICE * PRIZE_PERCENTAGE);
    const newParticipants = stats.participants + 1;
    
    setStats(prev => ({
        ...prev,
        currentPrize: newPrize,
        participants: newParticipants,
    }));
    
    // Instant gratification visual update
    setDisplayPrize(newPrize);
    setIsVerified(true);
    setTickCount(2); // Reset tick to show real value immediately

    // Update Loyalty Logic
    setUser(prev => {
        let newProgress = prev.loyaltyProgress + 1;
        let newFreeTickets = prev.freeTickets;
        
        if (newProgress >= prev.loyaltyTarget) {
            newProgress = 0;
            newFreeTickets += 1;
            // setTimeout(() => alert('🎰 JACKPOT! VOCÊ GANHOU UM TICKET GRÁTIS! 🎰'), 500);
        }
        
        return {
            ...prev,
            loyaltyProgress: newProgress,
            freeTickets: newFreeTickets,
            luckBoost: undefined // Reset luck boost after use
        };
    });

    if (newParticipants % 5 === 0) { 
        updateDream(newPrize);
    }
  };

  const handleCloseLuckyNumber = () => {
      setShowLuckyNumber(false);
      // Shake ONLY after seeing the ticket, as a final confirmation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
  };

  const handleRouletteWin = (boost: string) => {
      setUser(prev => ({...prev, luckBoost: boost}));
  };

  const toggleNotifications = () => {
      setUser(prev => ({...prev, notificationsEnabled: !prev.notificationsEnabled}));
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.HOME:
        return (
            <HomeScreen 
                stats={stats} 
                onParticipateClick={handleParticipateClick} 
                dreamText={dreamText}
                loadingDream={loadingDream}
                displayPrize={displayPrize}
                isVerified={isVerified}
                isShaking={isShaking}
                user={user}
                onOpenRoulette={() => setShowRoulette(true)}
                onLogout={handleLogout}
            />
        );
      case ViewState.RULES:
        return <RulesScreen stats={stats} />;
      case ViewState.HISTORY:
        return <HistoryScreen />;
      case ViewState.REWARDS:
        return <RewardsScreen user={user} toggleNotifications={toggleNotifications} />;
      default:
        return (
            <HomeScreen 
                stats={stats} 
                onParticipateClick={handleParticipateClick} 
                dreamText={dreamText}
                loadingDream={loadingDream}
                displayPrize={displayPrize}
                isVerified={isVerified}
                isShaking={isShaking}
                user={user}
                onOpenRoulette={() => setShowRoulette(true)}
                onLogout={handleLogout}
            />
        );
    }
  };

  if (!isAuthenticated) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black font-sans text-slate-50 selection:bg-yellow-500 selection:text-black">
      {showRoulette && <RouletteModal onClose={() => setShowRoulette(false)} onWin={handleRouletteWin} />}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} onConfirm={handlePaymentConfirmed} price={TICKET_PRICE} />}
      {showLuckyNumber && luckyNumber && <LuckyNumberModal luckyNumber={luckyNumber} onClose={handleCloseLuckyNumber} />}
      {renderView()}
      <Navbar currentView={currentView} onChangeView={setCurrentView} />
    </div>
  );
};

export default App;
