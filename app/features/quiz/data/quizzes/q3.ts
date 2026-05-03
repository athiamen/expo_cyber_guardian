import { q, type QuizCatalogEntry } from './types';

export const QUIZ_Q3: QuizCatalogEntry = {
  title: 'Le Royaume des Mots de Passe',
  module: 'Protection des comptes',
  questions: [
    q('Q3-1', 'Construction de mot de passe', 'Quel premier choix aide à fabriquer le mot de passe du royaume ?', ['Un animal totem', 'Le nom du professeur', 'Le mot passe du voisin'], 0),
    q('Q3-2', 'Construction de mot de passe', 'Quelle couleur de protection peut renforcer le mot de passe magique ?', ['RougeCerise', 'BleuRoyal', 'VertNature'], 1),
    q('Q3-3', 'Construction de mot de passe', 'Quelle melodie preferée peut être transformée en partie du mot de passe ?', ['DoReMiMagique', '123123', 'bonjour'], 0),
    q('Q3-4', 'Construction de mot de passe', 'Quel chiffre magique rend le mot de passe plus solide ?', ['7', '2024', '0000'], 1),
    q('Q3-5', 'Construction de mot de passe', 'Quel symbole de pouvoir complète le mot de passe ?', ['!', 'a', '3'], 0),
  ],
};
