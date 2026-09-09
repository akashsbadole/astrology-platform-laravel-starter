const RASHI_SYMBOLS = [
    { symbol: '♈', name: 'Mesha', color: 'text-red-400' },
    { symbol: '♉', name: 'Vrishabha', color: 'text-green-400' },
    { symbol: '♊', name: 'Mithuna', color: 'text-yellow-400' },
    { symbol: '♋', name: 'Karka', color: 'text-blue-300' },
    { symbol: '♌', name: 'Simha', color: 'text-orange-400' },
    { symbol: '♍', name: 'Kanya', color: 'text-emerald-300' },
    { symbol: '♎', name: 'Tula', color: 'text-pink-400' },
    { symbol: '♏', name: 'Vrishchika', color: 'text-red-500' },
    { symbol: '♐', name: 'Dhanu', color: 'text-purple-400' },
    { symbol: '♑', name: 'Makara', color: 'text-gray-300' },
    { symbol: '♒', name: 'Kumbha', color: 'text-cyan-400' },
    { symbol: '♓', name: 'Meena', color: 'text-indigo-400' },
];

export default function RashiOrbit() {
    return (
        <div className="relative mx-auto h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] md:h-[500px] md:w-[500px]">
            <div className="absolute inset-0 rounded-full border border-white/10 bg-gradient-to-b from-transparent to-black/40 backdrop-blur-sm" />

            <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 shadow-[0_0_40px_rgba(251,191,36,0.6)] sm:h-20 sm:w-20 md:h-24 md:w-24" />

            <div className="absolute inset-0 animate-[spin_60s_linear_infinite]">
                {RASHI_SYMBOLS.map((rashi, index) => {
                    const angle = (index / RASHI_SYMBOLS.length) * 360;
                    const radius = 42;
                    const left =
                        50 + radius * Math.cos((angle * Math.PI) / 180);
                    const top = 50 + radius * Math.sin((angle * Math.PI) / 180);

                    return (
                        <div
                            key={rashi.name}
                            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                            style={{
                                left: `${left}%`,
                                top: `${top}%`,
                            }}
                        >
                            <span
                                className={`text-2xl drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] sm:text-3xl md:text-4xl ${rashi.color}`}
                            >
                                {rashi.symbol}
                            </span>
                            <span className="mt-1 text-[10px] text-white/70 sm:text-xs">
                                {rashi.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
