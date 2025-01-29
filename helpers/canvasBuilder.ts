// helpers/canvasBuilder

import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';

export class CanvasBuilder {
    protected canvas: Canvas;
    protected ctx: CanvasRenderingContext2D;

    constructor(width: number, height: number) {
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
    }

    async setBackground(imageUrl: string): Promise<void> {
        const backgroundImage = await loadImage(imageUrl);
        this.ctx.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawRect(x: number, y: number, width: number, height: number, color: string): void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawText(text: string, x: number, y: number, font: string, color: string): void {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(text, x, y);
    }

    getBuffer(): Buffer {
        return this.canvas.toBuffer();
    }
}

export default CanvasBuilder;