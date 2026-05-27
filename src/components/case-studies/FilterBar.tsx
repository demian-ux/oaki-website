"use client";

import { type Project } from "@/lib/types";
import SectionLabel from "@/components/global/SectionLabel";

type SortKey = "featured" | "newest" | "location" | "type";

interface FilterBarProps {
  projects: Project[];
  activeType: string;
  activeCity: string;
  activeGoal: string;
  activeSort: SortKey;
  onTypeChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onGoalChange: (v: string) => void;
  onSortChange: (v: SortKey) => void;
  filteredCount: number;
}

const SELECT_BASE =
  "text-meta bg-paper border border-line px-3 py-2 pr-8 appearance-none cursor-pointer hover:border-ink transition-colors duration-200 focus:outline-none focus:border-ink";

export default function FilterBar({
  projects,
  activeType,
  activeCity,
  activeGoal,
  activeSort,
  onTypeChange,
  onCityChange,
  onGoalChange,
  onSortChange,
  filteredCount,
}: FilterBarProps) {
  const types = ["All", ...Array.from(new Set(projects.map((p) => p.projectType ?? "").filter(Boolean))).sort()];
  const cities = ["All Locations", ...Array.from(new Set(projects.map((p) => p.city))).sort()];
  const goals = ["All Goals", ...Array.from(new Set(projects.map((p) => p.mainGoal))).sort()];

  return (
    <div className="border-b border-line page-x py-4">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SectionLabel as="span">Filter</SectionLabel>

          <div className="relative">
            <select
              className={SELECT_BASE}
              value={activeType}
              onChange={(e) => onTypeChange(e.target.value)}
              aria-label="Filter by type"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              className={SELECT_BASE}
              value={activeCity}
              onChange={(e) => onCityChange(e.target.value)}
              aria-label="Filter by location"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              className={SELECT_BASE}
              value={activeGoal}
              onChange={(e) => onGoalChange(e.target.value)}
              aria-label="Filter by goal"
            >
              {goals.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              className={SELECT_BASE}
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              aria-label="Sort projects"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="location">Location</option>
              <option value="type">Project Type</option>
            </select>
          </div>

          <span className="text-meta text-muted shrink-0">
            {filteredCount} {filteredCount === 1 ? "Case Study" : "Case Studies"}
          </span>
        </div>
      </div>
    </div>
  );
}
