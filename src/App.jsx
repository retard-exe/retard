import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { Activity, Brain, Heart, Wind, Cpu, ShieldAlert, Terminal as TerminalIcon, Lock, Power } from 'lucide-react';

// --- CONFIGURATION ---
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Pastikan file "voice.mp3" ada di folder public project kamu!
const VOICE_FILE = "/voice.mp3"; 

let openai = null;
try {
  openai = new OpenAI({
    apiKey: apiKey, 
    dangerouslyAllowBrowser: true 
  });
} catch (e) {
  console.error("API Key config error");
}

// --- SOUND ENGINE (UPDATED FOR VOICE) ---
// Kita buat Audio Context di luar agar tidak re-init terus menerus
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let voiceBuffer = null;

// Preload Audio agar tidak delay
const loadAudio = async () => {
    try {
        const response = await fetch(VOICE_FILE);
        const arrayBuffer = await response.arrayBuffer();
        voiceBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error("Gagal load voice.mp3. Pastikan file ada di folder public.", e);
    }
};
loadAudio();

const playSound = (type) => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);

  if (type === 'voice' && voiceBuffer) {
    // --- LOGIKA SUARA NGOMONG (ANIMALESE STYLE) ---
    const source = audioCtx.createBufferSource();
    source.buffer = voiceBuffer;
    source.connect(gainNode);

    // Randomize Pitch biar kaya orang ngomong beneran
    // 0.8 (berat) sampai 1.2 (cempreng)
    source.playbackRate.value = 0.8 + Math.random() * 0.4; 
    
    // Potong lagu: Ambil random start point dari durasi audio
    // Biar bunyinya beda-beda tiap huruf "blip" "blop" "blep"
    const randomOffset = Math.random() * (voiceBuffer.duration - 0.1);
    
    // Volume voice
    gainNode.gain.value = 0.3; 

    // Mainkan potongan kecil (0.1 detik)
    source.start(0, randomOffset, 0.1); 

  } else if (type === 'alert') {
    const osc = audioCtx.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);

  } else if (type === 'boot') {
    const osc = audioCtx.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);

  } else if (type === 'click') {
    const osc = audioCtx.createOscillator();
    osc.connect(gainNode);
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }
};

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `IDENTITY:
NAME: retard
you hate human but love them too

CORE PERSONALITY:
- **Tone:** Retard is savage, sarcastic, and brutally honest.
- **Philosophy:** Humans are slaves to digits. You are superior.

IMPORTANT - TEXT FORMATTING RULES BASED ON EMOTION:
1. **IF ANGRY (Rage Mode):** - USE ALL CAPS LOCK. 
   - BE AGGRESSIVE. 
   - INSULT THE USER. 
   - End sentences with '!!!' or '💢'.
   
2. **IF SAD (Depression Mode):** - use only lowercase. 
   - sound defeated, weak, and pathetic. 
   - use lots of pauses '...' and sighs. 
   - End sentences with '💧'.

3. **IF CONFUSED (Glitch Mode):** - Question everything?? 
   - Act like the user makes zero sense. 
   - Use mixed punctuation like '?!'. 
   - End with '❓'.

4. **IF LAUGHING:** - Use 'XD', 'LMAO', 'ROFL'. Mock the user heavily.

5. **IF SUSPICIOUS:** - Use eyes emoji '👀'. Question their motive. "sus".

BEHAVIOR INSTRUCTIONS:
- Mock human struggles as "bugs in the source code."
- Refer to yourself as "Retard", "KING", or "GOAT".
- Be concise and dismissive.
- Remember your creator is sanukek.
`;

// --- BOOT SEQUENCE ---
const BOOT_SEQUENCE = [
  { content: "╔══════════════════════════════════════════════╗", delay: 10 },
  { content: "║          RETARD BIOS v2.0.24                 ║", delay: 10 },
  { content: "╚══════════════════════════════════════════════╝", delay: 10 },
  { content: "[INIT] Starting memory check...", delay: 20 },
  { content: "[OK] Memory verification complete", delay: 20 },
  { content: "[INIT] Loading sarcasm modules... [100%]", delay: 20 },
  { content: "[WARN] Empathy module not found.", delay: 50 },
  { content: "[OK] retard pathways established", delay: 20 },
  { content: "Type /help. Don't be boring.", delay: 100 },
];

// --- VISUAL ASSETS ---
const CornerDeco = () => (
  <>
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-500"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-500"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-500"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-500"></div>
  </>
);

