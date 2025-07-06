let CONFIG = {};

async function loadConfig() {
  try {
    const response = await fetch(chrome.runtime.getURL('config.json'));
    if (!response.ok) {
      throw new Error('Could not load config.json');
    }
    CONFIG = await response.json();
  } catch (error) {
    console.error("Erreur critique: Impossible de charger la configuration.", error);
  }
}

loadConfig();

chrome.downloads.onChanged.addListener(async (downloadDelta) => {
  if (downloadDelta.state && downloadDelta.state.current === 'complete') {
    const [downloadItem] = await chrome.downloads.search({ id: downloadDelta.id });
    if (downloadItem && downloadItem.state === 'complete' && downloadItem.error == null) {
      await analyzeCompletedDownload(downloadItem);
    }
  }
});

async function analyzeCompletedDownload(downloadItem) {
  const { id: downloadId, filename, url, tabId } = downloadItem;
  let decision = null;
  let alertType = 'danger';

  const lowerCaseFilename = filename.toLowerCase();
  const parts = lowerCaseFilename.split('.');
  const fileExtension = parts.pop() || '';

  if (parts.length >= 1) {
    const innerExtension = parts.pop();
    if (CONFIG.DANGEROUS_EXTENSIONS_FOR_SPOOFING.includes(fileExtension) && CONFIG.SAFE_EXTENSIONS_TO_IMPERSONATE.includes(innerExtension)) {
      decision = { messageKey: 'doubleExtMessage', params: [innerExtension.toUpperCase(), fileExtension.toUpperCase()], reasonKey: 'doubleExtReason', reasonParams: [innerExtension, fileExtension] };
    }
  }
  if (!decision && CONFIG.SCRIPT_EXTENSIONS.includes(fileExtension)) {
    const { alwaysAllowScripts } = await chrome.storage.sync.get({ alwaysAllowScripts: false });
    if (!alwaysAllowScripts) {
      decision = { messageKey: 'scriptMessage', params: [fileExtension.toUpperCase()], reasonKey: 'scriptReason' };
    }
  }
  
  if (!decision) {
    try {
      const nativeResponse = await callNativeApp({ command: "analyze", filePath: filename });
      if (nativeResponse.status === 'success') {
        const expectedType = fileExtension;
        const actualType = nativeResponse.detected_type;
        if (expectedType && actualType && actualType !== "unknown" && expectedType !== actualType) {
            decision = { messageKey: 'mismatchMessage', params: [expectedType.toUpperCase(), actualType.toUpperCase()], reasonKey: 'mismatchReason', reasonParams: [expectedType, actualType] };
        }
      } 
      else if (nativeResponse.status === 'danger') {
          if (nativeResponse.reason === 'executable_in_zip') {
              decision = { messageKey: 'executableInZipMessage', params: [nativeResponse.details], reasonKey: 'executableInZipReason' };
          } else if (nativeResponse.reason === 'mismatch_in_zip') {
              decision = { messageKey: 'mismatchInZipMessage', params: [nativeResponse.details], reasonKey: 'mismatchInZipReason' };
          }
      }
      else if (nativeResponse.status === 'warning') {
          alertType = 'warning';
          if (nativeResponse.reason === 'corrupt_zip') {
              decision = { messageKey: 'corruptZipMessage', params: [filename], reasonKey: 'corruptZipReason' };
          }
      }
    } catch (error) {
      alertType = 'warning';
      if (url.startsWith('blob:')) {
        decision = { messageKey: 'unverifiedFileMessage', params: [filename], reasonKey: 'unverifiedFileReason' };
      } else {
        try {
            const response = await fetch(url, { headers: { 'Range': 'bytes=0-4' } });
            if (!response.ok) throw new Error("Fetch failed");
            const buffer = await response.arrayBuffer();
            const hexSignature = Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
            const expectedType = fileExtension;
            const actualType = Object.keys(CONFIG.FILE_SIGNATURES).find(key => hexSignature.startsWith(CONFIG.FILE_SIGNATURES[key]));
            if (CONFIG.FILE_SIGNATURES[expectedType] && actualType && actualType !== expectedType) {
                decision = { messageKey: 'mismatchMessage', params: [expectedType.toUpperCase(), actualType.toUpperCase()], reasonKey: 'mismatchReason', reasonParams: [expectedType, actualType] };
            }
        } catch (fetchError) {
            decision = { messageKey: 'analysisErrorMessage', params: [filename], reasonKey: 'analysisErrorReason' };
        }
      }
    }
  }

  if (decision) {
    const isPotentiallyDangerous = alertType === 'danger' || alertType === 'warning';
    const decisionPayload = {
      downloadId, filename, tabId, alertType,
      message: chrome.i18n.getMessage(decision.messageKey, decision.params),
      reason: chrome.i18n.getMessage(decision.reasonKey, decision.reasonParams || decision.params),
      cancelLabel: isPotentiallyDangerous ? chrome.i18n.getMessage("cancelButton") : "OK",
      proceedLabel: isPotentiallyDangerous ? chrome.i18n.getMessage("proceedButtonKeep") : "Ignorer"
    };
    await sendAlert(decisionPayload);
  } else {
    await logEvent({ filename, decision: 'Allowed', reason: chrome.i18n.getMessage('allowedReasonValid') });
  }
}

