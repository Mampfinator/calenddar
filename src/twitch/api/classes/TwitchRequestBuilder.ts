import axios from "axios";

export class TwitchRequestBuilder {
    private headers: {[key: string]: string} = {};
    private parameters: {[key: string]: string | number | boolean} = {};
    private baseUrl: string;
    private method: "POST" | "GET" | "DELETE";
    private token: string;
    private clientId: string;
    private body: object;

    setToken(token: string) {
        this.token = token;
        return this;
    }

    setClientId(id: string) {
        this.clientId = id;
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
        this.parameters[name] = value;
        return this; 
    }

    setParameters(parameters: {[key: string]: string | number | boolean}) {
        this.parameters = {...this.parameters, ...parameters};
        return this; 
    }

    setMethod(method: "POST" | "GET" | "DELETE") {
        this.method = method;
        return this; 
    }

    setData(body: object) {
        this.body = body;
        return this;
    }

    async send(includeToken?: boolean, resolveFull?: boolean, includeClientIdAsHeader?: boolean) {
        if (this.token && (includeToken ?? true)) this.setHeader("Authorization", `Bearer ${this.token}`);
        if (this.clientId && (includeClientIdAsHeader ?? true)) this.setHeader("Client-Id", this.clientId);
        const res = await axios({
            baseURL: this.baseUrl,
            headers: this.headers, 
            params: this.parameters,
            method: this.method ?? "get",
            data: this.body ?? null
        });

        return !resolveFull ? res.data : res;
    }
}