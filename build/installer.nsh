; Extra Start menu entry so Windows search finds the app by "vsc", "inst", "insta", "instagram" or "dm".
; Windows search matches the start of each word in a shortcut name, and "Visual Stagram Code" alone
; doesn't contain any of those words. It points at the same exe and shares the AppUserModelID,
; so it pins and groups on the taskbar exactly like the main shortcut.
!define VSC_SEARCH_LINK "$SMPROGRAMS\VSC Instagram DM.lnk"

!macro customInstall
  Delete "${VSC_SEARCH_LINK}"
  CreateShortCut "${VSC_SEARCH_LINK}" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0 "" "" "Visual Stagram Code - Instagram DM (VSC, Insta)"
  ClearErrors
  WinShell::SetLnkAUMI "${VSC_SEARCH_LINK}" "${APP_ID}"
!macroend

!macro customUnInstall
  WinShell::UninstShortcut "${VSC_SEARCH_LINK}"
  Delete "${VSC_SEARCH_LINK}"
!macroend
