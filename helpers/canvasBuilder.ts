import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D, Image } from 'canvas';
import { Logging } from '@helpers/logging';
import path from 'path';
import fs from 'fs';

export class CanvasBuilder {
    protected canvas: Canvas;
    protected ctx: CanvasRenderingContext2D;

    constructor(width: number, height: number) {
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Sets the image background.
     *
     * @param {string} imageUrl - The URL of the image.
     * @returns Promise<void> - Returns nothing.
     */
    async setBackground(imageUrl: string): Promise<void> {
        try {
            const backgroundImage: Image = await loadImage(
                await this.getImageFromFs(imageUrl)
            );
            this.ctx.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } catch (error) {
            Logging.debug(`Error inside canvasBuilder setBackground: ${error}`);
        }

    }

    async setFixedBackground(imageUrl: string, width: number, height: number): Promise<void> {
        const backgroundImage: Image = await loadImage(
            await this.getImageFromFs(imageUrl)
        );
        this.ctx.drawImage(backgroundImage, 0, 0, width, height);
    }

    async drawImg(imageUrl: string, x: number, y: number, width: number, height: number): Promise<void> {
        const img: Image = await loadImage(
            await this.getImageFromFs(imageUrl)
        );
        this.ctx.drawImage(img, x, y, width, height);
    }

    /**
     * Draw rect.
     *
     * @param {number} x - Sets position on horizontal axis.
     * @param {number} y - Sets position on vertical axis.
     * @param {number} width - Sets total width.
     * @param {number} height - Sets total height.
     * @param {string} color - Sets color.
     * @returns void - Returns nothing.
     */
    drawRect(x: number, y: number, width: number, height: number, color: string): void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    /**
     * Draws text boxes.
     *
     * @param {string} text - The text to be displayed.
     * @param {number} x - Sets the horizontal position of the text.
     * @param {number} y - Sets the vertical position of the text.
     * @param {string} font - Sets the type of font to be used for the text.
     * @param {string} color - Sets the color of the text.
     * @return void - Returns nothing.
     */
    drawText(text: string, x: number, y: number, font: string, color: string): void {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(text, x, y);
    }

    async getImageFromFs(imageUrl: string): Promise<any> {
        try {
            return fs.readFileSync(path.join(imageUrl));
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                Logging.error(`Error inside getImageFromFs(): ${error}`);
                return;
            }
            throw new Error(`Could not find image from ${imageUrl}`);
        }
    }

    getBuffer(): Buffer {
        return this.canvas.toBuffer();
    }
}

export default CanvasBuilder;