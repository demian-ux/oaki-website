"use client";

import { useState, useMemo } from "react";
import { type Project } from "@/lib/types";
import FilterBar from "./FilterBar";
import BookGrid from "./BookGrid";

type SortKey = "featured" | "newest" | "location" | "type";

interface CaseStudiesClientProps {
  projects: Project[];
}

export default function CaseStudiesClient({ projects }: CaseStudiesClientProps) {
  const [activeType, setActiveType] = useState("All");
  const [activeCity, setActiveCity] = useState("All Locations");
  const [activeGoal, setActiveGoal] = useState("All Goals");
  const [activeSort, setActiveSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    let result = [...projects];

    if (activeType !== "All") {
      result = result.filter((p) => p.projectType === activeType);
    }
    if (activeCity !== "All Locations") {
      result = result.filter((p) => p.city === activeCity);
    }
    if (activeGoal !== "All Goals") {
      result = result.filter((p) => p.mainGoal === activeGoal);
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
      case "type":
        result.sort((a, b) => (a.projectType ?? "").localeCompare(b.projectType ?? ""));
        break;
    }

    return result;
  }, [projects, activeType, activeCity, activeGoal, activeSort]);

  return (
    <>
      <FilterBar
        projects={projects}
        activeType={activeType}
        activeCity={activeCity}
        activeGoal={activeGoal}
        activeSort={activeSort}
        onTypeChange={setActiveType}
        onCityChange={setActiveCity}
        onGoalChange={setActiveGoal}
        onSortChange={setActiveSort}
        filteredCount={filtered.length}
      />
      <div className="page-x section-y">
        <BookGrid projects={filtered} />
      </div>
    </>
  );
}
