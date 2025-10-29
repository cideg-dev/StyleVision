class ImageCompositor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.layers = [];
        this.baseImage = null;
        this.isRendering = false;
        this.renderingQueue = [];
        
        this.init();
    }

    init() {
        // Configuration initiale du canvas
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.clearCanvas();
        
        // Événements de redimensionnement
        this.setupResizeObserver();
    }

    setupResizeObserver() {
        // Observer les changements de taille du conteneur
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                this.handleResize(entry.contentRect);
            }
        });
        
        resizeObserver.observe(this.canvas.parentElement);
    }

    handleResize(rect) {
        const { width, height } = rect;
        if (width > 0 && height > 0) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.render(); // Re-rendre avec la nouvelle taille
        }
    }

    async setBaseImage(imageSrc) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.baseImage = img;
                this.adjustCanvasSize(img.width, img.height);
                resolve();
            };
            
            img.onerror = (error) => {
                console.error('Erreur chargement image base:', error);
                reject(error);
            };
            
            img.src = imageSrc;
        });
    }

    adjustCanvasSize(imgWidth, imgHeight) {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculer le ratio pour s'adapter au conteneur
        const ratio = Math.min(
            containerWidth / imgWidth,
            containerHeight / imgHeight
        );
        
        this.canvas.width = imgWidth * ratio;
        this.canvas.height = imgHeight * ratio;
        
        this.scaleFactor = ratio;
    }

    async addLayer(imageSrc, position, options = {}) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const layer = {
                    image: img,
                    position: this.calculateScaledPosition(position),
                    opacity: options.opacity || 1,
                    blendMode: options.blendMode || 'source-over',
                    rotation: options.rotation || 0,
                    scale: options.scale || 1
                };
                
                this.layers.push(layer);
                this.queueRender();
                resolve(layer);
            };
            
            img.onerror = (error) => {
                console.error('Erreur chargement layer:', error);
                reject(error);
            };
            
            img.src = imageSrc;
        });
    }

    calculateScaledPosition(position) {
        if (!this.scaleFactor) return position;
        
        return {
            x: position.x * this.scaleFactor,
            y: position.y * this.scaleFactor,
            width: position.width * this.scaleFactor,
            height: position.height * this.scaleFactor
        };
    }

    removeLayer(index) {
        if (index >= 0 && index < this.layers.length) {
            this.layers.splice(index, 1);
            this.queueRender();
        }
    }

    updateLayer(index, updates) {
        if (index >= 0 && index < this.layers.length) {
            const layer = this.layers[index];
            Object.assign(layer, updates);
            
            if (updates.position) {
                layer.position = this.calculateScaledPosition(updates.position);
            }
            
            this.queueRender();
        }
    }

    clearLayers() {
        this.layers = [];
        this.queueRender();
    }

    queueRender() {
        if (this.isRendering) {
            this.renderingQueue.push(true);
            return;
        }
        
        this.render();
    }

    async render() {
        if (this.isRendering) return;
        
        this.isRendering = true;
        
        // Utiliser requestAnimationFrame pour un rendu fluide
        requestAnimationFrame(() => {
            try {
                this.clearCanvas();
                this.drawBaseImage();
                this.drawLayers();
            } catch (error) {
                console.error('Erreur rendu:', error);
            } finally {
                this.isRendering = false;
                
                // Traiter la file d'attente
                if (this.renderingQueue.length > 0) {
                    this.renderingQueue.shift();
                    this.render();
                }
            }
        });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBaseImage() {
        if (this.baseImage) {
            this.ctx.drawImage(
                this.baseImage,
                0, 0, this.baseImage.width, this.baseImage.height,
                0, 0, this.canvas.width, this.canvas.height
            );
        } else {
            // Dessiner un fond par défaut
            this.ctx.fillStyle = '#f8f9fa';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Message d'attente
            this.ctx.fillStyle = '#6c757d';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'Chargement de l\'image...',
                this.canvas.width / 2,
                this.canvas.height / 2
            );
        }
    }

    drawLayers() {
        this.layers.forEach(layer => {
            this.ctx.save();
            
            // Appliquer l'opacité
            this.ctx.globalAlpha = layer.opacity;
            
            // Appliquer le mode de fusion
            this.ctx.globalCompositeOperation = layer.blendMode;
            
            // Appliquer la rotation
            if (layer.rotation !== 0) {
                const centerX = layer.position.x + layer.position.width / 2;
                const centerY = layer.position.y + layer.position.height / 2;
                
                this.ctx.translate(centerX, centerY);
                this.ctx.rotate(layer.rotation * Math.PI / 180);
                this.ctx.translate(-centerX, -centerY);
            }
            
            // Dessiner l'image avec l'échelle
            const scale = layer.scale || 1;
            const scaledWidth = layer.position.width * scale;
            const scaledHeight = layer.position.height * scale;
            const offsetX = (layer.position.width - scaledWidth) / 2;
            const offsetY = (layer.position.height - scaledHeight) / 2;
            
            this.ctx.drawImage(
                layer.image,
                layer.position.x + offsetX,
                layer.position.y + offsetY,
                scaledWidth,
                scaledHeight
            );
            
            this.ctx.restore();
        });
    }

    // Méthodes utilitaires pour le positionnement
    calculateBestFitPosition(itemType, baseImageSize) {
        const positions = {
            top: { x: baseImageSize.width * 0.2, y: baseImageSize.height * 0.15, width: baseImageSize.width * 0.6, height: baseImageSize.height * 0.3 },
            bottom: { x: baseImageSize.width * 0.2, y: baseImageSize.height * 0.45, width: baseImageSize.width * 0.6, height: baseImageSize.height * 0.4 },
            shoes: { x: baseImageSize.width * 0.3, y: baseImageSize.height * 0.85, width: baseImageSize.width * 0.4, height: baseImageSize.height * 0.15 },
            accessory: { x: baseImageSize.width * 0.4, y: baseImageSize.height * 0.05, width: baseImageSize.width * 0.2, height: baseImageSize.height * 0.1 }
        };
        
        return positions[itemType] || positions.top;
    }

    // Gestion des collisions entre layers
    detectCollisions(newLayer) {
        const collisions = [];
        
        this.layers.forEach((existingLayer, index) => {
            if (this.layersIntersect(newLayer.position, existingLayer.position)) {
                collisions.push({
                    layerIndex: index,
                    overlap: this.calculateOverlap(newLayer.position, existingLayer.position)
                });
            }
        });
        
        return collisions;
    }

    layersIntersect(rect1, rect2) {
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect2.x + rect2.width < rect1.x ||
            rect1.y + rect1.height < rect2.y ||
            rect2.y + rect2.height < rect1.y
        );
    }

    calculateOverlap(rect1, rect2) {
        const xOverlap = Math.max(0, Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x));
        const yOverlap = Math.max(0, Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y));
        
        return xOverlap * yOverlap;
    }

    // Export et sauvegarde
    getImageDataURL(format = 'image/png', quality = 0.92) {
        return this.canvas.toDataURL(format, quality);
    }

    async downloadImage(filename = 'composition.png') {
        const dataURL = this.getImageDataURL();
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        link.click();
    }

    // Méthodes pour le traitement d'image avancé
    async applyFilter(filterType, options = {}) {
        this.ctx.save();
        
        switch (filterType) {
            case 'grayscale':
                this.applyGrayscaleFilter();
                break;
            case 'sepia':
                this.applySepiaFilter();
                break;
            case 'brightness':
                this.applyBrightnessFilter(options.value || 1);
                break;
            case 'contrast':
                this.applyContrastFilter(options.value || 1);
                break;
            default:
                console.warn('Filtre non supporté:', filterType);
        }
        
        this.ctx.restore();
        this.queueRender();
    }

    applyGrayscaleFilter() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;     // Rouge
            data[i + 1] = gray; // Vert
            data[i + 2] = gray; // Bleu
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    applySepiaFilter() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyBrightnessFilter(value) {
        this.ctx.filter = `brightness(${value})`;
        this.ctx.drawImage(this.canvas, 0, 0);
    }

    applyContrastFilter(value) {
        this.ctx.filter = `contrast(${value})`;
        this.ctx.drawImage(this.canvas, 0, 0);
    }

    // Nettoyage
    destroy() {
        this.layers = [];
        this.baseImage = null;
        this.renderingQueue = [];
        
        // Libérer les ressources
        this.canvas.width = this.canvas.height = 0;
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageCompositor;
}