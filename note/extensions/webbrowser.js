(function() {
    'use strict';

    let browserWindow = null;
    let isVisible = false;
    let currentUrl = '';

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

        #browser-container .browser-content {
            flex: 1;
            background: #1a1a2e;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }

        #browser-container .browser-content iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: #fff;
        }

        #browser-container .browser-content .search-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 600px;
            padding: 20px;
            gap: 16px;
        }

        #browser-container .browser-content .search-container .search-title {
            color: #e0e0e0;
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 8px;
        }

        #browser-container .browser-content .search-container .search-box {
            display: flex;
            width: 100%;
            gap: 8px;
        }

        #browser-container .browser-content .search-container .search-box input {
            flex: 1;
            background: #1a1a2e;
            border: 1px solid #444;
            padding: 10px 16px;
            color: #e0e0e0;
            font-size: 16px;
            outline: none;
            font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            border-radius: 0;
            height: 40px;
        }

        #browser-container .browser-content .search-container .search-box input:focus {
            border-color: #6b9fff;
        }

        #browser-container .browser-content .search-container .search-box input::placeholder {
            color: #666;
        }

        #browser-container .browser-content .search-container .search-box button {
            background: #6b9fff;
            border: none;
            color: #fff;
            padding: 0 20px;
            cursor: pointer;
            font-size: 14px;
            font-family: 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            border-radius: 0;
            transition: background 0.2s;
            height: 40px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        #browser-container .browser-content .search-container .search-box button:hover {
            background: #5a8aee;
        }

        #browser-container .browser-content .search-container .search-suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
            margin-top: 8px;
        }

        #browser-container .browser-content .search-container .search-suggestions a {
            color: #6b9fff;
            text-decoration: none;
            font-size: 13px;
            padding: 4px 12px;
            background: #2d2d44;
            border: 1px solid #444;
            transition: all 0.2s;
            cursor: pointer;
            border-radius: 0;
        }

        #browser-container .browser-content .search-container .search-suggestions a:hover {
            background: #3d3d5c;
            border-color: #6b9fff;
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
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    function createBrowserContainer() {
        if (browserWindow) return;

        browserWindow = document.createElement('div');
        browserWindow.id = 'browser-container';

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'browser-resize-handle';
        browserWindow.appendChild(resizeHandle);

        const toolbar = document.createElement('div');
        toolbar.className = 'browser-toolbar';

        const btnRefresh = document.createElement('button');
        btnRefresh.innerHTML = '<span class="codicon codicon-sync"></span>';
        btnRefresh.title = 'Refresh';
        btnRefresh.onclick = refreshBrowser;

        const urlInput = document.createElement('input');
        urlInput.className = 'browser-url';
        urlInput.type = 'text';
        urlInput.placeholder = 'Search or enter URL...';
        urlInput.id = 'browser-url-input';
        urlInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                navigateTo(this.value);
            }
        });

        const btnGo = document.createElement('button');
        btnGo.innerHTML = '<span class="codicon codicon-arrow-right"></span>';
        btnGo.title = 'Go';
        btnGo.style.fontSize = '18px';
        btnGo.onclick = () => {
            const input = document.getElementById('browser-url-input');
            if (input) navigateTo(input.value);
        };

        const btnOpenNew = document.createElement('button');
        btnOpenNew.innerHTML = '<span class="codicon codicon-link-external"></span>';
        btnOpenNew.title = 'Open in new window';
        btnOpenNew.onclick = () => {
            const input = document.getElementById('browser-url-input');
            const url = input ? input.value : currentUrl;
            if (url && url !== 'about:blank') {
                window.open(getFullUrl(url), '_blank');
            }
        };

        const btnClose = document.createElement('button');
        btnClose.innerHTML = '<span class="codicon codicon-close"></span>';
        btnClose.className = 'danger';
        btnClose.title = 'Close';
        btnClose.onclick = toggleBrowser;

        toolbar.appendChild(btnRefresh);
        toolbar.appendChild(urlInput);
        toolbar.appendChild(btnGo);
        toolbar.appendChild(btnOpenNew);
        toolbar.appendChild(btnClose);

        browserWindow.appendChild(toolbar);

        const content = document.createElement('div');
        content.className = 'browser-content';
        content.id = 'browser-content';

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.id = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-title">🌐 Web Browser</div>
            <div class="search-box">
                <input type="text" id="search-input" placeholder="Search or enter URL..." />
                <button id="search-button">
                    <span class="codicon codicon-search"></span> Search
                </button>
            </div>
            <div class="search-suggestions">
                <a data-url="https://google.com">Google</a>
                <a data-url="https://duckduckgo.com">DuckDuckGo</a>
                <a data-url="https://github.com">GitHub</a>
                <a data-url="https://stackoverflow.com">Stack Overflow</a>
                <a data-url="https://youtube.com">YouTube</a>
                <a data-url="https://wikipedia.org">Wikipedia</a>
            </div>
        `;

        const iframe = document.createElement('iframe');
        iframe.id = 'browser-iframe';
        iframe.src = 'about:blank';
        iframe.style.display = 'none';

        content.appendChild(searchContainer);
        content.appendChild(iframe);
        browserWindow.appendChild(content);

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
        browserWindow.appendChild(statusBar);

        document.getElementById('search-button').addEventListener('click', function() {
            const input = document.getElementById('search-input');
            if (input) navigateTo(input.value);
        });

        document.getElementById('search-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                navigateTo(this.value);
            }
        });

        document.querySelectorAll('.search-suggestions a').forEach(el => {
            el.addEventListener('click', function() {
                const url = this.dataset.url;
                if (url) {
                    const input = document.getElementById('search-input');
                    if (input) input.value = url;
                    navigateTo(url);
                }
            });
        });

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        resizeHandle.addEventListener('mousedown', function(e) {
            isResizing = true;
            startX = e.clientX;
            startWidth = browserWindow.offsetWidth;
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
            resizeHandle.classList.add('active');
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            let newWidth = startWidth - (e.clientX - startX);
            newWidth = Math.max(300, Math.min(800, newWidth));
            browserWindow.style.width = newWidth + 'px';
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

        document.body.appendChild(browserWindow);
        document.body.appendChild(toggleBtn);

        setTimeout(() => {
            if (window.editor && window.editor.layout) {
                window.editor.layout();
            }
        }, 100);
    }

    function getFullUrl(input) {
        let url = input.trim();
        if (!url) return '';

        if (/^https?:\/\//i.test(url) || /^about:/i.test(url) || /^file:/i.test(url) || /^data:/i.test(url)) {
            return url;
        }

        if (url.includes('.') && !url.includes(' ')) {
            return 'https://' + url;
        }

        return 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
    }

    function navigateTo(input) {
        if (!input) return;
        const fullUrl = getFullUrl(input);

        if (!fullUrl) return;
        currentUrl = fullUrl;

        const urlInput = document.getElementById('browser-url-input');
        if (urlInput) urlInput.value = fullUrl;

        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = fullUrl;

        const searchContainer = document.getElementById('search-container');
        const iframe = document.getElementById('browser-iframe');

        if (searchContainer) searchContainer.style.display = 'none';
        if (iframe) {
            iframe.style.display = 'block';
            try {
                iframe.src = fullUrl;
            } catch (e) {
                iframe.src = 'about:blank';
                showError('Failed to load: ' + e.message);
            }
        }

        const statusText = document.querySelector('.browser-status-text');
        const statusLoading = document.querySelector('.browser-status-loading');
        if (statusText) statusText.textContent = 'Loading...';
        if (statusLoading) statusLoading.textContent = '⏳';
    }

    function showError(message) {
        const statusText = document.querySelector('.browser-status-text');
        const statusLoading = document.querySelector('.browser-status-loading');
        if (statusText) statusText.textContent = 'Error: ' + message;
        if (statusLoading) statusLoading.textContent = '⚠';
    }

    function refreshBrowser() {
        const iframe = document.getElementById('browser-iframe');
        const urlInput = document.getElementById('browser-url-input');
        if (iframe && iframe.src && iframe.src !== 'about:blank') {
            iframe.src = iframe.src;
            const statusText = document.querySelector('.browser-status-text');
            const statusLoading = document.querySelector('.browser-status-loading');
            if (statusText) statusText.textContent = 'Refreshing...';
            if (statusLoading) statusLoading.textContent = '🔄';
        } else if (urlInput && urlInput.value) {
            navigateTo(urlInput.value);
        }
    }

    function toggleBrowser() {
        if (!browserWindow) createBrowserContainer();

        isVisible = !isVisible;
        browserWindow.classList.toggle('active', isVisible);

        const toggleBtn = document.getElementById('browser-toggle-btn');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', isVisible);
            toggleBtn.innerHTML = isVisible ? '<span class="codicon codicon-close"></span>' : '<span class="codicon codicon-globe"></span>';
            toggleBtn.title = isVisible ? 'Close browser' : 'Open browser';
        }

        if (isVisible) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                setTimeout(() => {
                    searchInput.focus();
                    searchInput.select();
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
        if (!browserWindow) createBrowserContainer();
        if (!isVisible) toggleBrowser();
        if (url) {
            setTimeout(() => {
                const input = document.getElementById('search-input');
                if (input) input.value = url;
                navigateTo(url);
            }, 150);
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
