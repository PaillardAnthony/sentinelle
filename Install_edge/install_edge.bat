@echo off
REM Script pour installer le compagnon natif de Sentinelle pour Microsoft Edge.

REM --- CONFIGURATION ---
REM Remplacez la ligne ci-dessous par l'ID de votre extension obtenue sur le store Edge.
set EXTENSION_ID=extension://lmjeioolkhkniddnpnoddeekoejfdpmp

set HOST_NAME=com.votre_nom.sentinelle
set SCRIPT_PATH=%~dp0main.py
set MANIFEST_PATH=%~dp0sentinelle_native_host.json

REM Échapper les backslashes pour le JSON
set SCRIPT_PATH_JSON=%SCRIPT_PATH:\=\\%

echo [1/3] Creation du fichier manifeste...
(
    echo {
    echo    "name": "%HOST_NAME%",
    echo    "description": "Compagnon natif pour l'extension Sentinelle.",
    echo    "path": "%SCRIPT_PATH_JSON%",
    echo    "type": "stdio",
    echo    "allowed_origins": [
    echo        "%EXTENSION_ID%"
    echo    ]
    echo }
) > "%MANIFEST_PATH%"
echo    Fichier manifeste cree : %MANIFEST_PATH%

echo.
echo [2/3] Ajout de la cle de registre pour Microsoft Edge...
REG ADD "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f

echo.
echo [3/3] Installation terminee !
echo Vous pouvez fermer cette fenetre. Assurez-vous de redemarrer Microsoft Edge.
echo.
pause