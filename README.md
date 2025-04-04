# Frontend Yoga App (testing-yoga-front)

Ce module constitue la partie frontend de l'application Yoga App, développée avec Angular.

## Prérequis

- Node.js (version 14 ou supérieure)
- Angular CLI (version 14)

## Installation et démarrage

### Si vous utilisez ce module comme partie du projet principal :

Voir le README principal à la racine du projet pour les instructions de clonage avec sous-modules.

### Si vous utilisez ce module de façon autonome :

```sh
git clone https://github.com/Olelouer/testing-yoga-front
cd testing-yoga-front
npm install
npm run start
```

L'application sera accessible à l'adresse [http://localhost:4200](http://localhost:4200).

## Connexion à l'application

### Compte administrateur
- **Email :** yoga@studio.com
- **Mot de passe :** test!1234

### Créer un compte utilisateur standard
1. Cliquez sur "Inscription" dans la barre de navigation
2. Remplissez le formulaire d'inscription

## Tests

L'application comprend plusieurs types de tests :

### Tests unitaires avec Jest

Pour exécuter les tests unitaires :

```sh
npm run test
```

Pour exécuter les tests en mode watch (mise à jour en temps réel) :

```sh
npm run test:watch
```

Pour générer un rapport de couverture :

```sh
npm run test:coverage
```

Le rapport de couverture sera disponible dans :
```
coverage/lcov-report/index.html
```

### Tests end-to-end avec Cypress

Pour exécuter les tests end-to-end :

```sh
npm run e2e
```

Pour générer un rapport de couverture E2E :

```sh
npm run e2e:coverage
```

Pour ouvrir le tableau de bord Cypress :

```sh
npm run cypress:open
```

Le rapport de couverture E2E sera disponible dans :
```
coverage/lcov-report/index.html
```

## Lien avec le backend

Ce frontend est conçu pour fonctionner avec le module backend `testing-yoga-back`. Pour des instructions complètes sur l'installation et la configuration de l'ensemble de l'application, veuillez consulter le README principal à la racine du projet.