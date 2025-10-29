class Tryon3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.mannequin = null;
        this.clothes = [];
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.loadDefaultMannequins();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.5, 3);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }

    setupLighting() {
        // Lumière ambiante
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Lumière directionnelle
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    async loadDefaultMannequins() {
        const mannequins = [
            { id: 'male_slim', name: 'Homme Sportif', scale: 1.0 },
            { id: 'female_curvy', name: 'Femme Curvy', scale: 0.95 },
            { id: 'male_muscular', name: 'Homme Musclé', scale: 1.05 },
            { id: 'female_slim', name: 'Femme Élégante', scale: 0.9 }
        ];

        // Créer des mannequins basiques en attendant les modèles 3D
        mannequins.forEach((mannequin, index) => {
            this.createBasicMannequin(mannequin, index);
        });
    }

    createBasicMannequin(mannequin, index) {
        const group = new THREE.Group();
        
        // Corps
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffcc99,
            transparent: true,
            opacity: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        group.add(body);

        // Tête
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        group.add(head);

        group.position.x = (index - 1.5) * 1.5;
        group.userData = mannequin;
        
        this.scene.add(group);
    }

    async loadMannequin(mannequinId) {
        // Ici, vous chargeriez un vrai modèle 3D
        console.log(`Chargement mannequin: ${mannequinId}`);
    }

    async tryClothing(clothingItem, type) {
        // Appliquer le vêtement sur le mannequin 3D
        const clothingMesh = await this.createClothingMesh(clothingItem, type);
        
        if (this.mannequin) {
            this.mannequin.add(clothingMesh);
            this.clothes.push({ mesh: clothingMesh, type: type });
        }
    }

    async createClothingMesh(clothingItem, type) {
        // Créer un mesh basique pour le vêtement
        let geometry, material;
        
        switch(type) {
            case 'top':
                geometry = new THREE.BoxGeometry(0.8, 0.6, 0.4);
                break;
            case 'bottom':
                geometry = new THREE.BoxGeometry(0.7, 0.8, 0.4);
                break;
            case 'shoes':
                geometry = new THREE.BoxGeometry(0.2, 0.1, 0.5);
                break;
        }
        
        material = new THREE.MeshLambertMaterial({ 
            color: Math.random() * 0xffffff 
        });
        
        return new THREE.Mesh(geometry, material);
    }

    changePose(poseName) {
        // Changer la pose du mannequin
        const poses = {
            'standing': { rotation: { x: 0, y: 0, z: 0 } },
            'walking': { rotation: { x: 0, y: 0.5, z: 0 } },
            'sitting': { rotation: { x: -0.5, y: 0, z: 0 } }
        };
        
        const pose = poses[poseName];
        if (pose && this.mannequin) {
            // Animer vers la nouvelle pose
            this.animateToPose(pose);
        }
    }

    animateToPose(targetPose) {
        // Animation vers la nouvelle pose
        // Implémentation simplifiée
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        }
    }
}