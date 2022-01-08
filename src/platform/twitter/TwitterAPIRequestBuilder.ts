import {RequestBuilder} from "../../common/util/RequestBuilder";

export class TwitterAPIRequestBuilder extends RequestBuilder {
    setToken(key: string) {
        this.addHeader("Autorization", `Bearer ${key}`);
        return this;
    }
}