import { RequestBuilder } from '../../common';

export class TwitterAPIRequestBuilder extends RequestBuilder {
    setToken(key: string) {
        this.addHeader('Autorization', `Bearer ${key}`);
        return this;
    }
}
