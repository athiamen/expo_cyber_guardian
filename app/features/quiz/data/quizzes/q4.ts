import { q, type QuizCatalogEntry } from './types';

export const QUIZ_Q4: QuizCatalogEntry = {
  title: 'Chat Guardian',
  module: 'Messagerie securisee',
  questions: [
    q('Q4-1', 'Messagerie', 'Un faux concours te demande ton code SMS bancaire de toute urgence. Que fais-tu ?', ['Bloquer le contact', 'Signaler à la plateforme', 'Capturer comme preuve', 'Ignorer le message', 'Partager en DM', 'Chercher de l aide'], 1),
    q('Q4-2', 'Messagerie', 'Un contact insista pour avoir ton numero personnel en secret et menace de ne pas vouloir t\'aider sinon. Reaction ?', ['Bloquer le contact', 'Signaler à la plateforme', 'Partager le numero', 'Ignorer et oublier', 'Repondre poliment', 'Demander de l\'aide'], 0),
    q('Q4-3', 'Messagerie', 'Tu recois des insultes repetees et des menaces de partage de contenus. Comment te proteger ?', ['Bloquer sans répondre', 'Signaler au support', 'Capturer les messages', 'Ignorer et continuer', 'Répondre pour te defendre', 'Demander a un adulte'], 2),
    q('Q4-4', 'Messagerie', 'Un faux support bancaire demande une photo de ta carte bancaire en prive avec urgence. Que fais-tu ?', ['Bloquer ce contact', 'Ignorer seul(e)', 'Revérifier le domaine', 'Répondre rapidement', 'Garder une trace', 'Demander a un adulte'], 5),
    q('Q4-5', 'Messagerie', 'Un(e) inconnu(e) te promet une recompense et veut une photo de toi en secret. Signal d\'alerte ?', ['Bloquer immediatement', 'Signaler et couper', 'Capturer pour analyse', 'Ignorer juste?', 'Envoyer la photo', 'Demander conseil'], 0),
  ],
};
