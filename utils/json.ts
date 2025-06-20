import fs from 'fs/promises';

// TODO: Put JSON read and parse in own function
export class JsonHelper {
    private constructor(private filePath: string) {}

    static file(filePath: string): JsonHelper {
        return new JsonHelper(filePath);
    }

    async get(key: string): Promise<any> {
        return (JSON.parse(await this.readJsonFile()))[key];
    }

    async read(): Promise<object> {
        return JSON.parse(await this.readJsonFile());
    }

    async write(json: object): Promise<void> {
        const jsonString = JSON.stringify(json, null, 2);
        await fs.writeFile(this.filePath, jsonString, 'utf8');
    }

    async append(newItem: object): Promise<void> {
        let data: any = [];

        try {
            const file = await this.readJsonFile();
            data = JSON.parse(file);
        } catch (error) {
            console.error(error);
            data = [];
        }

        if (Array.isArray(data)) {
            data.push(newItem);
        } else if (typeof data === 'object') {
            Object.assign(data, newItem);
        }

        await this.write(data);
        console.log('JSON file updated!');
    }

    async remove(criteria: object | string): Promise<void> {
        let data: any;

        try {
            const file = await this.readJsonFile();
            data = JSON.parse(file);
        } catch (error) {
            console.warn('File not found or empty.');
            return;
        }

        if (Array.isArray(data) && typeof criteria === 'object') {
            const [key, value] = Object.entries(criteria)[0];
            data = data.filter((item: any) => item[key] !== value);
        } else if (typeof data === 'object' && typeof criteria === 'string') {
            delete data[criteria];
        } else {
            console.warn('Unsupported data structure or criteria.');
            return;
        }

        await this.write(data);
        console.log('Item removed!');
    }

    async readJsonFile(): Promise<string> {
        return await fs.readFile(this.filePath, 'utf8');
    }
}

// Example usages:
// await JsonHelper.file('modules.json').get('Leveling');
// await JsonHelper.file('modules.json').read();
// await JsonHelper.file('modules.json').append({ 'New': true});
