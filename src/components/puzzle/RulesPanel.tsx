import { ArrowUp, ChevronDown, Frown, MapPin, Moon, Smile, Sprout, Sun } from "lucide-react";
import { t } from "@/lib/i18n";
import { PLANT_RULES, PLANTS } from "@/lib/plants";
import type { ConstraintType, PlantType } from "@/models/puzzle.models";

interface RulesPanelProps {
  expanded: boolean;
  onToggle: () => void;
}

const ruleIconSize = 14;

function RuleIcon({ type }: { type: ConstraintType }) {
  switch (type) {
    case "trait":
      return <ArrowUp size={ruleIconSize} className="text-terracotta" />;
    case "companion":
      return <Smile size={ruleIconSize} className="text-sage-dark" />;
    case "antagonist":
      return <Frown size={ruleIconSize} className="text-error" />;
    case "shade":
      return <Moon size={ruleIconSize} className="text-loam" />;
    case "position":
      return <MapPin size={ruleIconSize} className="text-loam" />;
  }
}

export default function RulesPanel({ expanded, onToggle }: RulesPanelProps) {
  const plantTypes = Object.keys(PLANTS) as PlantType[];

  return (
    <div className="bg-cream rounded-2xl overflow-hidden border-[1.5px] border-cream-dark">
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-3.5 px-4 bg-transparent border-none cursor-pointer flex items-center justify-between font-display text-base text-soil font-semibold"
      >
        <span className="inline-flex items-center gap-1.5">
          <Sprout size={18} className="text-sage" /> {t("rules.title")}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      {expanded && (
        <div className="px-4 pb-3.5 flex flex-col gap-2.5">
          {plantTypes.map((type) => {
            const plant = PLANTS[type];
            const rules = PLANT_RULES[type];
            return (
              <div key={type} className="flex items-start gap-2.5">
                <span className="text-2xl leading-7">{plant.emoji}</span>
                <div>
                  <span className="font-body text-[15px] font-semibold text-soil">
                    {t(plant.nameKey)}
                  </span>
                  <div className="font-body text-sm text-loam leading-5 mt-0.5 flex flex-wrap items-center gap-x-0.5">
                    {rules.map((rule, i) => (
                      <span key={rule.labelKey} className="inline-flex items-center gap-1">
                        <RuleIcon type={rule.type} />
                        <span>{t(rule.labelKey)}</span>
                        {i < rules.length - 1 && (
                          <span className="mx-1 text-[#ccc]">{"\u00B7"}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mt-1 py-2 px-3 bg-sun/15 rounded-[10px] font-body text-sm text-loam leading-5 inline-flex items-start gap-1.5">
            <Sun size={16} className="text-[#C8960A] shrink-0 mt-0.5" />
            <span>{t("rules.sunlightExplanation")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
