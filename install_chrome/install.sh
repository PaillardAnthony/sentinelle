#!/bin/bash

# Ce script installe le compagnon natif pour Sentinelle sur macOS et Linux.

# --- Configuration ---
# Le nom de notre hôte natif (doit correspondre à l'extension)
HOST_NAME="fr.sentinelle.host"

# Chemin absolu vers le script Python compagnon
# Trouve le répertoire où se trouve install.sh et construit le chemin vers le compagnon
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
HOST_PATH="$SCRIPT_DIR/sentinelle_compagnon.py"

# --- Détection de l'OS et définition des chemins cibles ---
# Les navigateurs cherchent les manifestes dans des dossiers différents selon l'OS.

# On stocke les chemins dans un tableau
TARGET_DIRS=() 

if [[ "$(uname)" == "Darwin" ]]; then
  # Chemins pour macOS
  echo "Système détecté : macOS"
  TARGET_DIRS+=("$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts")
  TARGET_DIRS+=("$HOME/Library/Application Support/Mozilla/NativeMessagingHosts")
  TARGET_DIRS+=("$HOME/Library/Application Support/Microsoft Edge/NativeMessagingHosts") # Pour Edge sur Mac
elif [[ "$(uname)" == "Linux" ]]; then
  # Chemins pour Linux
  echo "Système détecté : Linux"
  TARGET_DIRS+=("$HOME/.config/google-chrome/NativeMessagingHosts")
  TARGET_DIRS+=("$HOME/.mozilla/native-messaging-hosts")
  TARGET_DIRS+=("$HOME/.config/microsoft-edge/NativeMessagingHosts") # Pour Edge sur Linux
else
  echo "Erreur : Système d'exploitation non supporté."
  exit 1
fi

# Rendre le script Python exécutable
# C'est une étape OBLIGATOIRE sur les systèmes Unix (macOS/Linux)
echo "Attribution des permissions d'exécution au compagnon..."
chmod +x "$HOST_PATH"

# --- Création du manifeste et installation ---

# Contenu du fichier manifeste (le chemin sera inséré dynamiquement)
# Notez l'utilisation de "$HOST_PATH" pour inclure le chemin absolu.
MANIFEST_JSON=$(cat <<EOF
{
  "name": "$HOST_NAME",
  "description": "Compagnon pour l'extension Sentinelle",
  "path": "$HOST_PATH",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://VOTRE_ID_D_EXTENSION_A_REMPLACER_ICI/"
  ]
}
EOF
)

# Boucler sur chaque dossier cible pour installer le manifeste
for TARGET_DIR in "${TARGET_DIRS[@]}"; do
  echo "Installation dans : $TARGET_DIR"
  
  # Créer le dossier s'il n'existe pas
  mkdir -p "$TARGET_DIR"
  
  # Écrire le fichier manifeste
  echo "$MANIFEST_JSON" > "$TARGET_DIR/$HOST_NAME.json"
done

echo ""
echo "✅ Installation du compagnon Sentinelle terminée pour macOS/Linux !"
echo "N'oubliez pas de remplacer 'VOTRE_ID_D_EXTENSION_A_REMPLACER_ICI' dans ce script si ce n'est pas déjà fait."