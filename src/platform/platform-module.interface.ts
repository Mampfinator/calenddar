export interface IStartupService {
    init(): Promise<void> | void;
}
