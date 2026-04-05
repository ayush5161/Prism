document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. File Upload Logic & Pagination --- */

    let visibleCount = 8;
    const uploadBtn = document.getElementById('upload-btn');
    const imageUploadInput = document.getElementById('image-upload');
    const gallery = document.getElementById('gallery');
    const dropZone = document.getElementById('drop-zone');
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreArrow = document.getElementById('load-more-arrow');

    function updateGalleryVisibility() {
        const items = gallery.querySelectorAll('.gallery-item');
        let totalItems = items.length;

        items.forEach((item, index) => {
            if (index < visibleCount) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Show arrow if there are more items to reveal
        if (totalItems > visibleCount && loadMoreContainer) {
            loadMoreContainer.style.display = 'flex';
        } else if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    }

    // Call once initially to enforce mock images layout
    updateGalleryVisibility();

    if (loadMoreArrow) {
        loadMoreArrow.addEventListener('click', () => {
            visibleCount += 8;
            updateGalleryVisibility();
        });
    }

    // Trigger file selection window when our custom button is clicked
    uploadBtn.addEventListener('click', () => {
        imageUploadInput.click();
    });

    // A common handler for both clicking and dragging
    function handleFiles(files) {
        if (!files || files.length === 0) return;

        // Strictly enforce top 8 items on new drop
        visibleCount = 8; 

        // Process each file
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return; // Ignore non-images

            const reader = new FileReader();

            reader.onload = (e) => {
                const imageUrl = e.target.result;
                addImageToGallery(imageUrl, file.name);
            };

            // Read the file as a data URL (base64 string)
            reader.readAsDataURL(file);
        });
    }

    // Handle files once selected via button
    imageUploadInput.addEventListener('change', (event) => {
        handleFiles(event.target.files);
        
        // Reset input so the same files can be chosen again if needed
        imageUploadInput.value = '';
    });

    // --- Drag and Drop Event Listeners ---
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            if (e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files);
            }
        });
    }

    function addImageToGallery(src, altText = 'User uploaded image') {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'gallery-item fade-in';

        const img = document.createElement('img');
        img.src = src;
        img.alt = altText;
        img.loading = "lazy";

        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        const span = document.createElement('span');
        span.textContent = 'View';
        overlay.appendChild(span);

        itemContainer.appendChild(img);
        itemContainer.appendChild(overlay);

        // Prepend so new images appear at the top
        gallery.insertBefore(itemContainer, gallery.firstChild);

        // Update layout logic immediately after injecting
        updateGalleryVisibility();
    }


    /* --- 2. Lightbox Interaction Logic --- */

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightboxBtn = document.getElementById('close-lightbox');

    // Use event delegation on the gallery so it works for dynamically uploaded images too!
    gallery.addEventListener('click', (event) => {
        // Find closest gallery item in case we clicked on the overlay
        const item = event.target.closest('.gallery-item');
        if (!item) return;

        const img = item.querySelector('img');
        if (img) {
            openLightbox(img.src, img.alt);
        }
    });

    function openLightbox(src, altText) {
        lightboxImg.src = src;
        lightboxCaption.textContent = altText || '';

        // Show lightbox with animation
        lightbox.style.display = 'flex';
        // Small delay to ensure display:flex is applied before adding opacity class for transition
        setTimeout(() => {
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling underneath
        }, 10);
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restore scrolling

        // Wait for CSS transition to finish before hiding element
        setTimeout(() => {
            lightbox.style.display = 'none';
            lightboxImg.src = '';
        }, 400); // Matches the var(--transition-smooth) 0.4s
    }

    closeLightboxBtn.addEventListener('click', closeLightbox);

    // Also close to clicking anywhere outside the image
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightbox.classList.contains('show')) {
            closeLightbox();
        }
    });

});
