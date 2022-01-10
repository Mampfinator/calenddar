import { RequestBuilder } from '../../../common/util';

export class TwitcastingRequestBuilder extends RequestBuilder {
    setToken(token: string) {
        return this.addHeader('Authorization', `Basic ${token}`);
    }
}
