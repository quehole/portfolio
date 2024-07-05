document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = document.querySelector(this.getAttribute('href'));
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
            
            // Add animation class to the clicked link for a brief moment
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 500); // Adjust the duration of the animation here (in milliseconds)
        });
    });
});
