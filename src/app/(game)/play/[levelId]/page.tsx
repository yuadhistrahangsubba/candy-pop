import { notFound } from "next/navigation";
import { getLevelById } from "@/levels";
import { PlayClient } from "./PlayClient";

export default async function PlayPage({ params }: { params: Promise<{ levelId: string }> }) {
  const { levelId } = await params;
  const level = getLevelById(levelId);
  if (!level) notFound();

  return <PlayClient level={level} />;
}
