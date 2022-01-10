import axios from 'axios';

export type HTTPRequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class RequestBuilder {
    protected headers: Record<string, string> = {};
    protected params: Record<string, string> = {};
    protected method: HTTPRequestMethod = 'GET';
    protected url: string;
    protected body: any;

    setMethod(method: HTTPRequestMethod) {
        this.method = method;
        return this;
    }

    addParam(name: string, value: string) {
        this.params[name] = value;
        return this;
    }

    addHeader(name: string, value: string) {
        this.headers[name] = value;
        return this;
    }

    setUrl(url: string) {
        this.url = url;
        return this;
    }

    setBody(body: string | Record<string, any>) {
        this.body = body;
        return this;
    }

    async send(resolveFull?: boolean) {
        if (!this.url)
            throw new TypeError(
                'URL needs to be set before sending the request!',
            );
        const response = await axios({
            method: this.method,
            params: this.params,
            headers: this.headers,
            url: this.url,
            data: this.body,
        });

        return !resolveFull ? response.data : response;
    }
}
