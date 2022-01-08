import axios from 'axios';
import { RequestBuilder } from '../../../common/util/RequestBuilder';

export class TwitchRequestBuilder extends RequestBuilder {
    setToken(token: string) {
        return this.addHeader('Authorization', `Bearer ${token}`);
    }

    setClientId(clientId: string) {
        return this.addHeader('Client-ID', clientId);
    }
}
