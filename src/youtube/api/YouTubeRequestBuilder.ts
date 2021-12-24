import axios from 'axios';

export class YouTubeRequestBuilder {
    private headers: { [key: string]: string } = {};
    private parameters: { [key: string]: string | number | boolean } = {};
    private baseUrl: string;

    setApiKey(key: string) {
        this.setParameter('key', key);
        return this;
    }

    setUrl(url: string) {
        this.baseUrl = url;
        return this;
    }

    setHeader(name: string, value: string) {
        this.headers[name.toLowerCase()] = value;
        return this;
    }

    setParameter(name: string, value: string) {
        this.parameters[name.toLowerCase()] = value;
        return this;
    }

    setParameters(parameters: { [key: string]: string | number | boolean }) {
        this.parameters = { ...this.parameters, ...parameters };
        return this;
    }

    setPart(parts: string[]) {
        this.setParameter('part', parts.join(','));
        return this;
    }

    async send(resolveFull?: boolean) {
        const res = await axios({
            baseURL: this.baseUrl,
            headers: this.headers,
            params: this.parameters,
            method: 'GET',
        });

        return !resolveFull ? res.data : res;
    }
}
