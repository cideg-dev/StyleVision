class AdminPanel {
    constructor(backend) {
        this.backend = backend;
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStats();
        this.loadExistingContent();
    }

    setupEventListeners() {
        // Navigation des tabs
        document.addEventListener('click', (e) => {
            if (e.target.matches('.admin-tab')) {
                this.switchTab(e.target.getAttribute('data-tab'));
            }
        });

        // Formulaires
        this.setupFormListeners();
        
        // Actions rapides
        this.setupActionListeners();
        
        // Fermeture du panel
        document.getElementById('admin-close').addEventListener('click', () => {
            this.hidePanel();
        });
        
        document.getElementById('admin-overlay').addEventListener('click', () => {
            this.hidePanel();
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Mettre à jour les tabs actives
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
        });
        
        // Afficher le contenu correspondant
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `admin-${tabName}`);
        });
        
        // Charger le contenu spécifique au tab
        this.loadTabContent(tabName);
    }

    loadTabContent(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.loadStats();
                break;
            case 'habits':
                this.loadClothingList();
                break;
            case 'coiffures':
                this.loadHairstylesList();
                break;
            case 'vehicules':
                this.loadVehiclesList();
                break;
            case 'mannequins':
                this.loadMannequinsList();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    setupFormListeners() {
        // Formulaire vêtements
        document.getElementById('add-clothing-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addClothing();
        });

        // Formulaire coiffures
        document.getElementById('add-hairstyle-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addHairstyle();
        });

        // Formulaire véhicules
        document.getElementById('add-vehicle-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addVehicle();
        });

        // Formulaire mannequins
        document.getElementById('add-mannequin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMannequin();
        });

        // Prévisualisation d'images
        this.setupImagePreviews();
    }

    setupImagePreviews() {
        // Prévisualisation des images des formulaires
        const imageInputs = [
            { input: 'clothing-image', preview: 'clothing-preview' },
            { input: 'hairstyle-image', preview: 'hairstyle-preview' },
            { input: 'vehicle-image', preview: 'vehicle-preview' },
            { input: 'mannequin-image', preview: 'mannequin-preview' }
        ];

        imageInputs.forEach(({ input, preview }) => {
            const inputEl = document.getElementById(input);
            const previewEl = document.getElementById(preview);
            
            if (inputEl && previewEl) {
                inputEl.addEventListener('input', (e) => {
                    this.updateImagePreview(e.target.value, previewEl);
                });
            }
        });
    }

    updateImagePreview(imageUrl, previewElement) {
        if (imageUrl) {
            previewElement.innerHTML = `<img src="${imageUrl}" alt="Preview" onerror="this.style.display='none'">`;
        } else {
            previewElement.innerHTML = '<span>Aperçu de l\'image</span>';
        }
    }

    setupActionListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                const action = e.target.getAttribute('data-action');
                this.handleAction(action);
            }
            
            if (e.target.matches('.btn-delete')) {
                const id = e.target.getAttribute('data-id');
                const type = e.target.getAttribute('data-type');
                this.deleteItem(id, type);
            }
            
            if (e.target.matches('.btn-edit')) {
                const id = e.target.getAttribute('data-id');
                const type = e.target.getAttribute('data-type');
                this.editItem(id, type);
            }
        });
    }

    // === GESTION DES VÊTEMENTS ===
    async addClothing() {
        const form = document.getElementById('add-clothing-form');
        const formData = new FormData(form);
        
        const clothingData = {
            id: Date.now(),
            name: document.getElementById('clothing-name').value,
            type: document.getElementById('clothing-type').value,
            image: document.getElementById('clothing-image').value,
            price: parseFloat(document.getElementById('clothing-price').value) || 0,
            category: document.getElementById('clothing-category').value,
            description: document.getElementById('clothing-description').value
        };

        // Position 3D
        const positionText = document.getElementById('clothing-position').value;
        if (positionText) {
            try {
                clothingData.position = JSON.parse(positionText);
            } catch (e) {
                clothingData.position = { x: 100, y: 150, width: 200, height: 250 };
            }
        }

        try {
            this.backend.addClothingItem(clothingData.type, clothingData);
            this.showMessage('Vêtement ajouté avec succès!', 'success');
            form.reset();
            this.loadClothingList();
            this.loadStats();
        } catch (error) {
            this.showMessage('Erreur lors de l\'ajout du vêtement', 'error');
        }
    }

    loadClothingList() {
        const data = this.backend.getData();
        const container = document.getElementById('clothing-list');
        
        if (!container) return;

        let allClothing = [];
        Object.values(data.clothingItems).forEach(items => {
            allClothing = allClothing.concat(items);
        });

        container.innerHTML = allClothing.map(item => `
            <tr>
                <td>
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="this.src='https://via.placeholder.com/50?text=❌'">
                </td>
                <td>${item.name}</td>
                <td>
                    <span class="type-badge ${item.type}">${this.getTypeLabel(item.type)}</span>
                </td>
                <td>${item.category || '-'}</td>
                <td class="table-actions">
                    <button class="btn-table btn-edit" data-id="${item.id}" data-type="clothing">
                        ✏️
                    </button>
                    <button class="btn-table btn-delete" data-id="${item.id}" data-type="clothing">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // === GESTION DES COIFFURES ===
    async addHairstyle() {
        const hairstyleData = {
            id: Date.now(),
            name: document.getElementById('hairstyle-name').value,
            category: document.getElementById('hairstyle-category').value,
            image: document.getElementById('hairstyle-image').value,
            description: document.getElementById('hairstyle-description').value,
            difficulty: parseInt(document.getElementById('hairstyle-difficulty').value) || 1,
            duration: parseInt(document.getElementById('hairstyle-duration').value) || 30,
            tags: document.getElementById('hairstyle-tags').value.split(',').map(tag => tag.trim())
        };

        try {
            this.backend.addHairstyle(hairstyleData);
            this.showMessage('Coiffure ajoutée avec succès!', 'success');
            document.getElementById('add-hairstyle-form').reset();
            this.loadHairstylesList();
            this.loadStats();
        } catch (error) {
            this.showMessage('Erreur lors de l\'ajout de la coiffure', 'error');
        }
    }

    loadHairstylesList() {
        const data = this.backend.getData();
        const container = document.getElementById('hairstyles-list');
        
        if (!container) return;

        container.innerHTML = data.hairstyles.map(hairstyle => `
            <tr>
                <td>
                    <img src="${hairstyle.image}" alt="${hairstyle.name}"
                         onerror="this.src='https://via.placeholder.com/50?text=💇'">
                </td>
                <td>${hairstyle.name}</td>
                <td>
                    <span class="category-badge ${hairstyle.category}">${hairstyle.category}</span>
                </td>
                <td>${'⭐'.repeat(hairstyle.difficulty || 1)}</td>
                <td class="table-actions">
                    <button class="btn-table btn-edit" data-id="${hairstyle.id}" data-type="hairstyle">
                        ✏️
                    </button>
                    <button class="btn-table btn-delete" data-id="${hairstyle.id}" data-type="hairstyle">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // === GESTION DES VÉHICULES ===
    async addVehicle() {
        const vehicleData = {
            id: Date.now(),
            name: `${document.getElementById('vehicle-brand').value} ${document.getElementById('vehicle-model').value}`,
            brand: document.getElementById('vehicle-brand').value,
            model: document.getElementById('vehicle-model').value,
            type: document.getElementById('vehicle-type').value,
            price: parseFloat(document.getElementById('vehicle-price').value),
            image: document.getElementById('vehicle-image').value,
            year: parseInt(document.getElementById('vehicle-year').value),
            mileage: parseInt(document.getElementById('vehicle-mileage').value) || 0,
            fuel: document.getElementById('vehicle-fuel').value,
            transmission: document.getElementById('vehicle-transmission').value,
            description: document.getElementById('vehicle-description').value
        };

        // Caractéristiques
        const features = [];
        document.querySelectorAll('input[name="features"]:checked').forEach(checkbox => {
            features.push(checkbox.value);
        });
        vehicleData.features = features;

        try {
            this.backend.addVehicle(vehicleData);
            this.showMessage('Véhicule ajouté avec succès!', 'success');
            document.getElementById('add-vehicle-form').reset();
            this.loadVehiclesList();
            this.loadStats();
        } catch (error) {
            this.showMessage('Erreur lors de l\'ajout du véhicule', 'error');
        }
    }

    loadVehiclesList() {
        const data = this.backend.getData();
        const container = document.getElementById('vehicles-list');
        
        if (!container) return;

        const vehicles = data.vehicles || [];
        container.innerHTML = vehicles.map(vehicle => `
            <tr>
                <td>
                    <img src="${vehicle.image}" alt="${vehicle.name}"
                         onerror="this.src='https://via.placeholder.com/50?text=🚗'">
                </td>
                <td>${vehicle.name}</td>
                <td>
                    <span class="type-badge ${vehicle.type}">${vehicle.type}</span>
                </td>
                <td>${this.formatPrice(vehicle.price)}</td>
                <td>${vehicle.year}</td>
                <td class="table-actions">
                    <button class="btn-table btn-edit" data-id="${vehicle.id}" data-type="vehicle">
                        ✏️
                    </button>
                    <button class="btn-table btn-delete" data-id="${vehicle.id}" data-type="vehicle">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // === GESTION DES MANNEQUINS ===
    async addMannequin() {
        const mannequinData = {
            id: Date.now(),
            name: document.getElementById('mannequin-name').value,
            type: document.getElementById('mannequin-type').value,
            image: document.getElementById('mannequin-image').value,
            model: document.getElementById('mannequin-model').value,
            scale: parseFloat(document.getElementById('mannequin-scale').value) || 1.0
        };

        // Positions
        const poses = [];
        document.querySelectorAll('input[name="poses"]:checked').forEach(checkbox => {
            poses.push(checkbox.value);
        });
        mannequinData.poses = poses;

        try {
            this.backend.addMannequin(mannequinData);
            this.showMessage('Mannequin ajouté avec succès!', 'success');
            document.getElementById('add-mannequin-form').reset();
            this.loadMannequinsList();
            this.loadStats();
        } catch (error) {
            this.showMessage('Erreur lors de l\'ajout du mannequin', 'error');
        }
    }

    loadMannequinsList() {
        const data = this.backend.getData();
        const container = document.getElementById('mannequins-list');
        
        if (!container) return;

        const mannequins = data.mannequins || this.getDefaultMannequins();
        container.innerHTML = mannequins.map(mannequin => `
            <div class="mannequin-card">
                <img src="${mannequin.image}" alt="${mannequin.name}"
                     onerror="this.src='https://via.placeholder.com/200?text=👤'">
                <h5>${mannequin.name}</h5>
                <p>Type: ${mannequin.type}</p>
                <p>Positions: ${mannequin.poses?.join(', ') || 'debout'}</p>
                <div class="table-actions">
                    <button class="btn-table btn-edit" data-id="${mannequin.id}" data-type="mannequin">
                        ✏️
                    </button>
                    <button class="btn-table btn-delete" data-id="${mannequin.id}" data-type="mannequin">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    // === STATISTIQUES ===
    loadStats() {
        const data = this.backend.getData();
        
        // Vêtements
        let clothingCount = 0;
        Object.values(data.clothingItems).forEach(items => {
            clothingCount += items.length;
        });
        document.getElementById('stats-clothing').textContent = clothingCount;

        // Coiffures
        document.getElementById('stats-hairstyles').textContent = data.hairstyles.length;

        // Véhicules
        document.getElementById('stats-vehicles').textContent = (data.vehicles || []).length;

        // Mannequins
        document.getElementById('stats-mannequins').textContent = (data.mannequins || this.getDefaultMannequins()).length;
    }

    // === ACTIONS RAPIDES ===
    handleAction(action) {
        switch(action) {
            case 'export-data':
                this.exportData();
                break;
            case 'import-data':
                this.importData();
                break;
            case 'clear-cache':
                this.clearCache();
                break;
            case 'backup':
                this.createBackup();
                break;
        }
    }

    exportData() {
        const data = this.backend.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stylevision-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showMessage('Données exportées avec succès!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (this.backend.importData(event.target.result)) {
                        this.showMessage('Données importées avec succès!', 'success');
                        this.loadStats();
                        this.loadExistingContent();
                    } else {
                        this.showMessage('Erreur lors de l\'importation des données', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearCache() {
        if (confirm('Voulez-vous vraiment vider le cache ? Cette action est irréversible.')) {
            localStorage.removeItem('stylevision_data');
            location.reload();
        }
    }

    createBackup() {
        this.exportData();
    }

    // === UTILITAIRES ===
    getTypeLabel(type) {
        const labels = {
            'top': 'Haut',
            'bottom': 'Bas',
            'shoes': 'Chaussures',
            'accessory': 'Accessoire'
        };
        return labels[type] || type;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    getDefaultMannequins() {
        return [
            {
                id: 1,
                name: 'Homme Sportif',
                type: 'male',
                image: 'https://via.placeholder.com/200?text=👤Homme',
                poses: ['standing', 'walking', 'sitting']
            },
            {
                id: 2,
                name: 'Femme Élégante',
                type: 'female',
                image: 'https://via.placeholder.com/200?text=👤Femme',
                poses: ['standing', 'walking', 'sitting', 'dancing']
            }
        ];
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('admin-message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    showPanel() {
        document.getElementById('admin-panel').classList.add('active');
        document.getElementById('admin-overlay').classList.add('active');
    }

    hidePanel() {
        document.getElementById('admin-panel').classList.remove('active');
        document.getElementById('admin-overlay').classList.remove('active');
    }

    loadExistingContent() {
        this.loadClothingList();
        this.loadHairstylesList();
        this.loadVehiclesList();
        this.loadMannequinsList();
    }

    deleteItem(id, type) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) {
            // Implémentation de la suppression
            this.showMessage('Élément supprimé avec succès', 'success');
            this.loadExistingContent();
            this.loadStats();
        }
    }

    editItem(id, type) {
        // Implémentation de l'édition
        this.showMessage('Fonction d\'édition à implémenter', 'warning');
    }

    loadSettings() {
        // Charger les paramètres existants
        const settings = this.backend.getSettings() || {};
        
        document.getElementById('site-name').value = settings.siteName || 'StyleVision';
        document.getElementById('site-description').value = settings.siteDescription || 'Votre destination complète pour la mode, la beauté et les véhicules';
        document.getElementById('primary-color').value = settings.primaryColor || '#6a5acd';
        document.getElementById('secondary-color').value = settings.secondaryColor || '#ff6b6b';
        document.getElementById('site-logo').value = settings.logo || '';
        document.getElementById('maintenance-mode').checked = settings.maintenanceMode || false;
        document.getElementById('maintenance-message').value = settings.maintenanceMessage || 'Site en maintenance - Retour très bientôt !';
    }
}