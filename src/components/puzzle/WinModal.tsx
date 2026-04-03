import { Check, Copy, Flower2, Sprout, Star } from "lucide-react";
import { useState } from "react";

import { t } from "@/lib/i18n";
import type { PuzzleDifficulty } from "@/models/puzzle.models";

interface WinModalProps {
  moves: number;
  difficulty: PuzzleDifficulty;
  onClose: () => void;
}

export default function WinModal({ moves, difficulty, onClose }: WinModalProps) {
  const tier = Number(difficulty);
  const difficultyName = t(`difficulty.${difficulty}`);
  const [copied, setCopied] = useState(false);

  const shareText = [
    `${t("win.shareLabel")}`,
    `${"★".repeat(tier)}${"☆".repeat(5 - tier)} ${difficultyName}`,
    `${t("win.shareMoves", { moves: String(moves) })} · plotty.app`,
  ].join("\n");

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 backdrop-blur-[4px]"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="document"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className="bg-parchment rounded-3xl py-9 px-7 max-w-[340px] w-[90%] text-center shadow-[0_20px_60px_#00000030] animate-[pop-in_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]"
      >
        <div className="flex justify-center mb-2">
          <Flower2 size={48} className="text-sage" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-3xl text-soil font-bold m-0 mb-1">{t("win.title")}</h2>
        <p className="font-body text-base text-loam m-0 mb-1">{t("win.bodyLine1")}</p>
        <p className="font-body text-base text-loam m-0 mb-5">
          {t("win.bodyLine2", { moves: String(moves) })}
        </p>
        <div className="flex gap-1.5 justify-center mb-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={24}
              className={i <= tier ? "text-amber-500" : "text-loam/20"}
              fill={i <= tier ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          ))}
        </div>
        <div className="bg-cream rounded-xl py-3 px-4 font-mono text-sm lg:text-base text-soil mb-3 leading-6 lg:leading-7 tracking-[0.5px]">
          <span className="inline-flex items-center gap-1">
            <Sprout size={14} className="text-sage" strokeWidth={2} />
            {t("win.shareLabel")}
          </span>
          <br />
          {"★".repeat(tier)}
          {"☆".repeat(5 - tier)} {difficultyName}
          <br />
          {t("win.shareMoves", { moves: String(moves) })} · plotty.app
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="font-body text-base font-semibold bg-sage text-white border-none rounded-[10px] py-3 px-8 cursor-pointer w-full flex items-center justify-center gap-2 mb-2"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? t("win.copied") : t("win.copyShare")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="font-body text-base font-semibold bg-transparent text-loam border-none rounded-[10px] py-2.5 px-8 cursor-pointer"
        >
          {t("win.done")}
        </button>
      </div>
    </div>
  );
}
