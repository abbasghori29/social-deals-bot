document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatMessages = document.getElementById('chat-messages');

    let userInfo = {};
    let currentStep = 'welcome';

    chatbotIcon.addEventListener('click', () => {
        chatbotContainer.classList.toggle('hidden');
        if (!chatbotContainer.classList.contains('hidden') && currentStep === 'welcome') {
            showWelcomeMessage();
        }
    });

    function addMessage(message, isBot = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
        messageDiv.innerHTML = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showWelcomeMessage() {
        addMessage("Yay! You made it! Ready to get started on something exciting? Let's go!");
        setTimeout(showCategories, 1000);
    }

    function showCategories() {
        const categoriesHtml = `
            <div class="space-y-2">
                <button class="option-button w-full" onclick="selectCategory('fundraiser')">Are you looking to raise funds for your cause?</button>
                <button class="option-button w-full" onclick="selectCategory('business')">Are you looking to drive new customers to your business?</button>
                <button class="option-button w-full" onclick="selectCategory('affiliate')">Are you a local influencer wanting to earn affiliate cash?</button>
            </div>
        `;
        addMessage(categoriesHtml);
    }

    window.selectCategory = (category) => {
        userInfo.category = category;
        addMessage(category, false);
        showUserForm();
    };

    function showUserForm() {
        const formHtml = `
            <div class="space-y-2">
                <input type="text" class="form-input" placeholder="Name & Title" onchange="updateUserInfo('name', this.value)">
                <input type="text" class="form-input" placeholder="Business Name" onchange="updateUserInfo('business', this.value)">
                <input type="tel" class="form-input" placeholder="Phone Number" onchange="updateUserInfo('phone', this.value)">
                <input type="email" class="form-input" placeholder="Email Address" onchange="updateUserInfo('email', this.value)">
                <input type="text" class="form-input" placeholder="City & State" onchange="updateUserInfo('location', this.value)">
                <button class="option-button w-full" onclick="submitUserInfo()">Submit</button>
            </div>
        `;
        addMessage("So, what brings you here today? Spill the tea!");
        addMessage(formHtml);
    }

    window.updateUserInfo = (field, value) => {
        userInfo[field] = value;
    };

    window.submitUserInfo = () => {
        addMessage("Thanks for sharing your information!", false);
        showSchedulingOptions();
    };

    function showSchedulingOptions() {
        const optionsHtml = `
            <div class="space-y-2">
                <button class="option-button w-full" onclick="selectScheduling('sooner')">Sooner-the-Better</button>
                <button class="option-button w-full" onclick="selectScheduling('later')">Let's Plan It Out</button>
            </div>
        `;
        addMessage("How would you like to proceed with scheduling?");
        addMessage(optionsHtml);
    }

    window.selectScheduling = (type) => {
        addMessage(type === 'sooner' ? 'Sooner-the-Better' : "Let's Plan It Out", false);
        fetchTimeSlots(type);
    };

    async function fetchTimeSlots(scheduleType) {
        try {
            const response = await fetch('/api/get-time-slots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ scheduleType }),
            });
            const slots = await response.json();
            showTimeSlots(slots);
        } catch (error) {
            console.error('Error fetching time slots:', error);
        }
    }

    function showTimeSlots(slots) {
        const slotsHtml = slots.map(slot => `
            <button 
                class="option-button w-full ${slot.available ? '' : 'opacity-50 cursor-not-allowed'}"
                ${slot.available ? `onclick="bookSlot('${slot.datetime}')"` : ''}
            >
                ${new Date(slot.datetime).toLocaleString()}
                ${slot.available ? '' : ' (Not Available)'}
            </button>
        `).join('');

        addMessage("Please select a time slot:");
        addMessage(`
            <div class="space-y-2">
                ${slotsHtml}
                <button class="option-button w-full" onclick="noSuitableTime()">None of these times work for me</button>
            </div>
        `);
    }

    window.bookSlot = async (slot) => {
        try {
            const response = await fetch('/api/book-slot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ slot, userInfo }),
            });
            const result = await response.json();
            if (result.success) {
                addMessage(`Selected: ${new Date(slot).toLocaleString()}`, false);
                showConfirmation(slot);
            }
        } catch (error) {
            console.error('Error booking slot:', error);
        }
    };

    window.noSuitableTime = () => {
        addMessage("None of these times work for me", false);
        addMessage("Looks like you're swamped. No worries – we will reach out soon to schedule!");
    };

    function showConfirmation(slot) {
        addMessage(`You're all set for ${new Date(slot).toLocaleString()}! 🎉 We can't wait to help you achieve greatness!`);
    }
});