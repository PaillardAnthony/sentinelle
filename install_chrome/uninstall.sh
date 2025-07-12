#!/bin/bash

# Ce script désinstalle le compagnon natif pour Sentinelle sur macOS et Linux.

# --- Configuration ---
# Le nom de notre hôte natif (doit correspondre à celui de l'installation)
HOST_NAME="fr.sentinelle.host"

# --- Détection de l'OS et définition des chemins cibles ---
# (Exactement la même logique que pour install.sh)

TARGET_DIRS=() 

if [[ "$(uname)" == "Darwin" ]]; then
  # Chemins pour macOS
  echo "Système détecté : macOS"
  TARGET_DIRS+=("$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts")
  TARGET_DIRS+=("$HOME/Library/Application Support/Mozilla/NativeMessagingHosts")
  TARGET_DIRS+=("$HOME/Library/Application Support/Microsoft Edge/NativeMessagingHosts")
elif [[ "$(uname)" == "Linux" ]]; then
  # Chemins pour Linux
  echo "Système détecté : Linux"
  TARGET_DIRS+=("$HOME/.config/google-chrome/NativeMessagingHosts")
  TARGET_DIRS+=("$HOME/.mozilla/native-messaging-hosts")
  TARGET_DIRS+=("$HOME/.config/microsoft-edge/NativeMessagingHosts")
else
  echo "Erreur : Système d'exploitation non supporté."
  exit 1
fi

# --- Suppression des manifestes ---

# Boucler sur chaque dossier cible pour supprimer le manifeste
for TARGET_DIR in "${TARGET_DIRS[@]}"; do
  MANIFEST_PATH="$TARGET_DIR/$HOST_NAME.json"
  
  # Vérifier si le fichier existe avant de tenter de le supprimer
  if [ -f "$MANIFEST_PATH" ]; then
    echo "Suppression du manifeste : $MANIFEST_PATH"
    rm "$MANIFEST_PATH"
  else
    echo