@echo off
setlocal

:: Determine the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "MANIFEST_PATH=%SCRIPT_DIR%sentinelle_manifest.json"
set "COMPANION_PATH=%SCRIPT_DIR%sentinelle_compagnon.exe"

:: Escape backslashes for JSON format
set "JSON_COMPANION_PATH=%COMPANION_PATH:\=\\%"

echo.
echo ===========================================
echo  Installation du Compagnon pour Sentinelle
echo ===========================================
echo.
echo ATTENTION : Vous devez modifier ce script pour y inserer l'ID de votre extension.
echo.
echo Creation du fichier manifeste pour Chrome...

:: Create the manifest file dynamically
(
    echo {
    echo   "name": "fr.sentinelle.host",
    echo   "description": "Hote natif pour l'extension Sentinelle.",
    echo   "path": "%JSON_COMPANION_PATH%",
    echo   "type": "stdio",
    echo   "allowed_origins": [
    echo     "chrome-extension://iekchniojgdaphoonhkilnafkokbaiei/"
    echo   ]
    echo }
) > "%MANIFEST_PATH%"

echo Fichier manifeste cree : %MANIFEST_PATH%
echo.
echo Enregistrement du connecteur dans le Registre Windows...

:: Add the registry key dynamically
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\fr.sentinelle.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ---
    echo Reussite ! Le compagnon Sentinelle est installe.
    echo Vous pouvez maintenant (re)charger l'extension dans Chrome.
    echo ---
) ELSE (
    echo.
    echo !!!
    echo ECHEC ! Impossible d'inscrire le connecteur dans le Registre.
    echo Essayez d'executer ce script en tant qu'administrateur.
    echo !!!
)

echo.
pause