function callNativeApp(message) {
  const hostName = "fr.sentinelle.host";
  const messageWithConfig = { ...message, config: CONFIG };
  return new Promise((resolve, reject) => {
    chrome.runtime.sendNativeMessage(hostName, messageWithConfig, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response && response.status === 'error') {
        reject(new Error(response.message));
      } else if (!response) {
        reject(new Error("Réponse vide/invalide du script natif."));
      } else {
        resolve(response);
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'USER_DECISION') {
    handleUserDecision(request);
    sendResponse({ status: "ok" });
  }
  return true;
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    const isPotentiallyDangerous = notificationId.includes('-danger-') || notificationId.includes('-warning-');
    if (!isPotentiallyDangerous) {
        chrome.notifications.clear(notificationId);
        chrome.action.setBadgeText({ text: '' });
        chrome.storage.local.remove('activeAlert');
        return;
    }
    const downloadId = parseInt(notificationId.split('-').pop());
    if (isNaN(downloadId)) return;
    (async () => {
        try {
            const [item] = await chrome.downloads.search({id: downloadId});
            if (!item) return;
            if (buttonIndex === 0) {
                await callNativeApp({ command: "delete", filePath: item.filename });
                await logEvent({filename: item.filename, decision: 'Blocked', reason: "Supprimé par l'utilisateur"});
                await showConfirmationToast(`Le fichier '${item.filename}' a été supprimé.`);
            } else {
                await logEvent({filename: item.filename, decision: 'Forced', reason: "Ignoré par l'utilisateur"});
            }
        } catch (error) {
            if (buttonIndex === 0) chrome.downloads.show(downloadId); 
        } finally {
            chrome.notifications.clear(notificationId);
            chrome.action.setBadgeText({ text: '' });
            chrome.storage.local.remove('activeAlert');
        }
    })();
});

function handleUserDecision(request) {
    const { choice, decision } = request;
    const isPotentiallyDangerous = decision.alertType === 'danger' || decision.alertType === 'warning';
    (async () => {
        if (choice === 'cancel' && isPotentiallyDangerous) {
            try {
                await callNativeApp({ command: "delete", filePath: decision.filename });
                await logEvent({ filename: decision.filename, decision: 'Blocked', reason: decision.reason });
                await showConfirmationToast(`Le fichier '${decision.filename}' a été supprimé.`);
            } catch (error) {
                chrome.downloads.show(decision.downloadId);
            }
        } else if (choice === 'proceed' && isPotentiallyDangerous) {
            await logEvent({ filename: decision.filename, decision: 'Forced', reason: decision.reason });
        }
        chrome.action.setBadgeText({ text: '' });
        chrome.storage.local.remove('activeAlert');
    })();
}

async function sendAlert(decision) {
  if (decision.alertType === 'danger' || decision.alertType === 'warning') {
      await chrome.storage.local.set({ activeAlert: decision });
  }
  await chrome.action.setBadgeText({ text: '!' });
  const color = decision.alertType === 'danger' ? '#e74c3c' : '#f39c12';
  await chrome.action.setBadgeBackgroundColor({ color: color });
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (activeTab && activeTab.id) {
        await chrome.tabs.sendMessage(activeTab.id, { type: 'SHOW_IN_PAGE_ALERT', decision: decision });
        return;
    }
  } catch(e) { /* Fallback */ }
  createSystemNotification(decision);
}

function createSystemNotification(decision) {
    const title = decision.alertType === 'danger' ? chrome.i18n.getMessage('alertTitle') : chrome.i18n.getMessage('warningTitle');
    const notificationId = `alert-${decision.alertType}-${decision.downloadId}`;
    chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon.png'),
        title: title,
        message: decision.message,
        buttons: [ { title: decision.cancelLabel }, { title: decision.proceedLabel } ],
        priority: 2,
        requireInteraction: true
    });
}

async function showConfirmationToast(message) {
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (activeTab && activeTab.id) {
            await chrome.tabs.sendMessage(activeTab.id, { type: 'SHOW_CONFIRMATION_TOAST', message: message });
        }
    } catch (e) {}
}

async function logEvent(event) { 
    const { eventLog = [] } = await chrome.storage.local.get('eventLog');
    eventLog.unshift({ ...event, timestamp: Date.now() });
    const trimmedLog = eventLog.slice(0, 10); 
    await chrome.storage.local.set({ eventLog: trimmedLog });
}

async function logEventFromNotification(downloadId, decisionStatus) { 
    const [item] = await chrome.downloads.search({id: downloadId});
    if (item) {
        await logEvent({filename: item.filename, decision: decisionStatus, reason: "Action via notification"});
    }
}