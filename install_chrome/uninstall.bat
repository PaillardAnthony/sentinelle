@echo off
:: Ce script supprime les cles de registre pour le compagnon natif Sentinelle.

:: Nom de l'hote natif. Doit correspondre a celui dans install.bat
set HOST_NAME=fr.sentinelle.host

echo Desinstallation du compagnon pour Google Chrome...
reg delete "HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\%HOST_NAME%" /f

echo.
echo Desinstallation du compagnon pour Mozilla Firefox...
reg delete "HKEY_CURRENT_USER\Software\Mozilla\NativeMessagingHosts\%HOST_NAME%" /f

echo.
echo Desinstallation du compagnon pour Microsoft Edge...
reg delete "HKEY_CURRENT_USER\Software\Microsoft\Edge\NativeMessagingHosts\%HOST_NAME%" /f

echo.
echo Operation terminee.
pause