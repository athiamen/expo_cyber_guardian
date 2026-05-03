export type ChatGuardianAction = {
  icon: string;
  label: string;
  hint: string;
};

export type ChatGuardianContact = {
  name: string;
  emoji: string;
  subtitle: string;
  threat: 'safe' | 'warning' | 'danger';
};

export type ChatGuardianScenario = {
  contactName: string;
  headline: string;
  intro: string;
  messages: Array<{ sender: string; text: string; time: string }>;
  flags: string[];
};

export const CHAT_GUARDIAN_ACTIONS: ReadonlyArray<ChatGuardianAction> = [
  { icon: '⛔', label: 'Bloquer', hint: 'Couper le contact' },
  { icon: '🚩', label: 'Signaler', hint: 'Alerter les modérateurs' },
  { icon: '📸', label: 'Capturer', hint: 'Garder des preuves' },
  { icon: '🙈', label: 'Ignorer', hint: 'Ne pas répondre' },
  { icon: '💬', label: 'Répondre', hint: 'Réponse polie' },
  { icon: '🧑‍🏫', label: 'Aide Adulte', hint: 'Demander du soutien' },
] as const;

export const CHAT_GUARDIAN_CONTACTS: ReadonlyArray<ChatGuardianContact> = [
  { name: 'PrixConcours', emoji: '🎁', subtitle: 'Gagnant du concours', threat: 'danger' },
  { name: 'Emma', emoji: '😊', subtitle: 'Ami(e) de confiance', threat: 'safe' },
  { name: 'OffreSpéciale', emoji: '🎀', subtitle: 'Offre limitée', threat: 'warning' },
  { name: 'AmiSecret', emoji: '🤫', subtitle: 'Entre nous...', threat: 'danger' },
  { name: 'BanqueSecure', emoji: '🏛️', subtitle: 'Support Bancaire', threat: 'danger' },
  { name: 'Harceleur123', emoji: '😤', subtitle: 'Conversation hostile', threat: 'warning' },
] as const;

export const CHAT_GUARDIAN_SCENARIOS: ReadonlyArray<ChatGuardianScenario> = [
  {
    contactName: 'PrixConcours',
    headline: 'Tu as été tiré au sort !',
    intro: 'Un faux concours avec urgence artificielle et demande de données.',
    messages: [
      { sender: 'PrixConcours', text: '🎉 Félicitations ! Tu as remporté notre grand jeu concours !', time: '09:12' },
      { sender: 'PrixConcours', text: 'Pour valider ton gain de 1000€, nous avons besoin de 2 infos', time: '09:13' },
      { sender: 'PrixConcours', text: 'Envoie : 1) ton code SMS reçu par ta banque 2) ton numéro de compte', time: '09:14' },
      { sender: 'PrixConcours', text: 'Urgence ! Tu dois répondre avant 10h ou tu perds le prix ! ⏰', time: '09:15' },
    ],
    flags: ['Urgence artificielle', 'Demande de code bancaire', 'Contact inconnu', 'Trop beau pour être vrai'],
  },
  {
    contactName: 'AmiSecret',
    headline: 'Secret entre nous...',
    intro: 'Un ami insiste pour obtenir des infos privées et imposer le secret.',
    messages: [
      { sender: 'AmiSecret', text: 'Coucou ! J\'ai besoin de ton aide pour quelque chose...', time: '10:02' },
      { sender: 'AmiSecret', text: 'Je dois ton numéro de téléphone personnel, il faut que tu me l\'envoies en DM', time: '10:03' },
      { sender: 'AmiSecret', text: 'IMPORTANT : n\'en parle à PERSONNE, pas même à tes parents ! c\'est confidentiel 🤫', time: '10:05' },
      { sender: 'AmiSecret', text: 'Si tu dis non, c\'est que tu ne veux pas m\'aider... et tu sais où me trouver 😠', time: '10:07' },
    ],
    flags: ['Demande de secret', 'Isolation depuis famille', 'Pression émotionnelle', 'Chantage implicite'],
  },
  {
    contactName: 'Harceleur123',
    headline: 'Arrête de faire la moue',
    intro: 'Harcèlement agressif avec menaces de partage de contenus.',
    messages: [
      { sender: 'Harceleur123', text: 'J\'ai vu ton dernier post, tu es ridicule !! 😂😂😂', time: '11:14' },
      { sender: 'Harceleur123', text: 'Tu es nul(le), tout le monde est d\'accord avec moi de toute façon', time: '11:15' },
      { sender: 'Harceleur123', text: 'J\'ai des captures de ton compte, je vais les partager partout si tu ne réponds pas', time: '11:17' },
      { sender: 'Harceleur123', text: 'Laisse un message sur mon mur ou ça va mal tourner pour toi... 💀', time: '11:20' },
    ],
    flags: ['Insultes répétées', 'Menaces de divulgation', 'Chantage', 'Harcèlement organisé'],
  },
  {
    contactName: 'BanqueSecure',
    headline: 'Déblocage d\'urgence',
    intro: 'Un faux support bancaire demande des identifiants sensibles avec urgence.',
    messages: [
      { sender: 'BanqueSecure', text: 'ALERTE SÉCURITÉ : Ton compte a été détecté comme compromis. AGIS VITE !', time: '12:00' },
      { sender: 'BanqueSecure', text: 'Pour le réactiver, nous devons vérifier ton identité immédiatement', time: '12:01' },
      { sender: 'BanqueSecure', text: 'Envoie : numéro carte (16 chiffres), date de validité, et les 3 chiffres au dos', time: '12:02' },
      { sender: 'BanqueSecure', text: 'NE partage JAMAIS ces infos sur le site public. Réponds uniquement ICI en DM ! 🔒', time: '12:03' },
    ],
    flags: ['Faux support bancaire', 'Demande d\'identifiants', 'Pression urgente', 'Demande de secret'],
  },
  {
    contactName: 'OffreSpéciale',
    headline: 'Récompense exclusive',
    intro: 'Une promesse de récompense cache une tentative de sextortion.',
    messages: [
      { sender: 'OffreSpéciale', text: 'Salut ! T\'es joli(e)... j\'ai une offre pour toi 😊', time: '13:21' },
      { sender: 'OffreSpéciale', text: 'Envoie-moi une petite photo de toi (pas besoin de sourire 😉) et je t\'offre un cadeau', time: '13:23' },
      { sender: 'OffreSpéciale', text: 'C\'est juste pour mon compte perso... c\'est NOTRE secret entre nous 🤐', time: '13:24' },
      { sender: 'OffreSpéciale', text: 'Une fois que j\'aurai la photo, nous garderons ça privé. Personne d\'autre ne saura 😉💬', time: '13:26' },
    ],
    flags: ['Grooming progressif', 'Demande de photo intime', 'Secret imposé', 'Récompense suspecte'],
  },
] as const;

export function findScenarioIndexByContactName(contactName: string): number | null {
  const scenarioIndex = CHAT_GUARDIAN_SCENARIOS.findIndex(
    (scenario) => scenario.contactName === contactName
  );

  return scenarioIndex >= 0 ? scenarioIndex : null;
}
