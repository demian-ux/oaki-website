"use client";

import { type Project } from "@/lib/types";
import SectionLabel from "@/components/global/SectionLabel";
import { COLLECTIONS, collectionsFor } from "@/lib/project-taxonomy";

type SortKey = "featured" | "newest" | "location" | "collection";

interface FilterBarProps {
  projects: Project[];
  activeCollection: string;
  activeCity: string;
  activeSort: SortKey;
  onCollectionChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSortChange: (v: SortKey) => void;
  filteredCount: number;
}

const SELECT_BASE =
  "filter-select w-full min-w-0 md:w-auto bg-paper border border-line px-2 pr-6 md:px-3 md:pr-8 py-2 appearance-none cursor-pointer hover:border-ink transition-colors duration-200 focus:outline-none focus:border-ink";

export default function FilterBar({
  projects,
  activeCollection,
  activeCity,
  activeSort,
  onCollectionChange,
  onCityChange,
  onSortChange,
  filteredCount,
}: FilterBarProps) {
  // Only collections that have at least one project, in canonical order.
  const present = new Set(projects.flatMap((p) => p.collections ?? collectionsFor(p)));
  const collections = ["All Collections", ...COLLECTIONS.filter((c) => present.has(c))];
  const cities = ["All Locations", ...Array.from(new Set(projects.map((p) => p.city).filter(Boolean))).sort()];

  return (
    <div className="border-b border-line page-x py-4">
      {/* Phones: a 2-column grid, two rows: collection + location, then the
          sort select with the count beside it ("All Collections" at the 16px
          iOS needs does not fit three across a 375px screen). The Filter
          eyebrow only shows from md, where the two groups return: label +
          collection + location left, sort + count right. */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 md:flex md:flex-wrap md:items-center md:gap-4 md:justify-between">
        <div className="contents md:flex md:flex-wrap md:items-center md:gap-3">
          <SectionLabel as="span" className="hidden md:inline">Filter</SectionLabel>

          <div className="relative">
            <select
              className={SELECT_BASE}
              value={activeCollection}
              onChange={(e) => onCollectionChange(e.target.value)}
              aria-label="Filter by collection"
            >
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c}
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
        </div>

        <div className="contents md:flex md:items-center md:gap-4">
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
              <option value="collection">Collection</option>
            </select>
          </div>

          <span className="text-meta text-muted shrink-0 self-center text-right md:text-left">
            {filteredCount} {filteredCount === 1 ? "Case Study" : "Case Studies"}
          </span>
        </div>
      </div>
    </div>
  );
}
