// Dans BackendSimulator class
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