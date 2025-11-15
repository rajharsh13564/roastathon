document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    // Auto-resize textarea as user types
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${Math.min(userInput.scrollHeight, 200)}px`;
    });

    // Send message when clicking the send button
    sendButton.addEventListener('click', handleSendMessage);
    
    // Send message when pressing Enter (but allow Shift+Enter for new lines)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Handle sending a message
    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show typing indicator
        const typingIndicatorId = showTypingIndicator();
        
        try {
            let response;
            
            // Check if it's an image generation request
            if (message.toLowerCase().startsWith('generate image:')) {
                const prompt = message.substring('generate image:'.length).trim();
                const imageUrl = await window.RoastAPI.generateImage(prompt);
                response = `<img src="${imageUrl}" alt="Generated image" onerror="this.src='https://via.placeholder.com/512?text=Image+Generation+Failed'">`;
            } else {
                // Regular text response
                response = await window.RoastAPI.generateRoast(message);
            }
            
            // Remove typing indicator and show response
            removeTypingIndicator(typingIndicatorId);
            addMessage(response, 'bot');
        } catch (error) {
            // Remove typing indicator and show error
            removeTypingIndicator(typingIndicatorId);
            addMessage(error.message || "Oops! Something went wrong. Try again!", 'bot');
        }
        
        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Add a message to the chat
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Check if content is HTML or plain text
        if (content.startsWith('<img')) {
            messageContent.innerHTML = content;
        } else {
            const messageText = document.createElement('p');
            messageText.textContent = content;
            messageContent.appendChild(messageText);
        }
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Auto-scroll to the new message
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingContent.appendChild(dot);
        }
        
        typingDiv.appendChild(typingContent);
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return 'typing-indicator';
    }
    
    // Remove typing indicator
    function removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Initial focus on the input
    userInput.focus();
});
