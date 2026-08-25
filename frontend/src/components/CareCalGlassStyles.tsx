import { GLASS_BORDER, EASE_OUT, C } from "@/lib/carecalTheme";

export default function CareCalGlassStyles() {
  return (
    <style>{`
      @keyframes carecalPop { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
      @keyframes carecalSpin { to { transform: rotate(360deg); } }
      @keyframes carecalSlideLeft { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes carecalSlideRight { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes carecalPopIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      @keyframes carecalFloat { 0%, 100% { transform: translate3d(0, 0, 0) scale(1); } 50% { transform: translate3d(20px, -30px, 0) scale(1.08); } }
      @keyframes carecalShimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(220%); } }
      @keyframes carecalGlow {
        0%, 100% {
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.9);
        }
        50% {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.35), inset 0 1px 3px rgba(255, 255, 255, 1);
        }
      }

      @keyframes liquidGlassGlint {
        0% { transform: translateX(-110%) translateY(-110%) rotate(35deg); }
        35%, 100% { transform: translateX(110%) translateY(110%) rotate(35deg); }
      }

      .carecal-glass {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(16px) saturate(140%);
        -webkit-backdrop-filter: blur(16px) saturate(140%);
        border: 1px solid ${GLASS_BORDER};
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
      }

      .liquid-glass-circle {
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        border-radius: 9999px;
        transition: all 400ms ${EASE_OUT};
      }

      .liquid-glass-circle::after {
        content: "";
        position: absolute;
        top: -60%;
        left: -60%;
        width: 220%;
        height: 220%;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0) 30%,
          rgba(255, 255, 255, 0.85) 50%,
          rgba(255, 255, 255, 0) 70%
        );
        pointer-events: none;
        animation: liquidGlassGlint 3.8s ease-in-out infinite;
      }

      .liquid-glass-active {
        background: rgba(16, 185, 129, 0.08) !important;
        border: 1px solid ${C.borderHover} !important;
        color: ${C.accentDark} !important;
        animation: carecalGlow 3s ease-in-out infinite;
      }

      .liquid-glass-inactive {
        background: rgba(248, 250, 252, 0.9) !important;
        border: 1px solid ${GLASS_BORDER} !important;
        color: ${C.textMuted} !important;
      }

      .carecal-shine { position: relative; overflow: hidden; isolation: isolate; }
      .carecal-shine::after {
        content: "";
        position: absolute; top: 0; left: 0; bottom: 0; width: 40%;
        background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
        transform: translateX(-120%);
        pointer-events: none;
      }
      .carecal-shine:hover::after { animation: carecalShimmer 900ms ${EASE_OUT}; }

      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  );
}
