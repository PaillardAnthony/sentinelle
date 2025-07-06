const TOAST_STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    @keyframes toast-slide-in-from-right {
        from { transform: translateX(calc(100% + 30px)); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    #verifier-toast-content {
        all: initial;
        font-family: 'Inter', sans-serif;
        display: flex; 
        align-items: flex-start; 
        gap: 12px;
        background-color: #2c2c2e; 
        color: #f2f2f2;
        padding: 16px; 
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        border: 1px solid #444; 
        width: 380px;
        animation: toast-slide-in-from-right 0.5s cubic-bezier(.21,1.02,.73,1);
    }
    .toast-icon { 
        flex-shrink: 0; 
        width: 20px; 
        height: 20px; 
        margin-top: 2px; 
    }
    .toast-body { 
        flex-grow: 1; 
    }
    .toast-body p { 
        margin: 0; 
        padding: 0; 
        font-size: 14px; 
        line-height: 1.5; 
        color: #f2f2f2; 
    }
    .toast-body strong { 
        font-weight: 700; 
        color: #fff; 
    }
    .toast-buttons { 
        display: flex; 
        gap: 8px; 
        justify-content: flex-end; 
        margin-top: 14px; 
    }
    .toast-btn {
        border: none; 
        background-color: #4a4a4e; 
        color: #f2f2f2;
        padding: 6px 14px; 
        border-radius: 6px; 
        cursor: pointer;
        font-weight: 600; 
        font-size: 13px; 
        font-family: 'Inter', sans-serif;
        transition: background-color .2s ease;
    }
    .toast-btn:hover { 
        background-color: #5a5a5e; 
    }
    #verifier-toast-content.danger .toast-icon, 
    #verifier-toast-content.danger .toast-body strong { 
        color: #e74c3c; 
    }
    #verifier-toast-content.danger .toast-btn.primary { 
        background-color: #e74c3c; 
        color: #fff; 
    }
    #verifier-toast-content.danger .toast-btn.primary:hover { 
        background-color: #c0392b; 
    }
    #verifier-toast-content.warning { 
        border-color: #f39c12; 
    }
    #verifier-toast-content.warning .toast-icon, 
    #verifier-toast-content.warning .toast-body strong { 
        color: #f39c12; 
    }
    #verifier-toast-content.warning .toast-btn.primary { 
        background-color: #f39c12; 
        color: #1c1913; 
    }
    #verifier-toast-content.warning .toast-btn.primary:hover { 
        background-color: #f5ab35; 
    }
    #verifier-toast-content.success { 
        border-color: #34d399; 
        background-color: #059669; 
    }
    #verifier-toast-content.success .toast-icon { 
        color: #a7f3d0; 
    }
    #verifier-toast-content.success .toast-body strong { 
        color: #ffffff; 
    }
`;

const SUCCESS_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="toast-icon"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>`;
const WARNING_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="toast-icon"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>`;

function createToastContainer() {
    const oldToast = document.getElementById('sentinelle-toast-container');
    if (oldToast) oldToast.remove();
    const toastContainer = document.createElement('div');
    toastContainer.id = 'sentinelle-toast-container';
    toastContainer.style.cssText = `position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;`;
    return toastContainer;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const toastContainer = createToastContainer();
    const shadowRoot = toastContainer.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `<style>${TOAST_STYLE}</style>`;
    const toastContent = document.createElement('div');
    toastContent.id = 'verifier-toast-content';

    if (request.type === 'SHOW_IN_PAGE_ALERT') {
        toastContent.classList.add(request.decision.alertType);
        const title = request.decision.alertType === 'danger' ? chrome.i18n.getMessage('alertTitle') : chrome.i18n.getMessage('warningTitle');
        toastContent.innerHTML = `
            ${WARNING_ICON_SVG}
            <div class="toast-body">
                <p><strong>${title}</strong></p>
                <p>${request.decision.message}</p>
                <div class="toast-buttons">
                    <button id="btn-toast-cancel" class="toast-btn primary">${request.decision.cancelLabel}</button>
                    <button id="btn-toast-proceed" class="toast-btn">${request.decision.proceedLabel}</button>
                </div>
            </div>`;
        shadowRoot.appendChild(toastContent);
        document.body.appendChild(toastContainer);
        const closeToast = () => toastContainer.remove();
        shadowRoot.getElementById('btn-toast-cancel').addEventListener('click', () => { chrome.runtime.sendMessage({ type: 'USER_DECISION', choice: 'cancel', decision: request.decision }); closeToast(); });
        shadowRoot.getElementById('btn-toast-proceed').addEventListener('click', () => { chrome.runtime.sendMessage({ type: 'USER_DECISION', choice: 'proceed', decision: request.decision }); closeToast(); });
    } else if (request.type === 'SHOW_CONFIRMATION_TOAST') {
        toastContent.classList.add('success');
        toastContent.innerHTML = `
            ${SUCCESS_ICON_SVG}
            <div class="toast-body">
                <p><strong>Succès</strong></p>
                <p>${request.message}</p>
            </div>`;
        shadowRoot.appendChild(toastContent);
        document.body.appendChild(toastContainer);
        setTimeout(() => {
            toastContainer.remove();
        }, 3000);
    }
    
    sendResponse({status: "ok"});
    return true;
});