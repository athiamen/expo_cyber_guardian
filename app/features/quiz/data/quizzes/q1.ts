import { q, type QuizCatalogEntry } from './types';

export const QUIZ_Q1: QuizCatalogEntry = {
  title: 'Maitre des Mots de Passe',
  module: 'Cyber Heros',
  difficulties: {
    easy: [
      q('Q1-E1', 'Mots de passe', 'Quel mot de passe est le plus solide ?', ['123456', 'MotDePasse', 'LicorneMagique2024!'], 2),
      q('Q1-E2', 'Mots de passe', 'Où ne faut-il jamais noter un mot de passe ?', ['Sur un post-it visible', 'Dans un coffre-fort numerique', 'Dans un gestionnaire securise'], 0),
      q('Q1-E3', 'Mots de passe', 'Quelle habitude est la plus sure ?', ['Partager son mot de passe', 'Utiliser un mot de passe différent pour chaque site', 'Réutiliser le meme partout'], 1),
      q('Q1-E4', 'Mots de passe', 'Quel élément renforce un mot de passe ?', ['Seulement des lettres minuscules', 'Une combinaison de lettres, chiffres et symboles', 'Le prenom + la date de naissance'], 1),
      q('Q1-E5', 'Mots de passe', 'Que faut-il faire si un site semble demande trop de secrets ?', ['Repondre vite', 'Vérifier avant de saisir quoi que ce soit', 'Ignorer les alertes'], 1),
    ],
    medium: [
      q('Q1-M1', 'Mots de passe', 'Quel mot de passe est le plus difficile a deviner ?', ['chat2024', 'SoleilBleu#2026', 'azerty'], 1),
      q('Q1-M2', 'Mots de passe', 'Quel outil aide à garder des mots de passe uniques et forts ?', ['Un carnet ouvert sur la table', 'Un gestionnaire de mots de passe', 'Le meme code pour tout'], 1),
      q('Q1-M3', 'Mots de passe', 'Pourquoi faut-il eviter de réutiliser le meme mot de passe ?', ['Pour aller plus vite', 'Parce qu un seul piratage peut tout compromettre', 'Parce que c est plus joli'], 1),
      q('Q1-M4', 'Mots de passe', 'Quelle pratique est la plus raisonnable ?', ['Partager son mot de passe a un ami', 'Le changer seulement si besoin et s il est compromis', 'Le laisser en clair dans un fichier'], 1),
      q('Q1-M5', 'Mots de passe', 'Quel indice montre souvent un mot de passe faible ?', ['Longueur courte et mot du dictionnaire', 'Melange de caracteres', 'Phrase secretee longue'], 0),
    ],
    hard: [
      q('Q1-H1', 'Mots de passe', 'Quel scénario est le plus prudent ?', ['Retenir un seul mot de passe pour tous les services', 'Utiliser une phrase de passe unique par service', 'Envoyer ses codes par message'], 1),
      q('Q1-H2', 'Mots de passe', 'Quelle défense complète le mieux un mot de passe solide ?', ['Le meme mot de passe partout', 'La vérification en deux étapes', 'Le partage entre amis'], 1),
      q('Q1-H3', 'Mots de passe', 'Que faire face à un site qui presse de saisir son mot de passe ?', ['Saisir les informations tout de suite', 'Vérifier le domaine et quitter en cas de doute', 'Cliquer sans lire'], 1),
      q('Q1-H4', 'Mots de passe', 'Quel exemple correspond à un bon mot de passe ?', ['Luna#Tigre42!Vent', 'prenom2008', 'password123'], 0),
      q('Q1-H5', 'Mots de passe', 'Quel principe est le plus important ?', ['Longueur, unicite et complexite', 'Rapidite de saisie', 'Facilite à déviner'], 0),
    ],
  },
};
