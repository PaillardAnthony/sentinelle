#!/bin/bash
# Script pour installer le compagnon natif de Sentinelle pour Microsoft Edge sur macOS et Linux.

# --- CONFIGURATION ---
# Remplacez la ligne ci-dessous par l'ID de votre extension obtenue sur le store Edge.
EXTENSION_ID="extension://lmjeioolkhkniddnpnoddeekoejfdpmp"

HOST_NAME="com.votre_nom.sentinelle"

# Détermine le chemin absolu du script
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
PYTHON_SCRIPT_PATH="$SCRIPT_DIR/main.py"

# Détermine le dossier cible en fonction de l'OS
if [[ "$(uname)" == "Darwin" ]]; then
  # macOS
  TARGET_DIR="$HOME/Library/Application Support/Microsoft Edge/NativeMessagingHosts"
elif [[ "$(uname)" == "Linux" ]]; then
  # Linux
  TARGET_DIR="$HOME/.config/microsoft-edge/NativeMessagingHosts"
else
  echo "ERREUR : Systeme d'exploitation non supporte."
  exit 1
fi

MANIFEST_PATH="$TARGET_DIR/$HOST_NAME.json"

echo "[1/3] Creation du dossier de configuration s'il n'existe pas..."
mkdir -p "$TARGET_DIR"
echo "   Dossier : $TARGET_DIR"

echo ""
echo "[2/3] Creation du fichier manifeste..."
# Utilise une structure "cat <<EOF" pour créer le JSON proprement
cat <<EOF > "$MANIFEST_PATH"
{
    "name": "$HOST_NAME",
    "description": "Compagnon natif pour l'extension Sentinelle.",
    "path": "$PYTHON_SCRIPT_PATH",
    "type": "stdio",
    "allowed_origins": [
        "$EXTENSION_ID"
    ]
}
EOF
echo "   Fichier manifeste cree : $MANIFEST_PATH"

# Rend le script python executable
chmod +x "$PYTHON_SCRIPT_PATH"

echo ""
echo "[3/3] Installation terminee !"
echo "Vous pouvez fermer ce terminal. Assurez-vous de redemarrer Microsoft Edge."