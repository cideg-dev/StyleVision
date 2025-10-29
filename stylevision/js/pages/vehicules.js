class VehiculesPage {
    constructor(backend, tryon3d) {
        this.backend = backend;
        this.tryon3d = tryon3d;
        this.currentVehicle = null;
        this.currentView = 'exterior';
        this.currentPosition = 'standing';
        
        this.init();
    }

    async init() {
        await this.loadVehicles();
        this.setupEventListeners();
        this.setup3DVehicleView();
        this.setupFinancingCalculator();
    }

    async loadVehicles() {
        const data = this.backend.getData();
        const vehicles = data.vehicles || this.getDefaultVehicles();
        this.renderVehicles(vehicles);
    }

    getDefaultVehicles() {
        return [
            {
                id: 1,
                name: "Mercedes Classe A",
                price: 35000,
                year: 2023,
                mileage: 15000,
                fuel: "Essence",
                type: "voiture",
                brand: "mercedes",
                image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
                description: "Berline compacte premium"
            },
            {
                id: 2,
                name: "BMW Série 3",
                price: 42000,
                year: 2023,
                mileage: 8000,
                fuel: "Diesel",
                type: "voiture",
                brand: "bmw",
                image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
                description: "Sportive et élégante"
            },
            {
                id: 3,
                name: "Tesla Model 3",
                price: 45000,
                year: 2023,
                mileage: 5000,
                fuel: "Électrique",
                type: "voiture",
                brand: "tesla",
                image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
                description: "Innovation électrique"
            }
        ];
    }

    renderVehicles(vehicles) {
        const container = document.getElementById('vehicles-container');
        if (!container) return;

        const filteredVehicles = this.filterVehicles(vehicles);
        
        container.innerHTML = filteredVehicles.map(vehicle => `
            <div class="vehicle-card" data-id="${vehicle.id}">
                <div class="vehicle-image">
                    <img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">
                    <div class="vehicle-overlay">
                        <button class="btn-view-3d" data-id="${vehicle.id}">👁️ Voir en 3D</button>
                        <button class="btn-details" data-id="${vehicle.id}">📋 Détails</button>
                    </div>
                </div>
                <div class="vehicle-info">
                    <h4>${vehicle.name}</h4>
                    <p>${vehicle.description}</p>
                    <div class="vehicle-specs">
                        <span class="price">${this.formatPrice(vehicle.price)}</span>
                        <span class="year">${vehicle.year}</span>
                        <span class="mileage">${vehicle.mileage} km</span>
                    </div>
                    <div class="vehicle-meta">
                        <span class="fuel ${vehicle.fuel}">${vehicle.fuel}</span>
                        <span class="brand ${vehicle.brand}">${vehicle.brand}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterVehicles(vehicles) {
        const typeFilter = document.getElementById('vehicle-type')?.value || 'all';
        const brandFilter = document.getElementById('vehicle-brand')?.value || 'all';
        const priceFilter = document.getElementById('price-range')?.value || 100000;

        return vehicles.filter(vehicle => {
            const typeMatch = typeFilter === 'all' || vehicle.type === typeFilter;
            const brandMatch = brandFilter === 'all' || vehicle.brand === brandFilter;
            const priceMatch = vehicle.price <= priceFilter;
            
            return typeMatch && brandMatch && priceMatch;
        });
    }

    setupEventListeners() {
        // Filtres
        document.addEventListener('change', (e) => {
            if (e.target.matches('#vehicle-type') || 
                e.target.matches('#vehicle-brand') ||
                e.target.matches('#price-range')) {
                this.loadVehicles();
                
                if (e.target.matches('#price-range')) {
                    this.updatePriceDisplay(e.target.value);
                }
            }
        });

        // Sélection véhicule
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-view-3d')) {
                this.viewVehicle3D(e.target.getAttribute('data-id'));
            }
            
            if (e.target.matches('.btn-details')) {
                this.showVehicleDetails(e.target.getAttribute('data-id'));
            }
            
            if (e.target.matches('.view-btn')) {
                this.changeView(e.target.getAttribute('data-view'));
            }
            
            if (e.target.matches('.position-btn')) {
                this.changePosition(e.target.getAttribute('data-position'));
            }
            
            if (e.target.matches('.door-btn')) {
                this.toggleDoor(e.target.getAttribute('data-door'));
            }
        });

        // Calculatrice de financement
        this.setupFinancingEventListeners();
    }

    viewVehicle3D(vehicleId) {
        const data = this.backend.getData();
        this.currentVehicle = data.vehicles.find(v => v.id == vehicleId);
        
        if (this.currentVehicle && this.tryon3d) {
            this.loadVehicle3DModel(this.currentVehicle);
            this.showVehicleDetails(vehicleId);
        }
    }

    async loadVehicle3DModel(vehicle) {
        // Charger le modèle 3D du véhicule
        console.log('Chargement modèle 3D:', vehicle.name);
        
        // Simulation du chargement
        this.showMessage(`Chargement de ${vehicle.name} en 3D...`, 'success');
    }

    showVehicleDetails(vehicleId) {
        const data = this.backend.getData();
        const vehicle = data.vehicles.find(v => v.id == vehicleId);
        
        if (!vehicle) return;

        const detailsContainer = document.getElementById('vehicle-details');
        if (detailsContainer) {
            detailsContainer.style.display = 'block';
            document.getElementById('vehicle-name').textContent = vehicle.name;
            document.getElementById('vehicle-price').textContent = this.formatPrice(vehicle.price);
            document.getElementById('vehicle-year').textContent = vehicle.year;
            document.getElementById('vehicle-mileage').textContent = `${vehicle.mileage} km`;
            document.getElementById('vehicle-fuel').textContent = vehicle.fuel;
        }
    }

    changeView(view) {
        this.currentView = view;
        console.log('Changement de vue:', view);
        
        // Mettre à jour le rendu 3D
        this.update3DView();
    }

    changePosition(position) {
        this.currentPosition = position;
        console.log('Changement de position:', position);
        
        // Mettre à jour la position dans la scène 3D
        this.update3DPosition();
    }

    toggleDoor(door) {
        console.log('Ouverture/fermeture:', door);
        
        // Animer la portière dans la scène 3D
        this.animateDoor(door);
    }

    setup3DVehicleView() {
        // Initialiser la vue 3D pour les véhicules
        console.log('Initialisation vue 3D véhicules...');
    }

    setupFinancingCalculator() {
        this.updateFinancingCalculation();
    }

    setupFinancingEventListeners() {
        const inputs = ['vehicle-price-input', 'down-payment', 'loan-term', 'interest-rate'];
        
        inputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateFinancingCalculation();
                    
                    // Mettre à jour les affichages
                    if (inputId === 'loan-term') {
                        document.getElementById('term-display').textContent = `${element.value} mois`;
                    }
                    if (inputId === 'interest-rate') {
                        document.getElementById('rate-display').textContent = `${element.value}%`;
                    }
                });
            }
        });
    }

    updateFinancingCalculation() {
        const price = parseFloat(document.getElementById('vehicle-price-input')?.value) || 30000;
        const downPayment = parseFloat(document.getElementById('down-payment')?.value) || 5000;
        const term = parseFloat(document.getElementById('loan-term')?.value) || 48;
        const rate = parseFloat(document.getElementById('interest-rate')?.value) || 3.5;

        const loanAmount = price - downPayment;
        const monthlyRate = rate / 100 / 12;
        const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term) / 
                              (Math.pow(1 + monthlyRate, term) - 1);
        
        const totalInterest = (monthlyPayment * term) - loanAmount;
        const totalCost = price + totalInterest;

        // Mettre à jour l'affichage
        this.updateFinancingDisplay(monthlyPayment, totalInterest, totalCost);
    }

    updateFinancingDisplay(monthlyPayment, totalInterest, totalCost) {
        const monthlyElement = document.getElementById('monthly-payment');
        const interestElement = document.getElementById('total-interest');
        const costElement = document.getElementById('total-cost');
        
        if (monthlyElement) monthlyElement.textContent = `€${monthlyPayment.toFixed(2)}`;
        if (interestElement) interestElement.textContent = `€${totalInterest.toFixed(2)}`;
        if (costElement) costElement.textContent = `€${totalCost.toFixed(2)}`;
    }

    updatePriceDisplay(price) {
        const display = document.getElementById('price-display');
        if (display) {
            display.textContent = this.formatPrice(price);
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    update3DView() {
        // Mettre à jour le rendu 3D en fonction de la vue courante
    }

    update3DPosition() {
        // Mettre à jour la position dans la scène 3D
    }

    animateDoor(door) {
        // Animer l'ouverture/fermeture des portières
    }

    showMessage(text, type) {
        // Implémentation des messages
        console.log(`[${type}] ${text}`);
    }
}