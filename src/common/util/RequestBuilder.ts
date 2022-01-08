import axios from "axios";

export type HTTPRequestMethod = "GET" | "POST" | "PATCH" | "DELETE"; 

export class RequestBuilder {
    private headers: Record<string, string> = {};
    private params: Record<string, string> = {};
    private method: HTTPRequestMethod = "GET";
    private url: string;

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

    async send(resolveFull?: boolean) {
        if (!this.url) throw new TypeError("URL needs to be set before sending the request!");
        const response = await axios({
            method: this.method,
            params: this.params,
            headers: this.headers,
            url: this.url,
        });

        return !resolveFull ? response.data : response;
    }
}