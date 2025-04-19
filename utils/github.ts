import { getEnv } from '@utils/env';
import {Logging} from "@utils/logging.ts";

export class Github {
    private owner: string;
    private repo: string;

    constructor(owner: string, repo: string) {
        this.owner = owner;
        this.repo = repo;
    }

    static async getCurrentRelease(): Promise<string | null> {
        const response: Response = await fetch(
            `https://api.github.com/repos/${<string>getEnv('REPO_OWNER')}/${<string>getEnv('REPO_NAME')}/releases/latest`
        );

        if (!response.ok) {
            Logging.error(`Error fetching repo in bootEvent: ${response.status}`)
            return null;
        }

        const repoData = await response.json();

        return repoData.tag_name;
    }
}