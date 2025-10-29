class BackgroundRemoval {
    static async removeBackground(imageUrl) {
        // Implémentation avec Remove.bg API ou autre service
        try {
            // Pour la démo, on simule le traitement
            return await this.simulateBackgroundRemoval(imageUrl);
        } catch (error) {
            console.error('Erreur suppression arrière-plan:', error);
            throw error;
        }
    }

    static async simulateBackgroundRemoval(imageUrl) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Simulation basique de suppression de fond
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Algorithme simple de détection de fond (à améliorer)
                this.simpleBackgroundDetection(imageData);
                
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL());
            };
            
            img.src = imageUrl;
        });
    }

    static simpleBackgroundDetection(imageData) {
        const data = imageData.data;
        
        // Supposer que les bords sont le fond
        const edgePixels = this.getEdgePixels(imageData);
        const backgroundColor = this.calculateAverageColor(edgePixels, imageData);
        
        // Supprimer les pixels similaires à la couleur de fond
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (this.isSimilarColor(r, g, b, backgroundColor, 50)) {
                data[i + 3] = 0; // Rendre transparent
            }
        }
    }

    static getEdgePixels(imageData) {
        const pixels = [];
        const width = imageData.width;
        const height = imageData.height;
        
        // Haut et bas
        for (let x = 0; x < width; x++) {
            pixels.push(x); // Haut
            pixels.push((height - 1) * width + x); // Bas
        }
        
        // Côtés
        for (let y = 0; y < height; y++) {
            pixels.push(y * width); // Gauche
            pixels.push(y * width + width - 1); // Droite
        }
        
        return pixels;
    }

    static calculateAverageColor(pixels, imageData) {
        let r = 0, g = 0, b = 0;
        const data = imageData.data;
        
        pixels.forEach(pixel => {
            const index = pixel * 4;
            r += data[index];
            g += data[index + 1];
            b += data[index + 2];
        });
        
        return {
            r: Math.round(r / pixels.length),
            g: Math.round(g / pixels.length),
            b: Math.round(b / pixels.length)
        };
    }

    static isSimilarColor(r1, g1, b1, color2, threshold) {
        const dr = r1 - color2.r;
        const dg = g1 - color2.g;
        const db = b1 - color2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db) < threshold;
    }
}