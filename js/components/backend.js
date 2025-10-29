class BackendSimulator {
    constructor() {
        this.data = this.loadInitialData();
    }

    loadInitialData() {
        const storedData = localStorage.getItem('stylevision_data');
        if (storedData) {
            const data = JSON.parse(storedData);
            // Ensure mannequins exist, if not, add them
            if (!data.mannequins || data.mannequins.length === 0) {
                data.mannequins = this.getDefaultMannequins();
            }
            // Ensure clothing items exist, if not, add them
            if (!data.clothingItems || Object.keys(data.clothingItems).length === 0) {
                data.clothingItems = this.getDefaultClothingItems();
            }
            this.saveData(data); // Save updated data if defaults were added
            return data;
        }
        return {
            clothingItems: this.getDefaultClothingItems(),
            hairstyles: [],
            vehicles: [],
            mannequins: this.getDefaultMannequins()
        };
    }

    getDefaultMannequins() {
        return [
            { id: 'male_adult', name: 'Homme', type: 'male', image: 'https://via.placeholder.com/200x300?text=Homme', model: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', scale: 1, poses: ['standing', 'walking', 'sitting'] },
            { id: 'female_adult', name: 'Femme', type: 'female', image: 'https://via.placeholder.com/200x300?text=Femme', model: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb', scale: 1, poses: ['standing', 'walking', 'sitting', 'dancing'] },
            { id: 'male_child', name: 'Garçon', type: 'child', image: 'https://via.placeholder.com/150x250?text=Garçon', model: 'https://modelviewer.dev/shared-assets/models/Horse.glb', scale: 0.8, poses: ['standing', 'walking', 'sitting'] },
            { id: 'female_child', name: 'Fille', type: 'child', image: 'https://via.placeholder.com/150x250?text=Fille', model: 'https://modelviewer.dev/shared-assets/models/Duck.glb', scale: 0.8, poses: ['standing', 'walking', 'sitting'] }
        ];
    }

    getDefaultClothingItems() {
        return {
            top: [
                { id: 1, name: 'T-Shirt Rouge', type: 'top', image: 'https://via.placeholder.com/100?text=T-Shirt', model: 'https://modelviewer.dev/shared-assets/models/TShirt.glb', position: { y: 0.5, z: 0 }, scale: 0.01 },
                { id: 2, name: 'Chemise Bleue', type: 'top', image: 'https://via.placeholder.com/100?text=Chemise', model: 'https://modelviewer.dev/shared-assets/models/Shirt.glb', position: { y: 0.5, z: 0 }, scale: 0.01 }
            ],
            bottom: [
                { id: 3, name: 'Jean', type: 'bottom', image: 'https://via.placeholder.com/100?text=Jean', model: 'https://modelviewer.dev/shared-assets/models/Jeans.glb', position: { y: -0.5, z: 0 }, scale: 0.01 },
                { id: 4, name: 'Jupe', type: 'bottom', image: 'https://via.placeholder.com/100?text=Jupe', model: 'https://modelviewer.dev/shared-assets/models/Skirt.glb', position: { y: -0.5, z: 0 }, scale: 0.01 }
            ],
            shoes: [
                { id: 5, name: 'Baskets', type: 'shoes', image: 'https://via.placeholder.com/100?text=Baskets', model: 'https://modelviewer.dev/shared-assets/models/Sneakers.glb', position: { y: -1.2, z: 0 }, scale: 0.01 },
                { id: 6, name: 'Talons', type: 'shoes', image: 'https://via.placeholder.com/100?text=Talons', model: 'https://modelviewer.dev/shared-assets/models/Heels.glb', position: { y: -1.2, z: 0 }, scale: 0.01 }
            ],
            accessory: [
                { id: 7, name: 'Casquette', type: 'accessory', image: 'https://via.placeholder.com/100?text=Casquette', model: 'https://modelviewer.dev/shared-assets/models/Cap.glb', position: { y: 1.8, z: 0 }, scale: 0.01 },
                { id: 8, name: 'Sac à main', type: 'accessory', image: 'https://via.placeholder.com/100?text=Sac', model: 'https://modelviewer.dev/shared-assets/models/Bag.glb', position: { y: 0.8, z: 0.2 }, scale: 0.01 }
            ]
        };
    }

    getData() {
        return this.data;
    }

    saveData(data) {
        this.data = data;
        localStorage.setItem('stylevision_data', JSON.stringify(this.data));
    }

    addVehicle(vehicle) {
        const data = this.getData();
        if (!data.vehicles) data.vehicles = [];
        data.vehicles.push(vehicle);
        this.saveData(data);
        return vehicle;
    }

    addMannequin(mannequin) {
        const data = this.getData();
        if (!data.mannequins) data.mannequins = [];
        data.mannequins.push(mannequin);
        this.saveData(data);
        return mannequin;
    }

    getSettings() {
        return JSON.parse(localStorage.getItem('stylevision_settings')) || {};
    }

    saveSettings(settings) {
        localStorage.setItem('stylevision_settings', JSON.stringify(settings));
    }
}