import { ArrowUp, Frown, MapPin, Moon, Smile } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TranslationKey } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { PLANT_RULES, PLANTS } from "@/lib/plants";
import type { Constraint, ConstraintType, PlantType } from "@/models/puzzle.models";

interface ConstraintChecklistProps {
  constraints: Constraint[];
  plant: PlantType | null;
  focusedCell: [number, number] | null;
  previewPlant: PlantType | null;
}

function ConstraintTypeIcon({ type, size = 18 }: { type: ConstraintType; size?: number }) {
  switch (type) {
    case "companion":
      return <Smile size={size} />;
    case "antagonist":
      return <Frown size={size} />;
    case "shade":
      return <Moon size={size} />;
    case "trait":
      return <ArrowUp size={size} />;
    case "position":
      return <MapPin size={size} />;
  }
}

function iconBgClass(type: ConstraintType, met: boolean, pending?: boolean): string {
  if (type === "trait") return "bg-terracotta";
  if (type === "shade") {
    if (met) return "bg-sage-dark";
    if (pending) return "bg-loam/50";
    return "bg-error";
  }
  return met ? "bg-sage-dark" : "bg-error";
}

function previewIconBgClass(type: ConstraintType): string {
  if (type === "trait") return "bg-terracotta";
  if (type === "companion") return "bg-sage/75";
  if (type === "shade") return "bg-loam/50";
  return "bg-error/75";
}

function tileBgClass(type: ConstraintType, met: boolean, pending?: boolean): string {
  if (type === "trait") return "bg-terracotta/[0.08]";
  if (type === "shade") {
    if (met) return "bg-sage/10";
    if (pending) return "bg-loam/[0.06]";
    return "bg-error/10";
  }
  return met ? "bg-sage/10" : "bg-error/10";
}

function previewTileBgClass(type: ConstraintType): string {
  if (type === "trait") return "bg-terracotta/[0.08]";
  if (type === "companion") return "bg-sage/10";
  if (type === "shade") return "bg-loam/[0.06]";
  return "bg-error/10";
}

function symbolForConstraint(con: Constraint): string | null {
  if (con.targetPlant) return PLANTS[con.targetPlant].emoji;
  return null;
}

