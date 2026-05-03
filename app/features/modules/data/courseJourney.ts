type CourseJourneyParams = {
  moduleTitle: string;
  courseTitle: string;
  objective: string;
};

export type CourseJourneyContent = {
  introductionTitle: string;
  introductionParagraphs: string[];
  takeawayTitle: string;
  takeawayBullets: string[];
};

export function buildCourseJourneyContent({
  moduleTitle,
  courseTitle,
  objective,
}: CourseJourneyParams): CourseJourneyContent {
  const moduleLabel = moduleTitle.toLowerCase();
  const courseLabel = courseTitle.toLowerCase();

  return {
    introductionTitle: `Introduction de ${courseTitle}`,
    introductionParagraphs: [
      `Ce cours s'inscrit dans le module ${moduleTitle} et présente les réflexes à adopter avant d'agir.`,
      `Le sujet de ${courseLabel} revient souvent dans des situations très concrètes: message inattendu, lien douteux, demande pressante ou partage d'information sensible.`,
      `L'objectif est de transformer ces situations en automatismes simples pour mieux protéger votre environnement ${moduleLabel}.`,
    ],
    takeawayTitle: "À retenir",
    takeawayBullets: [
      objective,
      `Prendre le temps d'analyser le contexte avant de cliquer ou de partager.`,
      `Quand un doute persiste, vérifier la source ou demander une validation.`,
    ],
  };
}
