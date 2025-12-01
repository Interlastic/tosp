(function () {
    const idToString = {
        1: 'Hey, how are you?', // "/ask Hey!"
        2: 'nite hewooo\nnite wiggly flippers\nnite happy see you\nwhats up?‌', // "/nite hey nite"
        3: 'What can I do for you today?', // "/ask Can you help me?"
        4: "One of the rarest spider species is the Mysmena bleakleyi, also known as the Bleakley's spider. Discovered in a small region in the UK, its limited habitat and low population make it extremely rare. Another contender is the Hogna 'goliath', a large wolf spider found in specific parts of South America. These spiders often face threats from habitat loss and environmental changes.", // "/ask What is one of the rarest spider species?"

        // Commands branching from option 1
        5: "I'm doing great, thanks for asking! I'm here to help you with any questions or tasks you might have.", // "/ask I'm doing good, how about you?"
        6: "I'm sorry you feel that way, but still ready to assist you with whatever you need!", // "/ask Not so good"

        // Commands branching from option 2
        7: 'nite sleepy now\nnite want blanket\nnite snuggle tight‌ ‌', // "/nite sleep well"
        8: 'nite fishy?\nnite super happy\nnite love fishy‌ ‌', // "/nite me give fishy to you"
        9: 'nite want fishy!\nnite big yum!\nnite dream of fishy‌ ‌', // "/nite want fishy?"

        // Commands branching from option 3
        10: "I can help you with information, answer questions, provide recommendations, or just have a conversation. What would you like assistance with?", // "/ask What can you help me with?"
        11: "I can help with a wide range of topics including science, history, technology, and much more. Just let me know what you're curious about!", // "/ask What topics can you help with?"
        12: "I'm here to provide information, answer questions, give suggestions, or simply chat. How can I assist you today?", // "/ask What services do you offer?"
        13: 10,
    };
    const idToCommand = {
        1: '/ask Hey!',
        2: '/nite hey nite',
        3: '/ask Can you help me?',
        4: '/ask What is one of the rarest spider species?',
        5: '/ask I\'m doing good, how about you?',
        6: '/ask Not so good',
        7: '/nite sleep well',
        8: '/nite me give fishy to you',
        9: '/nite want fishy?',
        10: '/ask What can you help me with?',
        11: '/ask What topics can you help with?',
        12: '/ask What services do you offer?',
        13: '/ask What else can you do?'
    };

    let currentOptions = [1, 2, 3];
    let isAnimating = false;
    function updateCommandButtons() {
        if (isAnimating) return;
        isAnimating = true;

        const commandItems = document.querySelectorAll('.command-item');


        commandItems.forEach(item => {
            item.classList.add('fade-out');
        });

        setTimeout(() => {
            commandItems.forEach((item, index) => {
                if (currentOptions[index]) {
                    const commandId = currentOptions[index];
                    item.querySelector('.command-label').textContent = idToCommand[commandId];
                    item.dataset.commandId = commandId;
                    item.style.display = 'block';


                    item.style.animation = 'none';
                    item.offsetHeight;
                    item.style.animation = null;


                    item.classList.remove('fade-out');
                } else {
                    item.style.display = 'none';
                }
            });

            isAnimating = false;
        }, 300);
    }

    function handleCommandClick(event) {
        const commandId = parseInt(event.currentTarget.dataset.commandId);


        const output = document.getElementById('output');


        output.style.animation = 'none';
        output.offsetHeight;

        output.style.animation = 'outputBoxAnimation 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';


        setTimeout(() => {
            let text = idToString[commandId];

            if (!isNaN(text)) {
                text = idToString[Number(text)];
            }

            output.textContent = text;



            output.style.animation = 'none';
            output.offsetHeight;

            output.style.animation = 'outputTextAnimation 0.4s ease-out forwards';
        }, 200);


        if (commandId >= 1 && commandId <= 4) {
            if (commandId === 1) {
                currentOptions = [4, 5, 6];
            } else if (commandId === 2) {
                currentOptions = [7, 8, 9];
            } else if (commandId === 3) {
                currentOptions = [10, 11, 12];
            } else if (commandId === 4) {
                currentOptions = [13, 11, 2];
            }
        } else {
            currentOptions = [1, 2, 3];
        }


        updateCommandButtons();
    }


    document.querySelectorAll('.command-item').forEach(item => {
        item.addEventListener('click', handleCommandClick);
    });


    updateCommandButtons();

    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        updateCards();
        updateTitleBackground();
        if (!isMobile()) {
            moveCircle();
        }
    }, { passive: true });
    window.addEventListener('load', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        updateCards();
        updateTitleBackground();
        if (!isMobile()) {
            addCircleToMouse();
            moveCircle();
        }
    }, { passive: true });

    const isMobile = () => {
        return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }

    function addCircleToMouse() {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        const scrolledAmount = window.scrollY;
        circle.style.left = `${mouse.x}px`;
        circle.style.top = `${mouse.y + scrolledAmount}px`;
        document.body.appendChild(circle);
    }

    function moveCircle() {
        const circle = document.querySelector('.circle');
        circle.style.left = `${mouse.x - 25}px`;
        circle.style.top = `${mouse.y + window.scrollY - 25}px`;
        // hide real mouse cursor
        document.body.style.cursor = 'none';
    }
    function scaleCircle() {
        const circle = document.querySelector('.circle');
        circle.classList.add('hovering');
    }
    function unScaleCircle() {
        const circle = document.querySelector('.circle');
        circle.classList.remove('hovering');
    }
    function vibrateCircle() {
        const circle = document.querySelector('.circle');
        circle.classList.add('vibrating');
    }
    function unVibrateCircle() {
        const circle = document.querySelector('.circle');
        circle.classList.remove('vibrating');
        circle.classList.remove('squished');
    }
    function squishCircle() {
        const circle = document.querySelector('.circle');
        circle.classList.add('squished');
    }

    const cards = document.querySelectorAll('.card');

    function updateCards() {
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;
            const deltaX = (mouse.x - cardCenterX) / (rect.width / 2);
            const deltaY = (mouse.y - cardCenterY) / (rect.height / 2);
            const maxOffset = 15
            const rotateY = Math.max(Math.min(deltaX * 3, maxOffset), -maxOffset);
            const rotateX = Math.min(Math.max(-deltaY * 3, -maxOffset), maxOffset);

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${1 + (1 - Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 2.5, 1)) * 0.1})`;
        }
    }

    const titleSub = document.querySelector('.niteTitleSub');

    function updateTitleBackground() {
        const rect = titleSub.getBoundingClientRect();
        titleSub.style.backgroundPositionX = `${mouse.x * 0.25 - rect.left + rect.width / 2}px`;
    }

    const tryBtn = document.getElementById("tryBtn");
    const pageWrapper = document.getElementById("pageWrapper");
    tryBtn.addEventListener("click", {
        handleEvent() {
            pageWrapper.classList.add("slide-right");
            setTimeout(() => { window.location.pathname = '/'; }, 1000);
        }
    });


    tryBtn.addEventListener("mouseover", scaleCircle);
    tryBtn.addEventListener("mouseout", unScaleCircle);

    const viewAll = document.getElementById("viewAll");
    viewAll.addEventListener("click", {
        handleEvent() {
            pageWrapper.classList.add("slide-up");
            setTimeout(() => { window.location.pathname = '/commands'; }, 1000);
        }
    });
    viewAll.addEventListener("mouseover", scaleCircle);
    viewAll.addEventListener("mouseout", unScaleCircle);

    document.querySelectorAll('.command-item').forEach(item => {
        item.addEventListener('mouseover', scaleCircle);
        item.addEventListener('mouseout', unScaleCircle);
    });

    document.addEventListener("mousedown", () => {
        squishCircle();
        setTimeout(() => { vibrateCircle(); }, 200);
    });
    document.addEventListener("mouseup", () => {
        setTimeout(() => { unVibrateCircle(); }, 200);
    });
})();