// Tracks multiple expanded tiles, each with its own timer and animation key
function useExpandedTiles() {
  const [expanded, setExpanded] = useState<Record<string, number>>({});
  const [fadingIn, setFadingIn] = useState<Record<string, number>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const fadeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const toggle = useCallback((key: TranslationKey) => {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    if (fadeTimers.current[key]) clearTimeout(fadeTimers.current[key]);

    // Remove from fadingIn if re-clicked while fading in
    setFadingIn((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    setExpanded((prev) => {
      const next = { ...prev };
      next[key] = Date.now();
      return next;
    });

    timers.current[key] = setTimeout(() => {
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      delete timers.current[key];

      // Trigger fade-in for the returning icon
      const fadeKey = Date.now();
      setFadingIn((prev) => ({ ...prev, [key]: fadeKey }));
      fadeTimers.current[key] = setTimeout(() => {
        setFadingIn((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        delete fadeTimers.current[key];
      }, 400);
    }, 3000);
  }, []);

  const clearAll = useCallback(() => {
    for (const timer of Object.values(timers.current)) clearTimeout(timer);
    for (const timer of Object.values(fadeTimers.current)) clearTimeout(timer);
    timers.current = {};
    fadeTimers.current = {};
    setExpanded({});
    setFadingIn({});
  }, []);

  useEffect(() => {
    return () => {
      for (const timer of Object.values(timers.current)) clearTimeout(timer);
      for (const timer of Object.values(fadeTimers.current)) clearTimeout(timer);
    };
  }, []);

  return { expanded, fadingIn, toggle, clearAll };
}

export default function ConstraintChecklist({
  constraints,
  plant,
  focusedCell,
  previewPlant,
}: ConstraintChecklistProps) {
  const tiles = useExpandedTiles();

  // Clear all expanded tiles when the active plant changes
  const activeKey = previewPlant || plant;
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeKey triggers clear on plant change
  useEffect(() => {
    tiles.clearAll();
  }, [activeKey, tiles.clearAll]);

  // Preview mode: show generic rules for a tray plant
  if (previewPlant && !focusedCell) {
    const rules = PLANT_RULES[previewPlant];

    return (
      <div className="h-full py-2.5 px-3.5 flex flex-col">
        <div className="grid grid-cols-2 gap-1.5 flex-1 auto-rows-fr">
          {rules.map((rule) => {
            const isExpanded = rule.labelKey in tiles.expanded;
            const isFadingIn = rule.labelKey in tiles.fadingIn;
            const label = t(rule.labelKey);
            const match = label.match(/touch (\w+)|adjacent (\w+)/);
            const targetName = match ? match[1] || match[2] : null;
            const targetType = targetName
              ? (Object.keys(PLANTS) as PlantType[]).find(
                  (k) => t(PLANTS[k].nameKey) === targetName,
                )
              : null;
            const fadeInClass = isFadingIn ? "animate-[fade-in_0.4s_ease]" : "";
            return (
              <button
                type="button"
                key={rule.labelKey}
                onClick={() => tiles.toggle(rule.labelKey)}
                className={`flex items-center justify-center gap-1.5 lg:gap-2 px-2 rounded-lg cursor-pointer border-none ${previewTileBgClass(rule.type)}`}
              >
                {isExpanded ? (
                  <span
                    key={tiles.expanded[rule.labelKey]}
                    className="text-xs lg:text-sm text-soil font-body font-medium text-center animate-[fade-out_3s_ease_forwards]"
                  >
                    {label}
                  </span>
                ) : (
                  <span
                    className={`flex items-center justify-center gap-1.5 lg:gap-2 ${fadeInClass}`}
                  >
                    <span
                      className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full ${previewIconBgClass(rule.type)} text-white flex items-center justify-center shrink-0`}
                    >
                      <span className="lg:hidden">
                        <ConstraintTypeIcon type={rule.type} size={18} />
                      </span>
                      <span className="hidden lg:block">
                        <ConstraintTypeIcon type={rule.type} size={28} />
                      </span>
                    </span>
                    {targetType && (
                      <span className="text-xl lg:text-3xl">{PLANTS[targetType].emoji}</span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Empty state
  if (!plant || !focusedCell) {
    return (
      <div className="h-full flex items-center justify-center text-loam text-[15px] font-body italic opacity-60 py-2.5 px-3.5">
        {t("constraints.tapToInspect")}
      </div>
    );
  }

  // Focused cell mode
  return (
    <div className="h-full py-2.5 px-3.5 flex flex-col">
      <div className="grid grid-cols-2 gap-1.5 flex-1 auto-rows-fr">
        {constraints.map((con) => {
          const isExpanded = con.labelKey in tiles.expanded;
          const isFadingIn = con.labelKey in tiles.fadingIn;
          const fadeInClass = isFadingIn ? "animate-[fade-in_0.4s_ease]" : "";
          return (
            <button
              type="button"
              key={con.labelKey}
              onClick={() => tiles.toggle(con.labelKey)}
              className={`flex items-center justify-center gap-1.5 lg:gap-2 px-2 rounded-lg cursor-pointer border-none ${tileBgClass(con.type, con.met, con.pending)}`}
            >
              {isExpanded ? (
                <span
                  key={tiles.expanded[con.labelKey]}
                  className="text-xs lg:text-sm text-soil font-body font-medium text-center animate-[fade-out_3s_ease_forwards]"
                >
                  {t(con.labelKey)}
                </span>
              ) : (
                <span
                  className={`flex items-center justify-center gap-1.5 lg:gap-2 ${fadeInClass}`}
                >
                  <span
                    className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full ${iconBgClass(con.type, con.met, con.pending)} text-white flex items-center justify-center shrink-0`}
                  >
                    <span className="lg:hidden">
                      <ConstraintTypeIcon type={con.type} size={18} />
                    </span>
                    <span className="hidden lg:block">
                      <ConstraintTypeIcon type={con.type} size={28} />
                    </span>
                  </span>
                  {symbolForConstraint(con) && (
                    <span className="text-xl lg:text-3xl">{symbolForConstraint(con)}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
