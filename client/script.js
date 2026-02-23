const API_URL = 'http://localhost:3001/generate';

// Generate a unique thread ID for this session
const threadId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const chatContainer = document.getElementById('chatContainer');
const weatherForm = document.getElementById('weatherForm');
const queryInput = document.getElementById('queryInput');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');

// Show empty state initially
showEmptyState();

function showEmptyState() {
    chatContainer.innerHTML = `
        <div class="empty-state">
            <span>🌍</span>
            <p>Ask me about the weather anywhere!</p>
        </div>
    `;
}

function addMessage(content, type) {
    // Remove empty state if present
    const emptyState = chatContainer.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = content;
    chatContainer.appendChild(messageDiv);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    queryInput.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoader.style.display = isLoading ? 'inline' : 'none';
}

async function sendQuery(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                thread_id: threadId
            }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

weatherForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const query = queryInput.value.trim();
    if (!query) return;

    // Add user message
    addMessage(query, 'user');
    queryInput.value = '';

    // Set loading state
    setLoading(true);

    try {
        const result = await sendQuery(query);
        addMessage(result, 'agent');
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, something went wrong. Please make sure the server is running.', 'error');
    } finally {
        setLoading(false);
        queryInput.focus();
    }
});

// Focus input on load
queryInput.focus();
