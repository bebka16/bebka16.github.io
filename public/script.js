document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const uniqueWordsEl = document.getElementById('uniqueWords');
    const totalTransitionsEl = document.getElementById('totalTransitions');
    const webKnowledgeEl = document.getElementById('webKnowledge');

    function addMessage(text, type = 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        // Поддерживаем переносы строк
        const formattedText = text.replace(/\n/g, '<br>');
        messageDiv.innerHTML = `<div class="message-content">${formattedText}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function updateStats(stats) {
        if (stats) {
            uniqueWordsEl.textContent = stats.uniqueWords || 0;
            totalTransitionsEl.textContent = stats.totalTransitions || 0;
            webKnowledgeEl.textContent = stats.webKnowledge || 0;
        } else {
            fetch('/stats')
                .then(res => res.json())
                .then(data => {
                    uniqueWordsEl.textContent = data.uniqueWords || 0;
                    totalTransitionsEl.textContent = data.totalTransitions || 0;
                    webKnowledgeEl.textContent = data.webKnowledge || 0;
                })
                .catch(err => console.error('Ошибка:', err));
        }
    }

    async function sendMessage(message) {
        if (!message || message.trim().length === 0) return;

        addMessage(message, 'user');
        messageInput.value = '';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot';
        typingIndicator.innerHTML = `<div class="message-content" style="color:#999;">🔍 Думаю${Math.random() > 0.5 ? ' и ищу в интернете...' : '...'}</div>`;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            const data = await response.json();

            chatMessages.removeChild(typingIndicator);

            if (data.response) {
                addMessage(data.response, 'bot');
            }

            if (data.stats) {
                updateStats(data.stats);
            }

        } catch (error) {
            console.error('Ошибка:', error);
            chatMessages.removeChild(typingIndicator);
            addMessage('❌ Ошибка соединения с сервером', 'bot');
        }
    }

    sendBtn.addEventListener('click', () => {
        sendMessage(messageInput.value);
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(messageInput.value);
        }
    });

    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.dataset.text;
            if (text === 'Очистить память') {
                try {
                    await fetch('/reset', { method: 'POST' });
                    chatMessages.innerHTML = '';
                    addMessage('🗑️ Память сброшена! Теперь я снова учусь.', 'bot');
                    updateStats({ uniqueWords: 0, totalTransitions: 0, webKnowledge: 0 });
                } catch (error) {
                    addMessage('❌ Ошибка сброса памяти', 'bot');
                }
                return;
            }
            sendMessage(text);
        });
    });

    updateStats();
});