import { type Project } from "@/lib/types";
import BookCard from "./BookCard";

interface BookGridProps {
  projects: Project[];
  className?: string;
}

export default function BookGrid({ projects, className = "" }: BookGridProps) {
  if (projects.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-meta text-muted">No projects found.</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14 lg:gap-x-16 lg:gap-y-20 ${className}`}
    >
      {projects.map((project) => (
        <BookCard key={project._id} project={project} />
      ))}
    </div>
  );
}
