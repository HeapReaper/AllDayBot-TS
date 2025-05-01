interface Auth {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}

// @ts-ignore
type Document = Record<string, any>;

class CouchClient {
    private readonly auth: Auth;
    // @ts-ignore
    private docName: string;

    private constructor(auth: Auth) {
        this.auth = auth;
    }

    static connect(auth: Auth): CouchClient {
        for (const field of ['host', 'port', 'username', 'password', 'database'] as const) {
            if (!auth[field]) throw new Error(`${field} is required`);
        }

        return new CouchClient(auth);
    }

    useDoc(docName: string): CouchDocHandler {
        this.docName = docName;
        return new CouchDocHandler(this.auth, docName);
    }
}

class CouchDocHandler {
    constructor(private auth: Auth, private docName: string) {}

    private get baseUrl(): string {
        const { host, port, username, password, database } = this.auth;
        return `http://${username}:${password}@${host}:${port}/${database}`;
    }

    async get(query: string = ''): Promise<any> {
        const url = `${this.baseUrl}/${this.docName}${query}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`GET failed: ${res.statusText}`);
        return res.json();
    }

    async insert(data: Document): Promise<any> {
        const url = `${this.baseUrl}/${this.docName}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`INSERT failed: ${res.statusText}`);
        return res.json();
    }

    async update(data: Document): Promise<any> {
        const existing = await this.get();
        if (!existing._rev) throw new Error('Document revision (_rev) required for update.');

        const url = `${this.baseUrl}/${this.docName}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...existing, ...data })
        });
        if (!res.ok) throw new Error(`UPDATE failed: ${res.statusText}`);
        return res.json();
    }

    async delete(): Promise<any> {
        const existing = await this.get();
        if (!existing._rev) throw new Error('Document revision (_rev) required for delete.');

        const url = `${this.baseUrl}/${this.docName}?rev=${existing._rev}`;
        const res = await fetch(url, { method: 'DELETE' });
        if (!res.ok) throw new Error(`DELETE failed: ${res.statusText}`);
        return res.json();
    }

    async createDoc(doc: Document): Promise<any> {
        const url = `${this.baseUrl}/${this.docName}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc)
        })
        if (!res.ok) throw new Error(`CREATE failed: ${res.statusText}`);
        return res.json();
    }
}

function CouchDB(docName: string): CouchDocHandler {
    const client = CouchClient.connect({
        host: 'localhost',
        port: 5984,
        username: 'admin',
        password: 'password',
        database: 'test'
    });

    return client.useDoc(docName);
}
