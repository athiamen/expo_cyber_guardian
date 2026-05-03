import { q, type QuizCatalogEntry } from './types';

export const QUIZ_Q2: QuizCatalogEntry = {
  title: 'Detecteur de Pieges',
  module: 'Cyber Heros',
  difficulties: {
    easy: [
      q('Q2-E1', 'Phishing', 'Quel email semble suspect ?', ['Message sans lien et sans urgence', 'Adresse inconnue avec urgence exagerée', 'Message déjà attendu'], 1),
      q('Q2-E2', 'Phishing', 'Que faut-il vérifier en premier ?', ['Le fond d\'écran', 'L\'adresse de l\'expéditeur', 'La couleur du texte'], 1),
      q('Q2-E3', 'Phishing', 'Quelle reaction est la plus sure face a un lien douteux ?', ['Cliquer pour voir', 'Ne pas cliquer et demander de l\'aide', 'Le partager à tout le monde'], 1),
      q('Q2-E4', 'Phishing', 'Quel indice est souvent trompeur ?', ['Urgence artificielle', 'Message calme', 'Compte officiel connu'], 0),
      q('Q2-E5', 'Phishing', 'Si un message te met mal a l\'aise, tu dois...', ['Rester seul avec le doute', 'Parler a un adulte de confiance', 'Répondre vite'], 1),
    ],
    medium: [
      q('Q2-M1', 'Phishing', 'Quel détail peut trahir un faux site ?', ['Le nom de domaine ressemble au vrai mais n\'est pas identique', 'Le site a des couleurs jolies', 'Le texte est court'], 0),
      q('Q2-M2', 'Phishing', 'Quel est le bon réflexe si un email te presse de cliquer ?', ['Cliquer immediatement', 'Vérifier la source avant toute action', 'Supprimer sans reflechir'], 1),
      q('Q2-M3', 'Phishing', 'Que faut-il faire si un ami envoie un lien bizarre ?', ['Supposer que c\'est vrai', 'Vérifier avec lui par un autre canal', 'Cliquer vite'], 1),
      q('Q2-M4', 'Phishing', 'Quel scénario ressemble à une arnaque ?', ['Gagner un cadeau avec demande de code SMS', 'Réunion de classe planifiée', 'Message de suivi attendu'], 0),
      q('Q2-M5', 'Phishing', 'Quel élément n\'est pas un signe de confiance à lui seul ?', ['Le nom affiche de l\'expéditeur', 'Le fait de pouvoir lire l\'email', 'Le titre du message'], 0),
    ],
    hard: [
      q('Q2-H1', 'Phishing', 'Quel lien est potentiellement le plus dangereux ?', ['https://accounts.google.com', 'https://accounts-google.secure-verification.com', 'https://google.com'], 1),
      q('Q2-H2', 'Phishing', 'Quel message correspond à un piège sophistique ?', ['Confirmation de connexion avec sous-domaine trompeur', 'Message interne attendu', 'Invitation normale'], 0),
      q('Q2-H3', 'Phishing', 'Pourquoi un site en https peut quand même être suspect ?', ['Parce que https garantit toujours la legitimité', 'Parce que le domaine peut rester trompeur', 'Parce que le cadenas est inutile'], 1),
      q('Q2-H4', 'Phishing', 'Que faire face à une alerte qui semble officielle mais qui panique ?', ['Se connecter vite', 'Réprendre le contrôle en vérifiant le vrai domaine', 'Donner son code de vérification'], 1),
      q('Q2-H5', 'Phishing', 'Quel principe reste valable dans tous les cas ?', ['Vérifier avant de croire', 'Cliquer pour confirmer', 'Partager pour demander un avis'], 0),
    ],
  },
};
