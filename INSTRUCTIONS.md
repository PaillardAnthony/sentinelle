# Instructions d'Installation et d'Utilisation - Sentinelle

Merci d'utiliser Sentinelle ! Ce guide vous aidera à installer l'extension de navigateur ainsi que son compagnon natif, nécessaire pour une protection maximale.

## Table des Matières
1.  [À quoi sert le Compagnon ?](#a-quoi-sert-le-compagnon-)
2.  [Prérequis](#prérequis)
3.  [Étape 1 : Installer l'Extension de Navigateur](#étape-1--installer-lextension-de-navigateur)
4.  [Étape 2 : Installer le Compagnon Natif](#étape-2--installer-le-compagnon-natif)
    * [Pour Windows](#pour-windows)
    * [Pour macOS et Linux](#pour-macos-et-linux)
5.  [Étape 3 : Vérifier l'Installation](#étape-3--vérifier-linstallation)
6.  [Désinstallation](#désinstallation)

---

### À quoi sert le Compagnon ?

Pour des raisons de sécurité, les extensions de navigateur sont isolées et ne peuvent pas lire les fichiers directement sur votre ordinateur. Le **Compagnon Sentinelle** est un petit script sécurisé qui agit comme un pont. Il permet à l'extension d'analyser le contenu réel de vos téléchargements pour détecter des menaces qu'elle ne pourrait pas voir seule. L'installation du compagnon est **optionnelle mais fortement recommandée** pour une protection complète.

### Prérequis

* Un navigateur basé sur Chromium (Google Chrome, Microsoft Edge, Brave, etc.).
* **Python 3** installé sur votre système. Vous pouvez le télécharger depuis [python.org](https://www.python.org/downloads/). Durant l'installation, assurez-vous de cocher la case "Add Python to PATH".

---

### Étape 1 : Installer l'Extension de Navigateur

La première étape est d'installer l'extension dans votre navigateur.

1.  Ouvrez votre navigateur et allez à l'adresse `chrome://extensions`.
2.  Activez le **"Mode développeur"** (généralement un interrupteur en haut à droite).
3.  Cliquez sur le bouton **"Charger l'extension non empaquetée"**.
4.  Une fenêtre s'ouvre. Naviguez jusqu'au dossier où vous avez téléchargé les fichiers du projet "Sentinelle" et sélectionnez le dossier principal.
5.  L'extension "Sentinelle" devrait maintenant apparaître dans votre liste.

---

### Étape 2 : Installer le Compagnon Natif

Cette étape connecte l'extension au script d'analyse sur votre ordinateur.

#### Pour Windows

1.  Naviguez dans le dossier du projet.
2.  Trouvez le fichier `install.bat`.
3.  Faites un clic-droit sur `install.bat` et choisissez **"Exécuter en tant qu'administrateur"**.
4.  Une fenêtre de terminal noire s'ouvrira, affichera quelques messages et se fermera. Le compagnon est maintenant installé.

#### Pour macOS et Linux

1.  Ouvrez une application **Terminal**.
    * Sur macOS : se trouve dans `Applications > Utilitaires`.
    * Sur Linux : utilisez le lanceur d'applications pour trouver "Terminal".
2.  Avec la commande `cd`, naviguez jusqu'au dossier du projet. Par exemple :
    ```bash
    cd /home/utilisateur/Téléchargements/Sentinelle_Projet
    ```
3.  Exécutez les deux commandes suivantes, l'une après l'autre :

    * Pour rendre le script d'installation exécutable :
        ```bash
        chmod +x install.sh
        ```
    * Pour lancer l'installation :
        ```bash
        ./install.sh
        ```
4.  Le terminal affichera les étapes d'installation. Le compagnon est maintenant installé.

---

### Étape 3 : Vérifier l'Installation

1.  Cliquez sur l'icône de puzzle (Extensions) dans la barre d'outils de votre navigateur et ouvrez l'extension **Sentinelle**.
2.  Allez dans l'onglet **"Paramètres"**.
3.  Regardez la section **"Sentinelle Compagnon"**. Le statut doit maintenant indiquer **"✅ Actif"**.

Si le statut est "Inactif", essayez de recharger l'extension depuis la page `chrome://extensions` (avec l'icône d'actualisation) et de rouvrir le popup.

---

### Désinstallation

Si vous souhaitez supprimer complètement Sentinelle, suivez ces deux étapes.

#### 1. Désinstaller le Compagnon Natif

* **Sur Windows :** Double-cliquez sur le fichier `uninstall.bat`.
* **Sur macOS et Linux :** Ouvrez un terminal dans le dossier du projet et exécutez `./uninstall.sh`.

#### 2. Supprimer l'Extension

1.  Retournez sur la page `chrome://extensions`.
2.  Trouvez la carte de l'extension "Sentinelle".
3.  Cliquez sur le bouton **"Supprimer"**.

Votre système est maintenant revenu à son état initial.