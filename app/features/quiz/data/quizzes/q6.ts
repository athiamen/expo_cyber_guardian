import { q, type QuizCatalogEntry } from './types';

export const QUIZ_Q6: QuizCatalogEntry = {
  title: 'Firewall Defender',
  module: 'Défense active',
  questions: [
    q('Q6-1', 'Protection active', 'Quel est le rôle du joueur dans Firewall Defender ?', ['Programmer un serveur DNS', 'Déplacer un coffre pour protéger les données', 'Configurer un VPN entreprise'], 1),
    q('Q6-2', 'Protection active', 'Que se passe-t-il si une menace est attrapée ou qu\'une donnée va au pirate ?', ['Le score est doublé automatiquement', 'Le niveau suivant se débloque', 'Le bouclier diminue et peut faire perdre une vie'], 2),
    q('Q6-3', 'Protection active', 'Quel objet peut tomber du ciel dans Firewall Defender ?', ['Des données personnelles', 'Des voitures de course', 'Des livres scolaires'], 0),
    q('Q6-4', 'Protection active', 'Quel bonus est mentionné dans le document ?', ['Accès root permanent', 'Bouclier ou vie supplémentaire via 2FA', 'Suppression totale des menaces'], 1),
    q('Q6-5', 'Protection active', 'Que doit faire le joueur pendant toute la partie ?', ['Attendre sans bouger', 'Donner les données au pirate', 'Agir vite et protéger les données'], 2),
    q('Q6-6', 'Protection active', 'Quelle donnée numérique est sensible et ne doit pas être partagée au hasard ?', ['Ton adresse email', 'Le fond d\'écran', 'Le pseudo d\'un jeu hors-ligne'], 0),
    q('Q6-7', 'Protection active', 'Dans Firewall Defender, quelle information scolaire doit rester protégée ?', ['Nom de l\'école et classe', 'Couleur du cartable', 'Marque des chaussures'], 0),
    q('Q6-8', 'Protection active', 'Quelle information de naissance est considérée comme personnelle ?', ['Date de naissance complète', 'Saison préférée', 'Mois des vacances'], 0),
  ],
};
