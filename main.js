(function(){
    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', e => {
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
            
            // Calculate relative position (-1 to 1)
            const deltaX = (mouse.x - cardCenterX) / (rect.width / 2);
            const deltaY = (mouse.y - cardCenterY) / (rect.height / 2);
            
            // Calculate rotation angles (max 15 degrees)
            const rotateY = deltaX * 3;
            const rotateX = -deltaY * 3;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${1 + (1 - Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 2.5, 1)) * 0.1})`;        
        }
    }

    const titleSub = document.querySelector('.niteTitleSub');
    
    function updateTitleBackground() {
        const rect = titleSub.getBoundingClientRect();
        titleSub.style.backgroundPositionX = `${mouse.x * 0.25 - rect.left + rect.width / 2}px`;
    }
})();