import { q, type QuizCatalogEntry } from './types';

export const QUIZ_Q5: QuizCatalogEntry = {
  title: 'Le Labyrinthe des Infos',
  module: 'Protection des données personnelles',
  questions: [
    q('Q5-1', 'Données personnelles', 'Quel élément fait partie des mécaniques du Labyrinthe des Infos ?', ['Compilation de code en temps réel', 'Mode multijoueur en équipe réseau', 'Inventaire des données sensibles protégées/compromises'], 2),
    q('Q5-2', 'Données personnelles', 'Quel bilan final peut apparaître dans ce jeu ?', ['Maître de la cybersécurité', 'Administrateur système certifié', 'Root kernel valide'], 0),
    q('Q5-3', 'Données personnelles', 'Combien de vies le joueur a-t-il au départ ?', ['2', '5', '10'], 1),
    q('Q5-4', 'Données personnelles', 'Quelle situation est présentée dans le labyrinthe ?', ['Une mise à jour BIOS', 'Une panne de clavier', 'Un faux concours iPhone'], 2),
    q('Q5-5', 'Données personnelles', 'Quelle donnée faut-il protéger dans ce jeu ?', ['Adresse et numéro de téléphone', 'Couleur préférée seulement', 'Nom du dessin animé préféré'], 0),
  ],
};
