document.addEventListener('DOMContentLoaded', function() {
    internationalizeHtml();
    displayActiveAlert();
    setupTabs();
    setupHelpTooltips();
    checkCompanionStatus(); 
    displaySettingsView();
    displayHistoryView();
});

function displayActiveAlert() {
    const container = document.getElementById('active-alert-container');
    if (!container) return;

    chrome.storage.local.get('activeAlert', (result) => {
        if (result.activeAlert && Object.keys(result.activeAlert).length > 0) {
            const decision = result.activeAlert;
            
            const alertBox = document.createElement('div');
            alertBox.className = `active-alert-box ${decision.alertType}`;
            
            const title = decision.alertType === 'danger' ? chrome.i18n.getMessage('alertTitle') : chrome.i18n.getMessage('warningTitle');

            alertBox.innerHTML = `
                <strong>${title}</strong>
                <p>${decision.message}</p>
                <div class="alert-buttons">
                    <button class="primary" id="popup-alert-cancel">${decision.cancelLabel}</button>
                    <button id="popup-alert-proceed">${decision.proceedLabel}</button>
                </div>
            `;
            container.innerHTML = ''; // Clear previous content
            container.appendChild(alertBox);

            document.getElementById('popup-alert-cancel').addEventListener('click', () => {
                chrome.runtime.sendMessage({ type: 'USER_DECISION', choice: 'cancel', decision: decision });
                alertBox.remove();
            });
            document.getElementById('popup-alert-proceed').addEventListener('click', () => {
                chrome.runtime.sendMessage({ type: 'USER_DECISION', choice: 'proceed', decision: decision });
                alertBox.remove();
            });
        } else {
            container.innerHTML = '';
        }
    });
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const tabId = button.dataset.tab;
            if (tabId) {
                const tab = document.getElementById(tabId);
                if (tab) tab.classList.add('active');
            }
        });
    });
}

function setupHelpTooltips() {
    document.querySelectorAll('.help-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.target;
            if (targetId) {
                const helpText = document.getElementById(targetId);
                if (helpText) {
                    helpText.classList.toggle('visible');
                }
            }
        });
    });
}

function checkCompanionStatus() {
    const statusBadge = document.getElementById('companion-status-badge');
    const infoButton = document.getElementById('companion-info-button');
    const detailsDiv = document.getElementById('companion-details');
    const helpTitle = detailsDiv.querySelector('strong');
    const helpDesc = detailsDiv.querySelector('p');
    const installButton = detailsDiv.querySelector('#install-companion-button');

    if (!statusBadge || !infoButton || !detailsDiv || !helpTitle || !helpDesc || !installButton) return;

    infoButton.style.display = 'inline-block'; 

    chrome.runtime.sendNativeMessage('fr.sentinelle.host', { command: 'ping' }, (response) => {
        if (chrome.runtime.lastError || !response || response.status !== 'pong') {
            statusBadge.textContent = chrome.i18n.getMessage('companionStatusInactive');
            statusBadge.className = "status-badge inactive";
            helpTitle.textContent = chrome.i18n.getMessage('companionHelpTitle');
            helpDesc.textContent = chrome.i18n.getMessage('companionHelpDesc');
            installButton.style.display = 'block';
            installButton.addEventListener('click', () => {
                chrome.tabs.create({ url: 'https://github.com/PaillardAnthony/sentinelle/releases' });
            });
        } else {
            statusBadge.textContent = chrome.i18n.getMessage('companionStatusActive');
            statusBadge.className = "status-badge active";
            helpTitle.textContent = chrome.i18n.getMessage('companionActiveHelpTitle');
            helpDesc.textContent = chrome.i18n.getMessage('companionActiveHelpDesc');
            installButton.style.display = 'none';
        }
    });
}

function displaySettingsView() {
    const allowScriptsCheckbox = document.getElementById('allowScripts');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const apiKeyStatus = document.getElementById('apiKeyStatus');

    if (!allowScriptsCheckbox || !apiKeyInput || !saveApiKeyButton || !apiKeyStatus) {
        return;
    }

    chrome.storage.sync.get(['alwaysAllowScripts', 'virusTotalApiKey'], (items) => {
        allowScriptsCheckbox.checked = items.alwaysAllowScripts || false;
        
        if (items.virusTotalApiKey && items.virusTotalApiKey.length > 10) {
            apiKeyInput.value = items.virusTotalApiKey;
            apiKeyStatus.textContent = chrome.i18n.getMessage('apiStatusActive');
            apiKeyStatus.className = 'status-badge active';
        } else {
            apiKeyStatus.textContent = chrome.i18n.getMessage('apiStatusInactive');
            apiKeyStatus.className = 'status-badge inactive';
        }
    });

    allowScriptsCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ alwaysAllowScripts: allowScriptsCheckbox.checked }, () => {
             showStatus(chrome.i18n.getMessage('savedStatus'));
        });
    });

    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        chrome.storage.sync.set({ virusTotalApiKey: apiKey }, () => {
            showStatus(chrome.i18n.getMessage('savedStatus'));
            if (apiKey && apiKey.length > 10) {
                apiKeyStatus.textContent = chrome.i18n.getMessage('apiStatusActive');
                apiKeyStatus.className = 'status-badge active';
            } else {
                apiKeyStatus.textContent = chrome.i18n.getMessage('apiStatusInactive');
                apiKeyStatus.className = 'status-badge inactive';
            }
        });
    });
}

function showStatus(message) {
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.classList.add('visible');
        setTimeout(() => { statusDiv.classList.remove('visible'); }, 2000);
    }
}

function displayHistoryView() {
    const logList = document.getElementById('log-list');
    const noHistory = document.getElementById('no-history');
    if (!logList || !noHistory) return;

    const decisionIcons = { Allowed: '✅', Blocked: '❌', Forced: '⚠️' };
    chrome.storage.local.get({ eventLog: [] }, (data) => {
        logList.innerHTML = '';
        if (!data.eventLog || data.eventLog.length === 0) {
            noHistory.style.display = 'block';
        } else {
            noHistory.style.display = 'none';
            data.eventLog.forEach(log => {
                const item = document.createElement('li');
                item.className = 'log-item';
                const icon = decisionIcons[log.decision] || '❓';
                const fullPath = log.filename;
                const basename = fullPath.split(/[\\/]/).pop();
                item.innerHTML = `
                    <div class="log-icon decision-${(log.decision || '').toLowerCase()}">${icon}</div>
                    <div class="log-details">
                        <span class="log-filename" title="${fullPath}">${basename}</span>
                        <span class="log-reason">${log.reason || ""}</span>
                    </div>
                    <span class="log-time">${formatTimeAgo(log.timestamp)}</span>`;
                logList.appendChild(item);
            });
        }
    });
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp) / 1000);
    if (seconds < 60) return "à l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days} j`;
}

function internationalizeHtml() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if(key) elem.textContent = chrome.i18n.getMessage(key) || key;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-title');
        if(key) elem.title = chrome.i18n.getMessage(key) || key;
    });
}