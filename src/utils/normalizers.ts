import z from 'zod';

/** Use new value only if old value is undefined */
export const mergeDefined = (oldVal: any, newVal: any) => oldVal === undefined ? newVal : oldVal;

/** Normalize entity ID */
export const normalizeId = (id: unknown): string | null => {
  return z.string().nullable().catch(null).parse(id);
};

export type Normalizer<V, R> = (value: V) => R;

/**
 * Allows using any legacy normalizer function as a zod schema.
 *
 * @example
 * ```ts
 * const statusSchema = toSchema(normalizeStatus);
 * statusSchema.parse(status);
 * ```
 */
export const toSchema = <V, R>(normalizer: Normalizer<V, R>) => {
  return z.custom<V>().transform<R>(normalizer);
};

/** Legacy normalizer transition helper function. */
export const maybeFromJS = (value: any): unknown => {
  if ('toJS' in value) {
    return value.toJS();
  } else {
    return value;
  }
};