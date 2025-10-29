class CoiffuresPage {
    constructor(backend) {
        this.backend = backend;
        this.currentHairstyle = null;
        this.filters = {
            category: 'all',
            search: ''
        };
        
        this.init();
    }

    async init() {
        await this.loadHairstyles();
        this.setupEventListeners();
        this.setup3DView();
    }

    async loadHairstyles() {
        const data = this.backend.getData();
        this.renderHairstyles(data.hairstyles);
    }

    renderHairstyles(hairstyles) {
        const container = document.getElementById('hairstyles-container');
        if (!container) return;

        const filteredHairstyles = this.filterHairstyles(hairstyles);
        
        container.innerHTML = filteredHairstyles.map(hairstyle => `
            <div class="hairstyle-card" data-id="${hairstyle.id}" data-category="${hairstyle.category}">
                <div class="hairstyle-image">
                    <img src="${hairstyle.image}" alt="${hairstyle.name}" loading="lazy">
                    <div class="hairstyle-overlay">
                        <button class="btn-try-hairstyle" data-id="${hairstyle.id}">Essayer</button>
                        <button class="btn-info" data-id="${hairstyle.id}">ℹ️</button>
                    </div>
                </div>
                <div class="hairstyle-info">
                    <h4>${hairstyle.name}</h4>
                    <p>${hairstyle.description}</p>
                    <div class="hairstyle-meta">
                        <span class="category-tag ${hairstyle.category}">${hairstyle.category}</span>
                        <span class="difficulty">⭐️⭐️⭐️☆</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterHairstyles(hairstyles) {
        return hairstyles.filter(hairstyle => {
            const categoryMatch = this.filters.category === 'all' || hairstyle.category === this.filters.category;
            const searchMatch = !this.filters.search || 
                hairstyle.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                hairstyle.description.toLowerCase().includes(this.filters.search.toLowerCase());
            
            return categoryMatch && searchMatch;
        });
    }

    setupEventListeners() {
        // Filtres
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                this.handleFilterChange(e.target);
            }
            
            if (e.target.matches('.btn-try-hairstyle')) {
                this.tryHairstyle(e.target.getAttribute('data-id'));
            }
        });

        // Recherche
        const searchInput = document.getElementById('hairstyle-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.loadHairstyles();
            });
        }

        // Contrôles 3D
        const applyBtn = document.getElementById('apply-hairstyle');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyCurrentHairstyle();
            });
        }

        // Contrôles d'ajustement
        const scaleSlider = document.getElementById('hairstyle-scale');
        const rotationSlider = document.getElementById('hairstyle-rotation');
        const positionSlider = document.getElementById('hairstyle-position-y');

        if (scaleSlider) scaleSlider.addEventListener('input', (e) => this.adjustHairstyle('scale', e.target.value));
        if (rotationSlider) rotationSlider.addEventListener('input', (e) => this.adjustHairstyle('rotation', e.target.value));
        if (positionSlider) positionSlider.addEventListener('input', (e) => this.adjustHairstyle('position', e.target.value));
    }

    handleFilterChange(filterButton) {
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        filterButton.classList.add('active');

        // Mettre à jour le filtre
        this.filters.category = filterButton.getAttribute('data-filter');
        this.loadHairstyles();
    }

    tryHairstyle(hairstyleId) {
        const data = this.backend.getData();
        this.currentHairstyle = data.hairstyles.find(h => h.id == hairstyleId);
        
        if (this.currentHairstyle) {
            this.updateSelectedHairstylePreview();
            this.enableHairstyleControls();
        }
    }

    updateSelectedHairstylePreview() {
        const preview = document.getElementById('selected-hairstyle-preview');
        if (preview && this.currentHairstyle) {
            preview.innerHTML = `
                <img src="${this.currentHairstyle.image}" alt="${this.currentHairstyle.name}">
                <span>${this.currentHairstyle.name}</span>
            `;
        }
    }

    enableHairstyleControls() {
        const applyBtn = document.getElementById('apply-hairstyle');
        const saveBtn = document.getElementById('save-hairstyle');
        
        if (applyBtn) applyBtn.disabled = false;
        if (saveBtn) saveBtn.disabled = false;
    }

    setup3DView() {
        // Initialiser la vue 3D pour les coiffures
        // Cette partie nécessiterait un composant 3D spécifique aux coiffures
        console.log('Initialisation vue 3D coiffures...');
    }

    applyCurrentHairstyle() {
        if (!this.currentHairstyle) return;
        
        // Appliquer la coiffure sur le modèle 3D
        console.log('Application coiffure:', this.currentHairstyle.name);
        
        // Ici, vous intégreriez avec le système 3D
        this.showMessage(`Coiffure "${this.currentHairstyle.name}" appliquée!`, 'success');
    }

    adjustHairstyle(parameter, value) {
        if (!this.currentHairstyle) return;
        
        // Ajuster la coiffure en temps réel
        console.log(`Ajustement ${parameter}: ${value}`);
        
        // Mettre à jour le rendu 3D
    }

    showMessage(text, type) {
        // Implémentation des messages
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '1000';
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}