import type { QuizDifficulty } from '../data/quizCatalogData';

export type QuestionEvent = {
  icon: string;
  title: string;
  context: string;
  message: string;
};

export const TIME_PER_DIFFICULTY: Record<QuizDifficulty, number> = {
  easy: 20,
  medium: 15,
  hard: 10,
};

export const LEVEL_LABELS: Record<QuizDifficulty, string> = {
  easy: 'Debutant',
  medium: 'Intermediaire',
  hard: 'Expert',
};

export const QUESTION_EVENTS: Record<string, QuestionEvent> = {
  'Q5-1': {
    icon: '📲',
    title: 'Notification surprise',
    context: 'Tu recois cette notification sur ton telephone :',
    message:
      '"🎉 FELICITATIONS ! Vous avez ete selectionne pour gagner le nouvel iPhone 16 Pro ! Cliquez maintenant pour reclamer votre prix avant expiration dans 10 minutes. Offre limitee aux 100 premiers !"',
  },
  'Q5-2': {
    icon: '🧾',
    title: 'Bilan de fin de parcours',
    context: 'Le jeu affiche un ecran de resultat avec ce message :',
    message:
      '"Bravo ! Tu as protege la majorite de tes donnees sensibles. Continue comme ca pour devenir Maitre de la cybersecurite."',
  },
  'Q5-3': {
    icon: '❤️',
    title: 'Reserve de vies',
    context: 'Debut de partie dans le Labyrinthe des Infos :',
    message:
      '"Tu disposes de 5 vies. Chaque mauvaise decision te fait perdre une vie. A 0, la mission est terminee."',
  },
  'Q5-4': {
    icon: '🎁',
    title: 'Pop-up douteux',
    context: 'Un pop-up apparait pendant la progression :',
    message:
      '"Tu as gagne un iPhone gratuit ! Renseigne ton adresse complete et ton numero pour la livraison immediate."',
  },
  'Q5-5': {
    icon: '🛡️',
    title: 'Donnee a proteger',
    context: 'Une case te demande de choisir ce que tu dois absolument garder prive :',
    message:
      '"Selectionne l information la plus sensible pour eviter qu elle soit recuperee par un pirate."',
  },
};

export const FIREWALL_LEVEL_LABELS: Record<QuizDifficulty, string> = {
  easy: 'Apprenti',
  medium: 'Garde du corps',
  hard: 'Maitre du feu',
};

export const FIREWALL_FALL_MULTIPLIER: Record<QuizDifficulty, number> = {
  easy: 0.8,
  medium: 1,
  hard: 1.5,
};