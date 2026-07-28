interface ParamMapper<T> {
    validateInput(value: unknown): value is T;
    mapValue(value: T): number;
}
type ParamObject<M> = {
    [key in keyof M]?: M[key] extends ParamMapper<infer T> ? T | undefined : never;
};
type StrKeys<O> = Extract<keyof O, string>;
type OnlyKeys<O, K> = O & Record<Exclude<keyof O, K>, never>;
export declare const mapNumber: ParamMapper<number>;
export declare function mapEnum<E extends Record<StrKeys<E>, number>>(enumObj: E): ParamMapper<StrKeys<E>>;
export declare const mapBoolean: ParamMapper<boolean>;
export declare function mapParameters<E, M extends Record<StrKeys<E>, ParamMapper<unknown>>, P extends ParamObject<M>>(paramEnum: E, mapper: OnlyKeys<M, StrKeys<E>>, params: OnlyKeys<P, StrKeys<E>>): Map<E[keyof E], number>;
export {};
