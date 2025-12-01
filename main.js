(function () {
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
    const cards = document.querySelectorAll('.card');

    const isMobile = () => {
        return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }

    function addCircleToMouse() {
        const circle = document.createElement('div');
        const scrolledAmount = window.scrollY;
        circle.classList.add('circle');
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

    function updateCards() {
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            // Calculate relative position
            const deltaX = (mouse.x - cardCenterX) / (rect.width / 2);
            const deltaY = (mouse.y - cardCenterY) / (rect.height / 2);
            const maxOffset = 15
            // Calculate rotation angles
            const rotateY = Math.max(Math.min(deltaX * 3, maxOffset), -maxOffset);
            const rotateX = Math.min(Math.max(-deltaY * 3, -maxOffset), maxOffset);
            console.log('rotateX:', rotateX, 'rotateY:', rotateY);
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
            pageWrapper.classList.add("slide-left");
            setTimeout(() => { window.location.pathname = '/try'; }, 1000);
        }
    });

    tryBtn.addEventListener("mouseover", scaleCircle);
    tryBtn.addEventListener("mouseout", unScaleCircle);
    document.addEventListener("mousedown", () => {
        squishCircle();
        setTimeout(() => { vibrateCircle(); }, 200);
    });
    document.addEventListener("mouseup", () => {
        setTimeout(() => { unVibrateCircle(); }, 200);
    });
})();