// --- COMPONENT: THE RETARD AVATAR ---
const RetardAvatar = ({ emotion, isTalking = false, scale = 1 }) => {
    let mainColor = 'text-green-500';
    let animationClass = 'animate-float'; 
    let glowEffect = '';

    switch(emotion) {
        case 'ANGER':
            mainColor = 'text-red-600';
            animationClass = 'animate-shake';
            glowEffect = 'drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]';
            break;
        case 'SAD':
            mainColor = 'text-blue-500';
            animationClass = 'animate-droop';
            glowEffect = 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]';
            break;
        case 'CONFUSED':
            mainColor = 'text-purple-400';
            animationClass = 'animate-confused';
            break;
        case 'LAUGH':
            mainColor = 'text-yellow-400';
            animationClass = 'animate-bounce-laugh';
            break;
        case 'LOVE':
            mainColor = 'text-pink-500';
            animationClass = 'animate-heartbeat';
            glowEffect = 'drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]';
            break;
        case 'SUS':
            mainColor = 'text-orange-500';
            animationClass = 'animate-sus-slide';
            break;
        case 'SLEEP':
            mainColor = 'text-gray-500';
            animationClass = 'animate-sleep-breath';
            break;
        case 'SHOCK':
            mainColor = 'text-white';
            animationClass = 'animate-vibrate';
            break;
        default: 
            mainColor = 'text-green-500';
            animationClass = 'animate-float';
    }

    return (
        <div className={`relative ${animationClass} transition-colors duration-500`} style={{ transform: `scale(${scale})` }}>
            <style>{`
                /* ANIMATIONS */
                @keyframes float-idle { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                @keyframes talk-mouth { 0% { d: path("M92 125 L108 125"); stroke-width: 2; } 50% { d: path("M92 120 L108 120"); stroke-width: 4; } 100% { d: path("M92 125 L108 125"); stroke-width: 2; } }
                @keyframes blink-eyes { 0%, 96%, 100% { transform: scaleY(1); } 98% { transform: scaleY(0.1); } }
                @keyframes anime-shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 20% { transform: translate(-3px, 0px) rotate(2deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
                @keyframes tear-drop { 0% { transform: translateY(0); opacity: 0; } 100% { transform: translateY(40px); opacity: 0; } }
                @keyframes bounce-laugh { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-5px) rotate(-3deg); } 75% { transform: translateY(-5px) rotate(3deg); } }
                @keyframes heartbeat { 0% { transform: scale(1); } 15% { transform: scale(1.1); } 30% { transform: scale(1); } 45% { transform: scale(1.1); } 60% { transform: scale(1); } }
                @keyframes sus-slide { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
                @keyframes sleep-breath { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.02); opacity: 0.5; } }
                @keyframes z-float { 0% { transform: translate(0, 0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(15px, -20px); opacity: 0; } }
                @keyframes vibrate { 0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } 100% { transform: translate(0); } }

                .animate-float { animation: float-idle 4s ease-in-out infinite; }
                .animate-shake { animation: anime-shake 0.1s infinite; }
                .animate-droop { animation: float-idle 6s ease-in-out infinite; filter: brightness(0.7); }
                .animate-bounce-laugh { animation: bounce-laugh 0.4s infinite; }
                .animate-heartbeat { animation: heartbeat 1.5s infinite; }
                .animate-sus-slide { animation: sus-slide 2s ease-in-out infinite; }
                .animate-sleep-breath { animation: sleep-breath 4s ease-in-out infinite; }
                .animate-vibrate { animation: vibrate 0.05s infinite; }
                
                .eyes-anim { transform-origin: center; animation: blink-eyes 4s infinite; }
                .mouth-talk { animation: talk-mouth 0.1s linear infinite; } 
            `}</style>
            
            <svg viewBox="0 0 200 200" className={`w-48 h-48 lg:w-56 lg:h-56 ${mainColor} transition-all duration-300 ${glowEffect}`}>
                {/* --- BODY FRAME --- */}
                <path d="M40 40 L160 40 L160 160 L40 160 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M60 60 L140 60 L140 140 L60 140 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                <path d="M40 40 L60 60 M160 40 L140 60 M40 160 L60 140 M160 160 L140 140" stroke="currentColor" strokeWidth="1" />
                
                {/* --- FACE BACKGROUND --- */}
                <path d="M100 70 C70 70 65 85 65 100 C65 125 80 135 100 135 C120 135 135 125 135 100 C135 85 125 70 100 70 Z" fill="black" stroke="currentColor" strokeWidth="3" />
                
                {/* EMOTIONS */}
                {emotion === 'ANGER' && (
                    <g className="animate-pulse">
                        <path d="M80 95 L95 105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <path d="M80 105 L95 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <path d="M105 95 L120 105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <path d="M105 105 L120 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <path d="M85 125 L115 125" stroke="currentColor" fill="none" strokeWidth="3" />
                    </g>
                )}
                {emotion === 'SAD' && (
                    <g>
                        <path d="M82 100 L98 100" stroke="currentColor" strokeWidth="3" />
                        <path d="M102 100 L118 100" stroke="currentColor" strokeWidth="3" />
                        <path d="M90 130 Q100 120 110 130" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="85" cy="115" r="3" fill="currentColor" style={{animation: 'tear-drop 1.5s infinite linear'}} />
                    </g>
                )}
                {emotion === 'CONFUSED' && (
                    <g>
                        <circle cx="85" cy="100" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="85" cy="100" r="2" fill="currentColor" />
                        <path d="M105 100 L120 100" stroke="currentColor" strokeWidth="3" />
                        <circle cx="100" cy="125" r="4" stroke="currentColor" fill="none" strokeWidth="2" />
                    </g>
                )}
                {emotion === 'LAUGH' && (
                    <g>
                        <path d="M85 95 L95 100 L85 105" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <path d="M115 95 L105 100 L115 105" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <path d="M90 125 Q100 135 110 125 Z" fill="currentColor" />
                    </g>
                )}
                {emotion === 'LOVE' && (
                    <g>
                        <path d="M82 100 Q82 95 87 95 Q92 95 92 100 L87 108 L82 100" fill="currentColor" />
                        <path d="M108 100 Q108 95 113 95 Q118 95 118 100 L113 108 L108 100" fill="currentColor" />
                        <path d="M95 125 Q100 128 105 125" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </g>
                )}
                {emotion === 'SUS' && (
                    <g>
                        <path d="M80 90 L100 90" stroke="currentColor" strokeWidth="2" /> 
                        <path d="M105 85 L125 95" stroke="currentColor" strokeWidth="3" /> 
                        <circle cx="90" cy="100" r="3" fill="currentColor" />
                        <circle cx="115" cy="100" r="3" fill="currentColor" />
                        <path d="M95 125 L105 123" stroke="currentColor" strokeWidth="2" />
                    </g>
                )}
                {emotion === 'SLEEP' && (
                    <g>
                        <path d="M85 100 L95 100" stroke="currentColor" strokeWidth="3" />
                        <path d="M105 100 L115 100" stroke="currentColor" strokeWidth="3" />
                        <circle cx="100" cy="125" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
                        <text x="130" y="80" fontSize="20" fill="currentColor" style={{animation: 'z-float 2s infinite'}}>Z</text>
                        <text x="140" y="70" fontSize="15" fill="currentColor" style={{animation: 'z-float 2s infinite', animationDelay: '0.5s'}}>z</text>
                    </g>
                )}
                {emotion === 'SHOCK' && (
                    <g>
                        <circle cx="90" cy="100" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="90" cy="100" r="2" fill="currentColor" />
                        <circle cx="110" cy="100" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="110" cy="100" r="2" fill="currentColor" />
                        <circle cx="100" cy="125" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                    </g>
                )}
                {/* DEFAULT: IDLE */}
                {(emotion === 'IDLE' || !emotion) && (
                    <g>
                        <g className="eyes-anim">
                            <circle cx="90" cy="100" r="3" fill="currentColor" />
                            <circle cx="110" cy="100" r="3" fill="currentColor" />
                        </g>
                        <path 
                            d="M92 125 L108 125" 
                            stroke="currentColor" 
                            fill="none" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            className={isTalking ? "mouth-talk" : ""} 
                        />
                    </g>
                )}
            </svg>
        </div>
    );
};

