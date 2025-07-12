@echo off
REM Script pour desinstaller le compagnon natif de Sentinelle pour Microsoft Edge.

set HOST_NAME=com.votre_nom.sentinelle
set MANIFEST_PATH=%~dp0sentinelle_native_host.json

echo [1/2] Suppression de la cle de registre...
REG DELETE "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\%HOST_NAME%" /f

echo.
echo [2/2] Suppression du fichier manifeste...
if exist "%MANIFEST_PATH%" (
    del "%MANIFEST_PATH%"
)

echo.
echo Desinstallation terminee.
echo.
pause