import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMixtape } from "@/lib/db";
import { TapeView } from "@/components/TapeView";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const mixtape = await getMixtape(id);

  if (!mixtape) {
    return { title: "Tape not found" };
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return {
    title: mixtape.title,
    description: mixtape.note || "A mixtape made with Mixtape & Static.",
    openGraph: {
      title: mixtape.title,
      description: mixtape.note || "A mixtape made with Mixtape & Static.",
      url: `${base}/tape/${mixtape.id}`,
      siteName: "Mixtape & Static",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: mixtape.title,
      description: mixtape.note || "A mixtape made with Mixtape & Static.",
    },
  };
}

export default async function TapePage({ params }: Props) {
  const { id } = await params;
  const mixtape = await getMixtape(id);

  if (!mixtape) {
    notFound();
  }

  return <TapeView mixtape={mixtape} />;
}
