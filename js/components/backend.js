class BackendSimulator {
    constructor() {
        this.data = this.loadInitialData();
    }

    loadInitialData() {
        const storedData = localStorage.getItem('stylevision_data');
        if (storedData) {
            return JSON.parse(storedData);
        }
        return {
            clothingItems: {
                top: [],
                bottom: [],
                shoes: [],
                accessory: []
            },
            hairstyles: [],
            vehicles: [],
            mannequins: []
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