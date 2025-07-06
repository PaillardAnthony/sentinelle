@echo off
setlocal

echo.
echo ==============================================
echo  Desinstallation du Compagnon pour Sentinelle
echo ==============================================
echo.
echo Suppression du connecteur depuis le Registre Windows...

:: Supprime la clé de registre
REG DELETE "HKCU\Software\Google\Chrome\NativeMessagingHosts\fr.sentinelle.host" /f

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ---
    echo Reussite ! Le connecteur Sentinelle est desinstalle.
    echo Vous pouvez supprimer les fichiers du programme manuellement.
    echo ---
) ELSE (
    echo.
    echo ECHEC ! Le connecteur n'etait peut-etre pas installe.
)

echo.
pause