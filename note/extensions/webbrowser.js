(function() {
    'use strict';

    let browserContainer = null;
    let browserIframe = null;
    let isVisible = false;
    let currentUrl = 'https://example.com';

    const styles = `
        #browser-container {
            position: fixed;
            right: 0;
            top: 40px;
            width: 450px;
            height: calc(100vh - 80px);
            background: #1e1e2e;
            border-left: 1px solid #444;
            display: none;
            flex-direction: column;
            z-index: 9999;
            box-shadow: -2px 0 10px rgba(0,0,0,0.5);
            overflow: hidden;
            font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            font-size: 14px;
        }

        #browser-container.active {
            display: flex;
        }

        #browser-container .browser-toolbar {
            display: flex;
            align-items: center;
            padding: 6px 10px;
            background: #2d2d44;
            border-bottom: 1px solid #444;
            gap: 6px;
            flex-shrink: 0;
            font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            font-size: 14px;
            min-height: 36px;
        }

        #browser-container .browser-toolbar button {
            background: transparent;
            border: none;
            color: #ccc;
            cursor: pointer;
            font-size: 16px;
            padding: 4px 6px;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            border-radius: 0;
            height: 28px;
            width: 28px;
        }

        #browser-container .browser-toolbar button:hover {
            background: #3d3d5c;
        }

        #browser-container .browser-toolbar button.danger:hover {
            background: #5c2d2d;
            color: #ff6b6b;
        }

        #browser-container .browser-toolbar .browser-url {
            flex: 1;
            background: #1a1a2e;
            border: 1px solid #444;
            padding: 4px 12px;
            color: #e0e0e0;
            font-size: 14px;
            outline: none;
            min-width: 0;
            font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            border-radius: 0;
            height: 28px;
        }

        #browser-container .browser-toolbar .browser-url:focus {
            border-color: #6b9fff;
        }

        #browser-container .browser-toolbar .browser-url::placeholder {
            color: #666;
        }

        #browser-container .browser-frame {
            flex: 1;
            border: none;
            background: #fff;
            width: 100%;
            height: 100%;
        }

        #browser-container .browser-status {
            padding: 4px 12px;
            background: #2d2d44;
            border-top: 1px solid #444;
            color: #888;
            font-size: 14px;
            flex-shrink: 0;
            display: flex;
            justify-content: space-between;
            font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            min-height: 28px;
            align-items: center;
        }

        #browser-container .browser-status .browser-status-text {
            color: #888;
        }

        #browser-container .browser-status .browser-status-loading {
            color: #6b9fff;
        }

        #browser-container .browser-status .browser-status-error {
            color: #ff6b6b;
        }

        #browser-toggle-btn {
            position: fixed;
            right: 12px;
            bottom: 55px;
            z-index: 9998;
            background: #2d2d44;
            border: 1px solid #444;
            color: #ccc;
            width: 38px;
            height: 38px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            border-radius: 0;
        }

        #browser-toggle-btn:hover {
            background: #3d3d5c;
        }

        #browser-toggle-btn.active {
            background: #6b9fff;
            color: #fff;
        }

        #browser-container .browser-resize-handle {
            position: absolute;
            left: -3px;
            top: 0;
            width: 6px;
            height: 100%;
            cursor: ew-resize;
            background: transparent;
            z-index: 10;
        }

        #browser-container .browser-resize-handle:hover {
            background: rgba(107, 159, 255, 0.2);
        }

        #browser-container .browser-resize-handle.active {
            background: rgba(107, 159, 255, 0.3);
        }

        #browser-container .browser-error {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            padding: 40px;
            text-align: center;
            background: #1a1a2e;
            color: #ccc;
        }

        #browser-container .browser-error.active {
            display: flex;
        }

        #browser-container .browser-error .error-icon {
            font-size: 48px;
            color: #ff6b6b;
            margin-bottom: 16px;
        }

        #browser-container .browser-error .error-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #e0e0e0;
        }

        #browser-container .browser-error .error-message {
            color: #888;
            margin-bottom: 16px;
            max-width: 400px;
        }

        #browser-container .browser-error .error-button {
            background: #6b9fff;
            border: none;
            color: #fff;
            padding: 8px 24px;
            cursor: pointer;
            font-size: 14px;
            font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            border-radius: 0;
            transition: background 0.2s;
        }

        #browser-container .browser-error .error-button:hover {
            background: #5a8aee;
        }

        #browser-container .browser-frame.hidden {
            display: none;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    function createBrowserContainer() {
        if (browserContainer) return;

        browserContainer = document.createElement('div');
        browserContainer.id = 'browser-container';

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'browser-resize-handle';
        browserContainer.appendChild(resizeHandle);

        const toolbar = document.createElement('div');
        toolbar.className = 'browser-toolbar';

        const btnBack = document.createElement('button');
        btnBack.innerHTML = '<span class="codicon codicon-arrow-left"></span>';
        btnBack.title = 'Back';
        btnBack.onclick = () => { try { if (browserIframe) browserIframe.contentWindow.history.back(); } catch(e) {} };

        const btnForward = document.createElement('button');
        btnForward.innerHTML = '<span class="codicon codicon-arrow-right"></span>';
        btnForward.title = 'Forward';
        btnForward.onclick = () => { try { if (browserIframe) browserIframe.contentWindow.history.forward(); } catch(e) {} };

        const btnRefresh = document.createElement('button');
        btnRefresh.innerHTML = '<span class="codicon codicon-sync"></span>';
        btnRefresh.title = 'Refresh';
        btnRefresh.onclick = refreshBrowser;

        const urlInput = document.createElement('input');
        urlInput.className = 'browser-url';
        urlInput.type = 'text';
        urlInput.placeholder = 'Enter URL...';
        urlInput.value = currentUrl;
        urlInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                navigateTo(this.value);
            }
        });

        const btnGo = document.createElement('button');
        btnGo.innerHTML = '<span class="codicon codicon-arrow-right"></span>';
        btnGo.title = 'Go';
        btnGo.style.fontSize = '18px';
        btnGo.onclick = () => navigateTo(urlInput.value);

        const btnOpenNew = document.createElement('button');
        btnOpenNew.innerHTML = '<span class="codicon codicon-link-external"></span>';
        btnOpenNew.title = 'Open in new window';
        btnOpenNew.onclick = () => {
            const url = urlInput.value || currentUrl;
            if (url && url !== 'about:blank') {
                window.open(url, '_blank');
            }
        };

        const btnClose = document.createElement('button');
        btnClose.innerHTML = '<span class="codicon codicon-close"></span>';
        btnClose.className = 'danger';
        btnClose.title = 'Close';
        btnClose.onclick = toggleBrowser;

        toolbar.appendChild(btnBack);
        toolbar.appendChild(btnForward);
        toolbar.appendChild(btnRefresh);
        toolbar.appendChild(urlInput);
        toolbar.appendChild(btnGo);
        toolbar.appendChild(btnOpenNew);
        toolbar.appendChild(btnClose);

        browserContainer.appendChild(toolbar);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'browser-error';
        errorDiv.innerHTML = `
            <div class="error-icon">🔒</div>
            <div class="error-title">Cannot display this page</div>
            <div class="error-message">This website prevents embedding in iframes. Click the button below to open it in a new window.</div>
            <button class="error-button" id="browser-error-btn">Open in new window</button>
        `;
        browserContainer.appendChild(errorDiv);

        browserIframe = document.createElement('iframe');
        browserIframe.className = 'browser-frame';
        browserIframe.src = currentUrl;
        browserIframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals';
        browserIframe.loading = 'eager';
        browserContainer.appendChild(browserIframe);

        const statusBar = document.createElement('div');
        statusBar.className = 'browser-status';

        const statusText = document.createElement('span');
        statusText.className = 'browser-status-text';
        statusText.textContent = 'Ready';

        const statusLoading = document.createElement('span');
        statusLoading.className = 'browser-status-loading';
        statusLoading.textContent = '';

        statusBar.appendChild(statusText);
        statusBar.appendChild(statusLoading);
        browserContainer.appendChild(statusBar);

        document.getElementById('browser-error-btn').addEventListener('click', function() {
            const url = urlInput.value || currentUrl;
            if (url && url !== 'about:blank') {
                window.open(url, '_blank');
            }
        });

        browserIframe.addEventListener('load', function() {
            try {
                const url = this.contentWindow.location.href;
                if (url && url !== 'about:blank') {
                    urlInput.value = url;
                    currentUrl = url;
                }
            } catch (e) {
                if (e.message && e.message.includes('cross-origin')) {
                    showError('This website blocks embedding in iframes.');
                }
            }
            statusText.textContent = 'Loaded';
            statusLoading.textContent = '';
            browserIframe.classList.remove('hidden');
            errorDiv.classList.remove('active');
        });

        browserIframe.addEventListener('error', function() {
            statusText.textContent = 'Load error';
            statusLoading.textContent = '⚠';
        });

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        resizeHandle.addEventListener('mousedown', function(e) {
            isResizing = true;
            startX = e.clientX;
            startWidth = browserContainer.offsetWidth;
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
            resizeHandle.classList.add('active');
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            let newWidth = startWidth - (e.clientX - startX);
            newWidth = Math.max(300, Math.min(800, newWidth));
            browserContainer.style.width = newWidth + 'px';
            if (window.editor && window.editor.layout) {
                window.editor.layout();
            }
        });

        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                resizeHandle.classList.remove('active');
                if (window.editor && window.editor.layout) {
                    window.editor.layout();
                }
            }
        });

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'browser-toggle-btn';
        toggleBtn.innerHTML = '<span class="codicon codicon-globe"></span>';
        toggleBtn.title = 'Open browser';
        toggleBtn.onclick = toggleBrowser;

        document.body.appendChild(browserContainer);
        document.body.appendChild(toggleBtn);

        setTimeout(() => {
            if (window.editor && window.editor.layout) {
                window.editor.layout();
            }
        }, 100);
    }

    function showError(message) {
        const errorDiv = browserContainer.querySelector('.browser-error');
        const iframe = browserContainer.querySelector('.browser-frame');
        if (errorDiv) {
            const msgEl = errorDiv.querySelector('.error-message');
            if (msgEl) msgEl.textContent = message || 'This website prevents embedding in iframes.';
            errorDiv.classList.add('active');
        }
        if (iframe) iframe.classList.add('hidden');
        const statusText = browserContainer.querySelector('.browser-status-text');
        if (statusText) statusText.textContent = 'Blocked';
        const statusLoading = browserContainer.querySelector('.browser-status-loading');
        if (statusLoading) statusLoading.textContent = '🔒';
    }

    function navigateTo(url) {
        if (!url) return;
        let finalUrl = url.trim();

        if (!/^https?:\/\//i.test(finalUrl) && !/^about:/i.test(finalUrl) && !/^file:/i.test(finalUrl) && !/^data:/i.test(finalUrl)) {
            if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
                finalUrl = 'https://' + finalUrl;
            } else {
                finalUrl = 'https://duckduckgo.com/?q=' + encodeURIComponent(finalUrl);
            }
        }

        currentUrl = finalUrl;
        const urlInput = browserContainer.querySelector('.browser-url');
        if (urlInput) urlInput.value = finalUrl;

        const statusText = browserContainer.querySelector('.browser-status-text');
        const statusLoading = browserContainer.querySelector('.browser-status-loading');
        if (statusText) statusText.textContent = 'Loading...';
        if (statusLoading) statusLoading.textContent = '⏳';

        const errorDiv = browserContainer.querySelector('.browser-error');
        if (errorDiv) errorDiv.classList.remove('active');

        const iframe = browserContainer.querySelector('.browser-frame');
        if (iframe) iframe.classList.remove('hidden');

        if (browserIframe) {
            try {
                browserIframe.src = finalUrl;
            } catch (e) {
                browserIframe.src = 'about:blank';
                if (statusText) statusText.textContent = 'Cannot load: ' + e.message;
                if (statusLoading) statusLoading.textContent = '⚠';
                showError('Failed to load this page.');
            }
        }
    }

    function refreshBrowser() {
        if (!browserIframe) return;
        const urlInput = browserContainer.querySelector('.browser-url');
        if (urlInput && urlInput.value) {
            navigateTo(urlInput.value);
        } else {
            browserIframe.src = browserIframe.src;
        }
    }

    function toggleBrowser() {
        if (!browserContainer) createBrowserContainer();

        isVisible = !isVisible;
        browserContainer.classList.toggle('active', isVisible);

        const toggleBtn = document.getElementById('browser-toggle-btn');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', isVisible);
            toggleBtn.innerHTML = isVisible ? '<span class="codicon codicon-close"></span>' : '<span class="codicon codicon-globe"></span>';
            toggleBtn.title = isVisible ? 'Close browser' : 'Open browser';
        }

        if (isVisible) {
            const urlInput = browserContainer.querySelector('.browser-url');
            if (urlInput) {
                setTimeout(() => {
                    urlInput.focus();
                    urlInput.select();
                }, 100);
            }
            setTimeout(() => {
                if (window.editor && window.editor.layout) {
                    window.editor.layout();
                }
            }, 50);
        } else {
            if (window.editor && window.editor.focus) {
                setTimeout(() => window.editor.focus(), 50);
            }
            setTimeout(() => {
                if (window.editor && window.editor.layout) {
                    window.editor.layout();
                }
            }, 50);
        }
    }

    function openBrowser(url) {
        if (!browserContainer) createBrowserContainer();
        if (!isVisible) toggleBrowser();
        if (url) {
            setTimeout(() => navigateTo(url), 100);
        }
    }

    function closeBrowser() {
        if (isVisible) toggleBrowser();
    }

    window.browser = {
        toggle: toggleBrowser,
        open: openBrowser,
        close: closeBrowser,
        navigate: navigateTo,
        refresh: refreshBrowser,
        isVisible: () => isVisible
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBrowserContainer);
    } else {
        createBrowserContainer();
    }

    console.log('Browser panel loaded. Use window.browser.toggle() to open/close.');
})();