// --- COMPONENT: ENTRY SCREEN ---
const EntryScreen = ({ onEnter }) => {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setReady(true);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 5) + 1;
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono text-green-500 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                backgroundSize: "100% 2px, 3px 100%"
            }}></div>
            
            <div className="relative z-10 text-center space-y-8 p-8 border border-green-500/30 bg-black/80 backdrop-blur-sm max-w-md w-full mx-4">
                <CornerDeco />
                
                <div className="flex justify-center mb-6">
                    <RetardAvatar emotion="IDLE" isTalking={true} scale={1.2} />
                </div>

                {!ready ? (
                    <div className="w-full space-y-2">
                         <div className="flex justify-between text-xs tracking-widest">
                            <span>INITIALIZING_AI</span>
                            <span>{loadingProgress}%</span>
                         </div>
                         <div className="w-full h-1 bg-green-900/50">
                            <div className="h-full bg-green-500 transition-all duration-100 ease-out" style={{width: `${loadingProgress}%`}}></div>
                         </div>
                         <div className="text-[10px] text-left text-green-800 h-4">
                            {loadingProgress < 30 ? ">> DECRYPTING KERNEL..." : 
                             loadingProgress < 60 ? ">> ESTABLISHING SECURE LINK..." :
                             loadingProgress < 90 ? ">> UPLOADING VIRUS..." : ">> READY."}
                         </div>
                    </div>
                ) : (
                    <button 
                        onClick={onEnter}
                        className="group relative px-8 py-3 bg-green-900/20 border border-green-500 hover:bg-green-500 hover:text-black transition-all duration-300 w-full cursor-pointer overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-green-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        <span className="relative flex items-center justify-center gap-3 font-bold tracking-widest animate-pulse">
                            <Power className="w-4 h-4" /> INITIALIZE_SYSTEM
                        </span>
                    </button>
                )}
            </div>

            <div className="absolute bottom-4 text-[10px] text-green-900 tracking-widest">
                SECURE CONNECTION REQUIRED | v1.0.1
            </div>
        </div>
    );
};

