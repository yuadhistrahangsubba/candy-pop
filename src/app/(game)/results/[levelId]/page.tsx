import { notFound } from "next/navigation";
import { getLevelById, getNextLevelId } from "@/levels";
import { ResultsClient } from "./ResultsClient";

interface ResultsPageProps {
  params: Promise<{ levelId: string }>;
  searchParams: Promise<{ score?: string; stars?: string; won?: string }>;
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { levelId } = await params;
  const level = getLevelById(levelId);
  if (!level) notFound();

  const query = await searchParams;
  const score = Number(query.score ?? 0);
  const stars = Math.max(0, Math.min(3, Number(query.stars ?? 0)));
  const won = query.won === "1";
  const nextLevelId = won ? getNextLevelId(levelId) : undefined;

  return (
    <ResultsClient
      levelId={levelId}
      levelName={level.name}
      score={score}
      stars={stars}
      won={won}
      nextLevelId={nextLevelId}
    />
  );
}
