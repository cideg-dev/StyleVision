class Tryon3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.mannequin = null;
        this.clothes = [];
        this.loader = new THREE.GLTFLoader(); // Initialize GLTFLoader
        
        // Animation properties
        this.mixer = null;
        this.actions = {};
        this.activeAction = null;
        this.lastAction = null;
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.animate();
        window.addEventListener('resize', () => this.onResize());
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

    async loadMannequin(mannequinData) {
        if (this.mannequin) {
            this.scene.remove(this.mannequin);
            this.mannequin = null;
            this.clothes = []; // Clear clothes when changing mannequin
            this.mixer = null;
            this.actions = {};
            this.activeAction = null;
            this.lastAction = null;
        }

        if (!mannequinData || !mannequinData.model) {
            console.warn('Aucune donnée de modèle 3D pour le mannequin fourni.');
            return;
        }

        try {
            const gltf = await this.loader.loadAsync(mannequinData.model);
            this.mannequin = gltf.scene;
            this.mannequin.scale.set(mannequinData.scale, mannequinData.scale, mannequinData.scale);
            this.mannequin.position.set(0, 0, 0);
            this.mannequin.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            this.scene.add(this.mannequin);
            console.log(`Mannequin 3D chargé: ${mannequinData.name}`);

            // Setup animations if available
            if (gltf.animations && gltf.animations.length) {
                this.mixer = new THREE.AnimationMixer(this.mannequin);
                gltf.animations.forEach((clip) => {
                    const action = this.mixer.clipAction(clip);
                    this.actions[clip.name] = action;
                    if (clip.name === 'idle' || clip.name === 'standing') { // Default animation
                        this.activeAction = action;
                        action.play();
                    }
                });
                if (!this.activeAction && Object.values(this.actions).length > 0) {
                    this.activeAction = Object.values(this.actions)[0];
                    this.activeAction.play();
                }
            } else {
                console.log('Aucune animation trouvée pour ce mannequin.');
            }

        } catch (error) {
            console.error(`Erreur chargement mannequin 3D (${mannequinData.model}):`, error);
        }
    }

    async tryClothing(clothingItem, type) {
        if (!this.mannequin) {
            console.warn('Aucun mannequin chargé pour essayer le vêtement.');
            return;
        }

        // Remove existing clothing of the same type
        this.clothes = this.clothes.filter(c => {
            if (c.type === type) {
                this.mannequin.remove(c.mesh);
                return false;
            }
            return true;
        });

        if (!clothingItem || !clothingItem.model) {
            console.warn(`Aucune donnée de modèle 3D pour le vêtement de type ${type} fourni.`);
            return;
        }

        try {
            const gltf = await this.loader.loadAsync(clothingItem.model);
            const clothingMesh = gltf.scene;

            // Basic positioning - this will need to be refined based on actual models
            // For now, just add it to the mannequin and adjust position/scale
            clothingMesh.scale.set(clothingItem.scale || 1, clothingItem.scale || 1, clothingItem.scale || 1);
            clothingMesh.position.set(clothingItem.position?.x || 0, clothingItem.position?.y || 0, clothingItem.position?.z || 0);

            this.mannequin.add(clothingMesh);
            this.clothes.push({ mesh: clothingMesh, type: type });
            console.log(`Vêtement 3D (${clothingItem.name}) appliqué.`);
        } catch (error) {
            console.error(`Erreur chargement vêtement 3D (${clothingItem.model}):`, error);
        }
    }

    changePose(poseName) {
        if (this.mixer && this.mannequin && this.actions[poseName]) {
            this.lastAction = this.activeAction;
            this.activeAction = this.actions[poseName];

            if (this.lastAction !== this.activeAction) {
                this.lastAction.stop(); // Stop the previous action
                this.activeAction.reset().play(); // Play the new action
                // Optional: crossfade for smoother transitions
                // this.activeAction.crossFadeFrom(this.lastAction, 0.5, true);
                // this.activeAction.play();
            }
        } else {
            console.warn(`Impossible de changer la pose en ${poseName}. Animation non trouvée ou mixer non initialisé.`);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }

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