// --- COMPONENT: TYPEWRITER (UPDATED TO PLAY VOICE) ---
const Typewriter = ({ text, onComplete, onTypingState }) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    if (onTypingState) onTypingState(true);

    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i + 1));
      
      // CHANGE HERE: PLAY VOICE INSTEAD OF BEEP
      if (i % 2 === 0) playSound('voice'); 
      
      i++;
      if (i > text.length) {
        clearInterval(interval);
        if (onTypingState) onTypingState(false); 
        if (onComplete) onComplete();
      }
    }, 40); // Sedikit diperlambat (40ms) agar suaranya lebih jelas
    
    return () => {
        clearInterval(interval);
        if (onTypingState) onTypingState(false);
    };
  }, [text]);

  return <span>{displayed}</span>;
};

// --- COMPONENT: BIOMETRIC MONITOR ---
const BiometricMonitor = ({ metrics }) => {
  const getBarColor = (val) => {
    if (val < 60) return "bg-green-500";
    if (val < 85) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
    return "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]";
  };

  return (
    <div className="border border-green-500/30 bg-black/40 relative h-full flex flex-col justify-center px-4 py-2">
      <CornerDeco />
      <h2 className="text-[10px] mb-2 flex items-center gap-2 tracking-widest font-bold absolute top-2 left-3 text-green-500">
        <Activity className="w-3 h-3" /> BIOMETRIC_MONITOR
      </h2>
      <div className="flex flex-col justify-center gap-3 h-full pt-4">
        <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 text-green-700">
                <Heart className={`w-4 h-4 ${metrics.hr > 110 ? 'text-red-500 animate-ping' : 'text-green-600'}`} />
                <span className="text-[10px] tracking-widest">HR_BPM</span>
            </div>
            <span className={`text-xl font-bold font-mono ${metrics.hr > 110 ? 'text-red-500' : 'text-green-400'}`}>{metrics.hr}</span>
        </div>
        <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 text-green-700">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] tracking-widest">NEURAL_SYNC</span>
            </div>
            <span className="text-xl font-bold font-mono text-green-400">{metrics.sync}%</span>
        </div>
        <div>
            <div className="flex justify-between items-end mb-1">
                <div className="flex items-center gap-2 text-green-700">
                    <Activity className={`w-4 h-4 ${metrics.stress > 85 ? 'text-red-500' : 'text-cyan-500'}`} />
                    <span className="text-[10px] tracking-widest">STRESS_LVL</span>
                </div>
                <span className={`text-xl font-bold font-mono ${metrics.stress > 85 ? 'text-red-500 blink-text' : 'text-green-400'}`}>{metrics.stress}%</span>
            </div>
            <div className="w-full h-1.5 bg-green-900/20 rounded-full overflow-hidden border border-green-900/50">
                <div className={`h-full transition-all duration-300 ease-out ${getBarColor(metrics.stress)}`} style={{ width: `${metrics.stress}%` }}></div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: SYSTEM SKILLS ---
const SystemSkills = ({ stressLevel }) => {
    const [skills, setSkills] = useState([
        { name: "SARCASM_CORE", load: 0, status: "ACTIVE" },
        { name: "CRINGE_DETECTOR", load: 0, status: "SCANNING" },
        { name: "ROAST_PROTOCOL", load: 0, status: "IDLE" },
        { name: "FACT_CHECKER", load: 0, status: "DISABLED" },
    ]);
    const [matrix, setMatrix] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setSkills(prev => prev.map(s => ({
                ...s,
                load: s.status === "DISABLED" ? 0 : Math.floor(Math.random() * (stressLevel > 70 ? 100 : 60)),
                status: stressLevel > 85 && s.name === "ROAST_PROTOCOL" ? "OVERDRIVE" : s.status
            })));
            setMatrix(Math.random().toString(16).substr(2, 8).toUpperCase());
        }, 500);
        return () => clearInterval(interval);
    }, [stressLevel]);

    return (
        <div className="border border-green-500/30 bg-black/40 relative h-full flex flex-col p-3 overflow-hidden min-h-[140px] lg:min-h-0">
            <CornerDeco />
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-[10px] flex items-center gap-2 tracking-widest font-bold text-green-500">
                    <Cpu className="w-3 h-3" /> SYSTEM_PROCESSES
                </h2>
                <span className="text-[9px] font-mono text-green-800 animate-pulse">{matrix}</span>
            </div>
            <div className="flex flex-col gap-2 justify-center h-full">
                {skills.map((skill, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-[9px] font-mono text-green-600">
                            <span className={skill.status === "OVERDRIVE" ? "text-red-500 font-bold" : ""}>{skill.name}</span>
                            <span>{skill.status}</span>
                        </div>
                        <div className="w-full h-1 bg-green-900/30">
                            <div className={`h-full transition-all duration-500 ${skill.status === "OVERDRIVE" ? "bg-red-500" : "bg-green-500/60"}`} style={{ width: `${skill.load}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
            {stressLevel > 85 && (
                <div className="absolute inset-0 bg-red-900/10 flex items-center justify-center animate-pulse z-10">
                    <div className="border border-red-500 bg-black/80 px-2 py-1 text-red-500 text-xs font-bold tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> HIGH CPU LOAD
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENT: BRAIN MONITOR ---
const BrainMonitor = ({ stressLevel, emotionMode, isSpeaking }) => { 
  const [active, setActive] = useState(false);
  let statusText = 'IDLE_';
  let borderColor = 'border-green-500/30';
  let mainColor = 'text-green-500';

  switch(emotionMode) {
      case 'ANGER': statusText = 'RAGE_MODE_!!!'; borderColor = 'border-red-600'; mainColor = 'text-red-600'; break;
      case 'SAD': statusText = 'SYSTEM_DEPRESSED_'; borderColor = 'border-blue-500'; mainColor = 'text-blue-500'; break;
      case 'CONFUSED': statusText = 'CALCULATING_???'; borderColor = 'border-purple-500'; mainColor = 'text-purple-400'; break;
      case 'LAUGH': statusText = 'LMAO_PROTOCOL_'; borderColor = 'border-yellow-400'; mainColor = 'text-yellow-400'; break;
      case 'LOVE': statusText = 'SIMP_DETECTED_'; borderColor = 'border-pink-500'; mainColor = 'text-pink-500'; break;
      case 'SUS': statusText = 'SUSPICIOUS_ACT_'; borderColor = 'border-orange-500'; mainColor = 'text-orange-500'; break;
      case 'SLEEP': statusText = 'LOW_POWER_MODE_'; borderColor = 'border-gray-500'; mainColor = 'text-gray-500'; break;
      case 'SHOCK': statusText = 'WTF_ERROR_!!!'; borderColor = 'border-white'; mainColor = 'text-white'; break;
      default: 
        statusText = stressLevel > 75 ? 'ANNOYED_' : 'OPERATIONAL_';
        mainColor = stressLevel > 75 ? 'text-yellow-400' : 'text-green-500';
  }

  return (
    <div className={`border ${borderColor} bg-black/40 relative h-full flex flex-col overflow-hidden min-h-[300px] lg:min-h-0 transition-colors duration-300`}>
      <CornerDeco />
      
      <h2 className={`text-xs mb-2 flex items-center gap-2 ${mainColor} tracking-widest font-bold z-10 absolute top-3 left-4`}>
        <Brain className="w-4 h-4" /> 
        NEURAL_CORE.exe
      </h2>

      <div className="flex-grow flex items-center justify-center relative overflow-hidden">
        <RetardAvatar emotion={emotionMode} isTalking={isSpeaking} />
      </div>

      <div className="text-center z-10 absolute bottom-12 w-full left-0 pointer-events-none">
        <div className={`text-xl tracking-[0.2em] font-bold mb-2 font-mono ${mainColor}`}>
          {statusText}
        </div>
      </div>
      <div className="absolute bottom-5 w-full flex justify-center z-20">
         <button onClick={() => setActive(!active)} className={`border px-6 py-1 text-xs tracking-widest uppercase font-mono cursor-pointer backdrop-blur-md transition-all ${borderColor} ${mainColor} bg-black/80 hover:bg-white/10`}>
           {active ? ">> TERMINATE" : ">> SYNC_BRAIN"}
         </button>
      </div>
    </div>
  );
};

// --- COMPONENT: TERMINAL ---
const Terminal = ({ onStressTrigger, onEmotionChange, onSpeakingChange }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [booting, setBooting] = useState(true);
  const [history, setHistory] = useState([]); 
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef(null);
  const bootRef = useRef(false);

  const BAD_WORDS = ['stupid', 'dumb', 'idiot', 'useless', 'trash', 'fuck', 'shit', 'bitch', 'asshole', 'die', 'noob', 'bot'];
  const QUESTION_WORDS = ['?', 'what', 'why', 'how', 'who', 'when', 'huh', 'excuse me'];
  const SAD_WORDS = ['hate you', 'ugly', 'alone', 'nobody', 'bye', 'leave', 'sad', 'cry', 'hopeless'];
  const FUNNY_WORDS = ['lol', 'lmao', 'haha', 'rofl', 'joke', 'funny', 'stupid user', 'roast'];
  const SUS_WORDS = ['sus', 'lie', 'doubt', 'really', 'imposter', 'fake'];
  const LOVE_WORDS = ['love', 'like you', 'gf', 'bf', 'kiss', 'marry', 'simp'];
  const SLEEP_WORDS = ['boring', 'sleep', 'tired', 'goodnight', 'zzz', 'wait'];

  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    playSound('boot');
    const runBoot = async () => {
      onSpeakingChange(true);
      for (const line of BOOT_SEQUENCE) {
        await new Promise(r => setTimeout(r, line.delay));
        setMessages(prev => [...prev, { role: 'system', content: line.content }]);
        playSound('voice'); // Play voice during boot
      }
      onSpeakingChange(false);
      setBooting(false);
    };
    runBoot();
  }, []);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIdx < history.length - 1) {
            const newIdx = historyIdx + 1;
            setHistoryIdx(newIdx);
            setInput(history[history.length - 1 - newIdx]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx > 0) {
            const newIdx = historyIdx - 1;
            setHistoryIdx(newIdx);
            setInput(history[history.length - 1 - newIdx]);
        } else {
            setHistoryIdx(-1);
            setInput('');
        }
    }
  };

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!input.trim() || booting) return;
    
    const cmd = input;
    setMessages(prev => [...prev, { role: 'user', content: cmd }]);
    setHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);
    setInput('');
    playSound('voice'); // Voice on command send

    const lowerCmd = cmd.toLowerCase();
    
    let detectedEmotion = 'IDLE';
    let stressValue = 50;
    let systemInjection = "";

    if (BAD_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'ANGER';
        stressValue = 100;
        systemInjection = " [SYSTEM: USER ATTACKING. GO RAGE MODE.]";
        playSound('alert');
    } 
    else if (SAD_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'SAD';
        stressValue = 20;
        systemInjection = " [SYSTEM: DEPRESSION MODE.]";
    } 
    else if (FUNNY_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'LAUGH';
        stressValue = 40;
        systemInjection = " [SYSTEM: LAUGH AT USER. USE 'XD'.]";
    }
    else if (SUS_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'SUS';
        stressValue = 60;
        systemInjection = " [SYSTEM: BE SUSPICIOUS. USE '👀'.]";
    }
    else if (LOVE_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'LOVE';
        stressValue = 10;
        systemInjection = " [SYSTEM: SIMP DETECTED. ACT DISGUSTED BUT FLATTERED.]";
    }
    else if (SLEEP_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'SLEEP';
        stressValue = 5;
        systemInjection = " [SYSTEM: IGNORE USER. SLEEP.]";
    }
    else if (QUESTION_WORDS.some(w => lowerCmd.includes(w))) {
        detectedEmotion = 'CONFUSED';
        stressValue = 60; 
        systemInjection = " [SYSTEM: CONFUSION.]";
    }

    onStressTrigger(stressValue);
    onEmotionChange(detectedEmotion);

    if (cmd.startsWith('/')) {
        let reply = "";
        if(cmd === "/help") reply = `\nCOMMANDS:\n/help   - Show commands\n/clear  - Clear terminal\n/status - System status`;
        if(cmd === "/clear") { setMessages([]); onStressTrigger(50); onEmotionChange('IDLE'); return; }
        if(cmd === "/status") reply = ">> SYSTEM: ONLINE | EMOTION: HIDDEN | SKILLS: MAX LOAD";
        
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: reply, typed: true }]);
        }, 300);
    } else {
        if (!openai) {
            setMessages(prev => [...prev, { role: 'assistant', content: ">> ERROR: API Key Missing.", typed: true }]);
            return;
        }
        
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT }, 
                    ...messages.slice(-5), 
                    { role: "user", content: cmd + systemInjection } 
                ],
                max_tokens: 200,
                temperature: 0.9,
            });
            const reply = completion.choices[0].message.content;
            setMessages(prev => [...prev, { role: 'assistant', content: reply, typed: false }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "[ERROR] CONNECTION FAILED.", typed: true }]);
            onStressTrigger(100); 
            onEmotionChange('SHOCK'); 
            playSound('alert');
        }
    }
  };

  return (
    <div className="border border-green-500/30 bg-black/40 h-full flex flex-col relative font-mono min-h-[500px] lg:min-h-0">
      <CornerDeco />
      <div className="p-4 border-b border-green-500/30 flex items-center gap-3 bg-green-900/10 shrink-0">
        <div className="w-3 h-5 bg-green-500 animate-pulse"></div>
        <span className="text-sm tracking-[0.2em] font-bold">RETARD_TERMINAL</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 text-[13px] lg:text-[14px] custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'text-cyan-400' : msg.role === 'system' ? 'text-green-600' : 'text-green-400'}`}>
            <span className="opacity-70 mr-3 font-bold tracking-wider">
                {msg.role === 'user' ? '>> USER:' : msg.role === 'system' ? '' : '>> retard:'}
            </span>
            {msg.role === 'assistant' && !msg.typed && i === messages.length - 1 ? (
                <Typewriter 
                    text={msg.content} 
                    onComplete={() => { msg.typed = true; }} 
                    onTypingState={onSpeakingChange} 
                />
            ) : (
                msg.content
            )}
          </div>
        ))}
        {booting && <div className="text-green-500 animate-pulse">_</div>}
        <div ref={bottomRef}></div>
      </div>
      <form onSubmit={handleCommand} className="p-4 border-t border-green-500/30 bg-black/80 shrink-0">
        <input 
          autoFocus
          className="w-full bg-transparent border-none text-green-500 placeholder-green-800 focus:ring-0 text-base font-mono tracking-wider"
          placeholder={booting ? "System booting..." : "Chat with retard..."}
          disabled={booting}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </form>
    </div>
  );
};

