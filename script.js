document.addEventListener('DOMContentLoaded', () => {
    const heroImage = document.getElementById('heroImage');
    const glow = document.querySelector('.cursor-glow');
    
    // Initial mouse coordinates (center screen)
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Current interpolated coordinates for smooth movement
    let targetX = 0;
    let targetY = 0;
    
    // Smoothing factor (0.0 to 1.0)
    // Lower = smoother, slightly laggy feel. Higher = snappier.
    const smoothing = 0.05; 
    
    // Max movement threshold limits
    const maxMoveX = 40; // Max pixels horizontal translation
    const maxMoveY = 25; // Max pixels vertical translation
    const maxRotate = 10; // Max degrees of 3D tilt

    // Track mouse dynamically over the page
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Update glow position (instant, not lerped for immediate feedback)
        if (glow) {
            // Subtracting 200px (half of 400px glow width) to center it to cursor
            glow.style.transform = `translate(${mouseX - 200}px, ${mouseY - 200}px)`; 
        }
    });

    // Lerp function calculates a small step between current and target
    const lerp = (start, end, factor) => {
        return start + (end - start) * factor;
    };

    // Main animation loop
    const animate = () => {
        // Find screen center dynamically every frame
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Normalize mouse pos from -1 (left/top) to +1 (right/bottom)
        const normX = (mouseX - centerX) / centerX;
        const normY = (mouseY - centerY) / centerY;
        
        // Calculate raw target positions based on max constraints
        const currentTargetMoveX = normX * maxMoveX;
        const currentTargetMoveY = normY * maxMoveY;

        // Apply Lerp to current translation
        targetX = lerp(targetX, currentTargetMoveX, smoothing);
        targetY = lerp(targetY, currentTargetMoveY, smoothing);
        
        // Derive smooth rotation from the smoothed translation, scaled correctly
        const currentRotX = (targetY / maxMoveY) * -maxRotate; // Negative makes it tilt pointing "towards" the mouse
        const currentRotY = (targetX / maxMoveX) * maxRotate;  // Positive maintains correct tilt direction on X axis

        // Apply calculated transform strings
        if (heroImage) {
            heroImage.style.transform = `
                translate(${targetX}px, ${targetY}px) 
                rotateX(${currentRotX}deg) 
                rotateY(${currentRotY}deg)
            `;
        }
        
        // Continuously loop to update frame-by-frame
        requestAnimationFrame(animate);
    };

    // Kickoff loop after load
    animate();
});

/* =========================================
   Page 3: Dynamic Services Logic
========================================= */

const loadServices = async () => {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            console.warn("data.json not found. Did you run `node update-videos.js`?");
            return;
        }
        
        const services = await response.json();
        const container = document.getElementById('services');
        
        if (!container) return;

        services.forEach((service, index) => {
            const colorClass = `card-color-${index % 5}`;
            
            // 1. Render all videos for this service
            const videosHTML = (service.videos || []).map(videoPath => `
                <video class="service-video" autoplay loop muted playsinline>
                    <source src="${videoPath}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `).join('');

            // 2. Render all web links for this service
            const linksHTML = (service.links || []).map(link => `
                <div class="iframe-container full-height-iframe">
                    <iframe src="${link}" class="service-iframe" loading="lazy" frameborder="0"></iframe>
                    <a href="${link}" target="_blank" class="iframe-link-btn">OPEN LIVE</a>
                </div>
            `).join('');

            // 3. Create a single card for the entire service
            const card = document.createElement('div');
            card.className = `service-card ${colorClass}`;
            card.innerHTML = `
                <h3 class="service-title">${service.name}</h3>
                <div class="video-grid">
                    ${videosHTML}
                    ${linksHTML}
                </div>
            `;
            
            container.appendChild(card);
        });

    } catch (error) {
        console.log("Error loading dynamic services: ", error);
    }
};

// Initialize dynamic services
loadServices();

/* =========================================
   Scroll Reveal Animation Logic
========================================= */

const initScrollReveal = () => {
    // We observe both service cards and skill cards
    const revealElements = document.querySelectorAll('.service-card, .skill-card');

    const observerOptions = {
        threshold: 0.15, // Trigger when 15% of the card is visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it hits the bottom
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing after reveal for performance
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
};

// Start the observer after a small delay to ensure dynamic content is loaded
setTimeout(initScrollReveal, 500);
