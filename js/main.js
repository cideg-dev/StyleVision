class StyleVisionApp {
    constructor() {
        this.backend = new BackendSimulator();
        this.currentPage = 'habits';
        this.isAdminAuthenticated = false;
        this.compositor = null;
        this.tryon3d = null;
        this.adminPanel = null;
        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupAdminPanel();
        this.initializeCompositor();
        this.loadPage('habits');
        console.log('🎉 StyleVision initialisé avec succès!');

        // Initialiser les composants 3D
        if (window.Tryon3D) {
            this.tryon3d = new Tryon3D('tryon-3d-container');
        }
    }

    initializeCompositor() {
        try {
            this.compositor = new ImageCompositor('result-canvas');
            console.log('✅ ImageCompositor initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation ImageCompositor:', error);
        }
    }


    setupNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.loadPage(page);
            }
        });
    }

    async loadPage(page) {
        this.currentPage = page;

        // Mettre à jour la navigation active
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-page') === page);
        });

        // Charger le contenu de la page
        try {
            const response = await fetch(`pages/${page}.html`);
            const html = await response.text();
            document.getElementById('app-content').innerHTML = html;

            // Initialiser le JavaScript spécifique à la page
            await this.initializePageScript(page);
        } catch (error) {
            console.error(`Erreur chargement page ${page}:`, error);
            document.getElementById('app-content').innerHTML = `
                <div class="error-message">
                    <h1>PAGE NON DISPONIBLE</h1>
                    <p>Une erreur est survenue lors du chargement de la page.</p>
                </div>
            `;
        }
    }

    async initializePageScript(page) {
        switch(page) {
            case 'habits':
                if (window.HabitsPage) {
                    new HabitsPage(this.backend, this.tryon3d);
                }
                break;
            case 'coiffures':
                if (window.CoiffuresPage) {
                    new CoiffuresPage(this.backend);
                }
                break;
            case 'vehicules':
                if (window.VehiculesPage) {
                    new VehiculesPage(this.backend, this.tryon3d);
                }
                break;
        }
    }

    setupAdminPanel() {
        // Code pour le panel admin...
    }
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StyleVisionApp();
});