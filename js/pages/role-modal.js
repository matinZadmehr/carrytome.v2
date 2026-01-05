export function initRoleModal() {
    const modal = document.getElementById("role-modal");
    if (!modal) {
        console.error("Role modal element not found!");
        return;
    }

    console.log("Initializing role modal...");

    const show = () => {
        console.log("Showing role modal");
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    };

    const hide = () => {
        console.log("Hiding role modal");
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        document.body.style.overflow = ""; // Restore scrolling
    };

    // Find the big add button
    const bigAddBtn = document.querySelector('#role-button');
    
    if (bigAddBtn) {
        console.log("Found big add button:", bigAddBtn);
        // Remove any existing listeners by cloning
        const newBtn = bigAddBtn.cloneNode(true);
        bigAddBtn.parentNode.replaceChild(newBtn, bigAddBtn);
        
        newBtn.addEventListener('click', (e) => {
            console.log("Add button clicked");
            e.preventDefault();
            e.stopPropagation();
            show();
        });
    } else {
        console.error("Big add button not found!");
        // Try alternative selector
        const altBtn = document.querySelector('button .material-symbols-outlined.text-3xl')?.closest('button');
        if (altBtn) {
            console.log("Found button via alternative selector");
            altBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                show();
            });
        }
    }

    // Close modal when clicking on overlay or close buttons
    modal.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-close-role-modal') || 
            e.target.closest('[data-close-role-modal]')) {
            console.log("Close button clicked");
            hide();
        }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            hide();
        }
    });

    // Close when clicking outside modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hide();
        }
    });

    // Close when clicking on route buttons
    modal.querySelectorAll('[data-route]').forEach(button => {
        button.addEventListener('click', () => {
            hide();
        });
    });

    console.log("Role modal initialized successfully");
}