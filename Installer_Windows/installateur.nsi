;----------------------------------------------------
; NSIS Script - Version Statique (la plus fiable)
;----------------------------------------------------
Unicode true

!define APP_NAME "Sentinelle Companion"
!define COMP_NAME "SentinelleCompanion"
!define VERSION "1.0"
!define EXE_NAME "sentinelle_compagnon.exe"
!define MANIFEST_NAME "sentinelle_manifest.json"
!define NATIVE_HOST_ID "fr.sentinelle.host"
!define PUBLISHER "Sentinelle"

Name "${APP_NAME}"
OutFile "Sentinelle-Installer-Statique-${VERSION}.exe"

!include "MUI2.nsh"
RequestExecutionLevel admin

; --- Pages de l'installateur ---
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_COMPONENTS
; La page de sélection du répertoire est volontairement retirée
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

InstallDir "$PROGRAMFILES64\${COMP_NAME}"

; --- Section d'installation ---
Section "Core Components (Required)" SecCore
  SectionIn RO
  SetOutPath $INSTDIR
  
  ; Copie les deux fichiers, sans aucune modification
  File "${EXE_NAME}"
  File "${MANIFEST_NAME}"

  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  SetRegView 64
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayName" "${APP_NAME}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "Publisher" "${PUBLISHER}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayIcon" "$INSTDIR\${EXE_NAME}"
SectionEnd

; --- Sections pour les navigateurs ---
SectionGroup "Browser Integration" SecGroupBrowsers
    Section "For Google Chrome" SecChrome
      SetRegView 64
      WriteRegStr HKLM "Software\Google\Chrome\NativeMessagingHosts\${NATIVE_HOST_ID}" "" "$INSTDIR\${MANIFEST_NAME}"
    SectionEnd
    Section "For Microsoft Edge" SecEdge
      SetRegView 64
      WriteRegStr HKLM "Software\Microsoft\Edge\NativeMessagingHosts\${NATIVE_HOST_ID}" "" "$INSTDIR\${MANIFEST_NAME}"
    SectionEnd
    Section "For Mozilla Firefox" SecFirefox
      SetRegView 64
      WriteRegStr HKLM "Software\Mozilla\NativeMessagingHosts\${NATIVE_HOST_ID}" "" "$INSTDIR\${MANIFEST_NAME}"
    SectionEnd
SectionGroupEnd

; --- Section de désinstallation ---
Section "Uninstall"
  SetRegView 64
  DeleteRegKey HKLM "Software\Google\Chrome\NativeMessagingHosts\${NATIVE_HOST_ID}"
  DeleteRegKey HKLM "Software\Microsoft\Edge\NativeMessagingHosts\${NATIVE_HOST_ID}"
  DeleteRegKey HKLM "Software\Mozilla\NativeMessagingHosts\${NATIVE_HOST_ID}"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
  
  Delete "$INSTDIR\${EXE_NAME}"
  Delete "$INSTDIR\${MANIFEST_NAME}"
  Delete "$INSTDIR\uninstall.exe"
  
  RMDir $INSTDIR
SectionEnd