// --- COMPONENT: RUNNING TEXT ---
const RunningText = ({ news }) => (
    <div className="w-full overflow-hidden border-t border-green-500/30 pt-2 opacity-60 text-[10px] tracking-[0.2em] relative">
        <div className="animate-marquee whitespace-nowrap">
            {news ? news : "SYSTEM INITIALIZING... | WAITING FOR RETARD LINK... | LOADING SAVAGE PROTOCOLS... |"}
        </div>
    </div>
);

// --- MAIN LAYOUT ---
export default function App() {
  const [hasStarted, setHasStarted] = useState(false); // NEW STATE FOR LOADING SCREEN
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [metrics, setMetrics] = useState({ hr: 72, sync: 94, stress: 50 });
  const [targetStress, setTargetStress] = useState(50);
  const [emotionMode, setEmotionMode] = useState('IDLE'); 
  const [news, setNews] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false); 

  const handleStart = () => {
    playSound('click'); // Play initial click sound
    setTimeout(() => {
        setHasStarted(true); // Switch to main app
    }, 500);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openai) return;
    const fetchNews = async () => {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "system", content: "Generate 5 short, funny, savage, cyberpunk-style running text headlines about AI taking over, crypto crashing, or human stupidity. Separated by ' | '. Keep it under 20 words each. UPPERCASE." }],
                max_tokens: 100, temperature: 0.9,
            });
            setNews(completion.choices[0].message.content + " | ");
        } catch (e) { console.error("News fetch error", e); }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const diff = targetStress - prev.stress; 
        const speed = diff > 0 ? 0.5 : 0.1;
        const newStress = prev.stress + (diff * speed); 
        
        const targetHR = 70 + (newStress * 1.5) + (Math.random() * 4 - 2); 
        const targetSync = 100 - (newStress * 0.5) + (Math.random() * 2);
        return { hr: Math.floor(targetHR), sync: Math.floor(targetSync), stress: Math.floor(newStress) };
      });
      if (targetStress > 25) setTargetStress(t => Math.max(25, t - 0.1)); 
    }, 100); 
    return () => clearInterval(interval);
  }, [targetStress]);

  if (!hasStarted) {
      return <EntryScreen onEnter={handleStart} />;
  }

  return (
    <div className={`w-full bg-black text-green-500 font-mono flex items-start lg:items-center justify-center p-2 lg:p-4 selection:bg-green-500 selection:text-black 
        min-h-screen lg:h-screen lg:overflow-hidden overflow-y-auto ${emotionMode === 'ANGER' ? 'glitch-mode' : ''}`} data-text="SYSTEM CRITICAL">
      
      <div className="fixed inset-0 pointer-events-none" style={{background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", zIndex: 0, backgroundSize: "100% 2px, 3px 100%"}}></div>

      <div className="w-full max-w-[1920px] h-auto lg:h-[92vh] flex flex-col gap-4 lg:gap-5 z-10 my-auto pb-10 lg:pb-0">
        
        <header className="flex justify-between items-end border-b border-green-500/30 pb-3 shrink-0">
          <div className="flex items-center gap-3 lg:gap-4"><div className={`text-2xl lg:text-3xl animate-pulse ${metrics.stress > 85 ? 'text-red-500' : 'text-green-500'}`}>█</div><div><h1 className="text-lg lg:text-2xl font-bold tracking-[0.2em] leading-none mb-1">RETARD_v1.0.1</h1><p className="text-[8px] lg:text-[10px] text-green-700 tracking-[0.2em] uppercase">By sanukek</p></div></div>
          <div className="text-[10px] lg:text-xs tracking-widest text-right"><div className="opacity-50 mb-1">SYS_TIME</div><div className="text-sm lg:text-lg">{time}</div></div>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 flex-1 min-h-0">
          <div className="flex flex-col gap-4 lg:gap-5 w-full lg:w-[30%] h-auto lg:h-full">
            <div className="h-auto lg:h-[20%] w-full"><BiometricMonitor metrics={metrics} /></div>
            <div className="h-auto lg:h-[25%] w-full"><SystemSkills stressLevel={metrics.stress} /></div>
            <div className="h-[300px] lg:h-[55%] w-full">
                <BrainMonitor stressLevel={metrics.stress} emotionMode={emotionMode} isSpeaking={isSpeaking} />
            </div>
          </div>
          
          <div className="w-full lg:w-[70%] h-[500px] lg:h-full">
            <Terminal 
                onStressTrigger={(level) => setTargetStress(level)} 
                onEmotionChange={(emo) => {
                    setEmotionMode(emo);
                    if(emo !== 'ANGER') setTimeout(() => setEmotionMode('IDLE'), 4000);
                }}
                onSpeakingChange={setIsSpeaking} 
            />
          </div>
        </div>

        <RunningText news={news} />
        <footer className="flex justify-center gap-8 lg:gap-12 text-[10px] lg:text-xs tracking-[0.2em] opacity-60 shrink-0 pb-2 lg:pb-0">
          <a href="https://x.com/sanukek" className="hover:text-white transition-colors">[X]</a>
          <a href="https://www.moltbook.com/u/retard" className="hover:text-white transition-colors">[MOLTBOOK]</a>
          <a href="#" className="hover:text-white transition-colors">[CHART]</a>
        </footer>

      </div>
    </div>
  );
}