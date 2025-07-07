# Règle de Confidentialité pour l'extension Sentinelle

**Date d'entrée en vigueur :** 7 juillet 2025

Nous vous remercions d'utiliser Sentinelle ("l'extension"). Votre vie privée est une priorité pour nous. Cette règle de confidentialité explique quelles informations nous traitons et comment nous les utilisons.

### 1. Philosophie et Engagement

Sentinelle est conçue selon le principe du "respect de la vie privée dès la conception" (Privacy by Design). Notre objectif est de vous fournir une sécurité maximale avec une collecte de données minimale. L'analyse des fichiers, cœur de notre extension, est effectuée **localement sur votre propre ordinateur** grâce à notre compagnon natif. Aucune information sur vos fichiers n'est envoyée sur nos serveurs.

### 2. Informations que nous traitons

Pour fonctionner, l'extension a besoin de traiter les informations suivantes :

* **Informations sur les téléchargements** : Nous accédons au nom de fichier et à l'URL source de chaque téléchargement afin de pouvoir les analyser.
* **Paramètres de l'extension** : Nous stockons vos préférences (par exemple, si vous autorisez les scripts) localement sur votre machine en utilisant l'API `chrome.storage`.
* **Historique des événements** : Nous conservons une liste des derniers fichiers analysés et des décisions prises. Cet historique est également stocké localement et n'est accessible que par vous.

### 3. Informations optionnelles que vous pouvez fournir

* **Clé d'API VirusTotal** : Vous avez la possibilité de fournir votre propre clé d'API pour le service VirusTotal afin d'enrichir les analyses. Si vous fournissez cette clé, le "hash" (une empreinte numérique non réversible) de vos fichiers téléchargés sera envoyé à VirusTotal pour analyse. Nous ne collectons ni ne stockons les rapports de VirusTotal. L'utilisation de cette fonctionnalité est soumise à la politique de confidentialité de VirusTotal.

### 4. Partage des informations

Nous ne vendons, ne louons et ne partageons aucune de vos informations personnelles avec des tiers. La seule exception est l'envoi de hash de fichiers à VirusTotal, qui est une action initiée et contrôlée par vous via la fourniture de votre propre clé d'API.

### 5. Sécurité

Toutes les données relatives à l'extension sont stockées sur votre ordinateur. L'analyse des fichiers est effectuée localement par le compagnon natif, garantissant que le contenu de vos fichiers ne quitte jamais votre machine (sauf dans le cas de l'utilisation de l'API VirusTotal, comme décrit ci-dessus).

### 6. Modifications de cette règle

Nous pouvons être amenés à mettre à jour cette règle de confidentialité. Nous vous informerons de tout changement majeur.

### 7. Contact

Pour toute question concernant cette règle de confidentialité, veuillez nous contacter via notre dépôt GitHub.