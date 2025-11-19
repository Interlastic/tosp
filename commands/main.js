(function(){
    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        updateCards();
        updateTitleBackground();
    }, { passive: true });
    window.addEventListener('load', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        updateCards();
        updateTitleBackground();
    }, { passive: true });

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
            pageWrapper.classList.add("slide-leftup");
            setTimeout(() => { window.location.pathname = '/'; }, 1000);
        }        
    });
    const viewAll = document.getElementById("viewAll");
    viewAll.addEventListener("click", {
        handleEvent() {
            pageWrapper.classList.add("slide-down");
            setTimeout(() => { window.location.pathname = '/try'; }, 1000);
        }        
    });
})();