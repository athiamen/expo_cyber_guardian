export type CourseSection = {
  id: string;
  label: string;
  title: string;
  body: string;
  development: string[];
  takeaway: string[];
};

type BuildCourseSectionsParams = {
  moduleTitle: string;
  courseTitle: string;
  objective: string;
};

const COURSE_SECTION_TEMPLATES = [
  {
    id: 'S1',
    label: 'Introduction',
    title: 'Pourquoi {{courseTitleLower}} est important',
    body: 'Cette partie pose le contexte du module {{moduleTitleLower}} et explique pourquoi ce sujet revient dans les situations numériques du quotidien.',
    development: [
      'Dans la pratique, {{courseTitleLower}} ne concerne pas uniquement les experts. Chaque utilisateur est confronté à des décisions simples mais sensibles : ouvrir un lien, partager une information, installer un outil ou répondre à une demande urgente.',
      'Le but de cette introduction est de montrer que le risque apparaît souvent dans des situations ordinaires. Plus le contexte semble banal, plus il est facile d\'agir trop vite. C\'est justement pour cela que ce cours insistera sur les bons réflexes avant l\'action.',
      'En comprenant pourquoi ce sujet est important, vous pouvez relier le contenu du cours à vos usages quotidiens et mieux anticiper les erreurs fréquentes.',
    ],
    takeaway: [
      '{{objective}}',
      'Le module {{moduleTitleLower}} répond à des situations réelles que l\'on peut rencontrer en ligne.',
      'Comprendre le contexte permet de mieux reconnaître le risque avant d\'agir.',
    ],
  },
  {
    id: 'S2',
    label: 'Observation',
    title: 'Identifier les signaux utiles',
    body: 'Vous observez ici les indices concrets à repérer avant d\'agir : contexte, niveau de risque, information demandée et bonne posture à adopter.',
    development: [
      'Observer une situation numérique signifie prendre quelques secondes pour analyser ce qui se passe réellement. Qui vous contacte ? Que demande-t-on exactement ? Pourquoi maintenant ? Ces trois questions suffisent souvent à faire apparaître une incohérence ou une tentative de pression.',
      'Un message frauduleux cherche souvent à provoquer une réaction rapide : peur, curiosité, urgence ou confiance excessive. Le bon réflexe consiste à ralentir, vérifier la source et comparer la demande avec ce qui est habituel dans votre environnement.',
      'Cette phase d\'observation est essentielle car elle évite de répondre de façon automatique. Elle transforme une intuition floue en vérification concrète.',
    ],
    takeaway: [
      'Avant toute action, vérifier l\'intention du message et la source.',
      'Se demander quelles données sont demandées ou potentiellement exposées.',
      'Un doute doit ralentir la décision, jamais accélérer le clic.',
    ],
  },
  {
    id: 'S3',
    label: 'Pratique',
    title: 'Mettre en application avec des cas réels',
    body: 'Le cours transforme les notions en réflexes pratiques avec des exemples simples : que faire, quoi éviter, quand demander de l\'aide.',
    development: [
      'La mise en pratique consiste à traduire les principes vus plus haut en actions concrètes. Face à un doute, il faut savoir choisir entre vérifier, ignorer, signaler ou demander une validation. Cette décision doit être simple, reproductible et facile à mémoriser.',
      'Les cas réels ont pour objectif de montrer qu une bonne réponse n\'est pas toujours technique. Souvent, la meilleure action est organisationnelle : ne pas cliquer, passer par un canal connu, demander une confirmation ou transmettre l\'information à la bonne personne.',
      'Avec l\'entraînement, ces choix deviennent des automatismes. Le cours cherche donc moins à faire apprendre une liste par cœur qu à installer une méthode de décision fiable.',
    ],
    takeaway: [
      'La meilleure défense vient souvent d une décision simple prise au bon moment.',
      'Ignorer, vérifier ou demander de l\'aide est parfois plus utile que répondre.',
      'Les bons réflexes se construisent avec des actions répétables et faciles à mémoriser.',
    ],
  },
  {
    id: 'S4',
    label: 'Validation',
    title: 'Retenir la checklist finale',
    body: 'Cette dernière étape consolide les acquis avant le quiz en résumant les actions prioritaires et les erreurs à ne plus reproduire.',
    development: [
      'Avant de terminer, il est utile de reformuler les étapes essentielles sous forme de checklist mentale. Une checklist efficace doit rester courte : observer, vérifier, évaluer le risque, puis agir de façon prudente. Si une situation reste confuse, il vaut mieux demander une aide complémentaire.',
      'La validation permet aussi d\'identifier les erreurs classiques à éviter : cliquer trop vite, faire confiance à une apparence rassurante, partager une information sans contrôle ou ignorer un signal d\'alerte pourtant visible.',
      'Cette synthèse finale prépare directement au quiz. Elle vous aide à passer d\'une compréhension passive du cours à une capacité de réponse active face à des scénarios concrets.',
    ],
    takeaway: [
      'Observer la situation avant de cliquer ou de partager une information.',
      'Vérifier la source, la demande et le niveau de risque.',
      'Agir prudemment puis valider les acquis avec le quiz du module.',
    ],
  },
] as const;

function interpolate(value: string, params: Record<string, string>) {
  return Object.entries(params).reduce((acc, [key, replacement]) => {
    return acc.replaceAll(`{{${key}}}`, replacement);
  }, value);
}

export function getCourseSections(params: BuildCourseSectionsParams): CourseSection[] {
  const interpolationMap = {
    moduleTitleLower: params.moduleTitle.toLowerCase(),
    courseTitleLower: params.courseTitle.toLowerCase(),
    objective: params.objective,
  };

  return COURSE_SECTION_TEMPLATES.map((template) => ({
    id: template.id,
    label: interpolate(template.label, interpolationMap),
    title: interpolate(template.title, interpolationMap),
    body: interpolate(template.body, interpolationMap),
    development: template.development.map((item) => interpolate(item, interpolationMap)),
    takeaway: template.takeaway.map((item) => interpolate(item, interpolationMap)),
  }));
}
