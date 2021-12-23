import { DynamicTimer as _DynamicTimer } from "src/util";
const registry = new WeakMap<object, _DynamicTimer>();
let timers = new Set<_DynamicTimer>();

/**
 * 
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 */
export const DynamicTimer = (intervalGenerator: () => number | Promise<number>, callback: () => any, additionalArgs?: any[]) => {
    return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
        const timer = new _DynamicTimer(intervalGenerator, callback, [target, ...additionalArgs])
        registry.set(target, timer);
        timers.add(timer);
    }
}

export const stopDynamicTimer = (target: object) => {
    registry.get(target)?.stop()
}

export const startAllTimers = async () => {
    for (const timer of timers) await timer.start();
    timers = undefined;
}