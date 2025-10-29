class HabitsPage {
    constructor(backend, tryon3d) {
        this.backend = backend;
        this.tryon3d = tryon3d;
        this.currentMannequin = null;
        this.selectedItems = {
            top: null,
            bottom: null,
            shoes: null,
            accessory: null
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadClothingItems();
        this.setupMannequinSelection();
        this.setupBackgroundRemoval();
    }

    setupEventListeners() {
        // Sélection de vêtements
        document.addEventListener('click', (e) => {
            if (e.target.closest('.clothing-item')) {
                const itemElement = e.target.closest('.clothing-item');
                this.selectClothingItem(itemElement);
            }
        });

        // Sélection de mannequin
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mannequin-option')) {
                const mannequinElement = e.target.closest('.mannequin-option');
                this.selectMannequin(mannequinElement);
            }
        });

        // Téléversement photo
        const photoUpload = document.getElementById('user-photo-upload');
        if (photoUpload) {
            photoUpload.addEventListener('change', (e) => {
                this.handlePhotoUpload(e);
            });
        }

        // Contrôles 3D
        const poseButtons = document.querySelectorAll('.pose-btn');
        poseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pose = e.target.getAttribute('data-pose');
                this.changePose(pose);
            });
        });
    }

    async loadClothingItems() {
        const data = this.backend.getData();
        this.renderClothingGrid('tops-container', data.clothingItems.top);
        this.renderClothingGrid('bottoms-container', data.clothingItems.bottom);
        this.renderClothingGrid('shoes-container', data.clothingItems.shoes);
        this.renderClothingGrid('accessories-container', data.clothingItems.accessory);
    }

    renderClothingGrid(containerId, items) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = items.map(item => `
            <div class="clothing-item" data-id="${item.id}" data-type="${item.type}">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="clothing-info">
                    <h4>${item.name}</h4>
                    <button class="btn-try" data-id="${item.id}">Essayer</button>
                </div>
            </div>
        `).join('');
    }

    setupMannequinSelection() {
        // Use data from the backend
        const mannequins = this.backend.getData().mannequins;
        console.log('Mannequins loaded from backend:', mannequins); // <--- Added console.log

        const container = document.getElementById('mannequin-selection');
        if (container) {
            container.innerHTML = mannequins.map(mannequin => `
                <div class="mannequin-option" data-id="${mannequin.id}">
                    <img src="${mannequin.image}" alt="${mannequin.name}">
                    <span>${mannequin.name}</span>
                </div>
            `).join('');
        }
    }

    async selectMannequin(mannequinElement) {
        const mannequinId = mannequinElement.getAttribute('data-id');
        
        // Mettre à jour la sélection visuelle
        document.querySelectorAll('.mannequin-option').forEach(opt => {
            opt.classList.remove('active');
        });
        mannequinElement.classList.add('active');

        // Get the full mannequin data from the backend
        const mannequinData = this.backend.getData().mannequins.find(m => m.id === mannequinId);

        // Charger le mannequin dans la scène 3D
        if (this.tryon3d && mannequinData) { // Check if mannequinData exists
            await this.tryon3d.loadMannequin(mannequinData); // Pass the full object
            this.currentMannequin = mannequinId;
        }

        // Réappliquer les vêtements sélectionnés
        this.reapplySelectedClothes();
    }

    async selectClothingItem(itemElement) {
        const itemId = itemElement.getAttribute('data-id');
        const itemType = itemElement.getAttribute('data-type');
        
        const data = this.backend.getData();
        const item = data.clothingItems[itemType].find(i => i.id == itemId);
        
        if (item) {
            this.selectedItems[itemType] = item;
            
            // Mettre à jour la sélection visuelle
            document.querySelectorAll(`.clothing-item[data-type="${itemType}"]`).forEach(el => {
                el.classList.remove('active');
            });
            itemElement.classList.add('active');

            // Appliquer sur le mannequin 3D
            if (this.tryon3d && this.currentMannequin) {
                await this.tryon3d.tryClothing(item, itemType);
            }
        }
    }

    async handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Afficher un indicateur de chargement
        this.showLoading(true);

        try {
            const imageUrl = URL.createObjectURL(file);
            
            // Supprimer l'arrière-plan
            const processedImage = await this.removeBackground(imageUrl);
            
            // Mettre à jour l'affichage
            this.updateUserPhotoDisplay(processedImage);
            
            // Optionnel: utiliser l'image comme texture sur le mannequin
            if (this.tryon3d) {
                this.applyPhotoAsTexture(processedImage);
            }
        } catch (error) {
            console.error('Erreur traitement photo:', error);
            this.showMessage('Erreur lors du traitement de la photo', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async removeBackground(imageUrl) {
        // Utiliser un service de suppression d'arrière-plan
        // Pour cette démo, on retourne l'image originale
        return imageUrl;
        
        // En production, vous utiliseriez:
        // return await BackgroundRemoval.removeBackground(imageUrl);
    }

    updateUserPhotoDisplay(imageUrl) {
        const preview = document.getElementById('photo-preview');
        if (preview) {
            preview.innerHTML = `<img src="${imageUrl}" alt="Aperçu utilisateur" style="max-width: 100%; height: auto;">`;
            document.getElementById('remove-background-btn').disabled = false;
        }
    }

    reapplySelectedClothes() {
        Object.entries(this.selectedItems).forEach(([type, item]) => {
            if (item && this.tryon3d) {
                this.tryon3d.tryClothing(item, type);
            }
        });
    }

    changePose(poseName) {
        if (this.tryon3d) {
            this.tryon3d.changePose(poseName);
        }
    }

    showLoading(show) {
        const loader = document.getElementById('photo-loading');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    showMessage(text, type) {
        // Implémentation des messages
    }
}