"use client";

import { useState, useMemo } from "react";
import { type Project } from "@/lib/types";
import { collectionsFor } from "@/lib/project-taxonomy";
import FilterBar from "./FilterBar";
import BookGrid from "./BookGrid";

type SortKey = "featured" | "newest" | "location" | "collection";

interface CaseStudiesClientProps {
  projects: Project[];
  /** Filter preselected from the URL (?collection=…). */
  initialCollection?: string;
}

const memberships = (p: Project) => p.collections ?? collectionsFor(p);

export default function CaseStudiesClient({ projects, initialCollection }: CaseStudiesClientProps) {
  const [activeCollection, setActiveCollection] = useState(initialCollection ?? "All Collections");
  const [activeCity, setActiveCity] = useState("All Locations");
  const [activeSort, setActiveSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    let result = [...projects];

    if (activeCollection !== "All Collections") {
      // a project can live in more than one collection
      result = result.filter((p) => memberships(p).includes(activeCollection as never));
    }
    if (activeCity !== "All Locations") {
      result = result.filter((p) => p.city === activeCity);
    }

    switch (activeSort) {
      case "featured":
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "newest":
        result.sort((a, b) => b.year.localeCompare(a.year));
        break;
      case "location":
        result.sort((a, b) => a.city.localeCompare(b.city));
        break;
      case "collection":
        result.sort((a, b) => (memberships(a)[0] ?? "").localeCompare(memberships(b)[0] ?? ""));
        break;
    }

    return result;
  }, [projects, activeCollection, activeCity, activeSort]);

  return (
    <>
      <FilterBar
        projects={projects}
        activeCollection={activeCollection}
        activeCity={activeCity}
        activeSort={activeSort}
        onCollectionChange={setActiveCollection}
        onCityChange={setActiveCity}
        onSortChange={setActiveSort}
        filteredCount={filtered.length}
      />
      <div className="page-x section-y">
        <BookGrid projects={filtered} />
      </div>
    </>
  );
}
