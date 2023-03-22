import { useApi } from 'soapbox/hooks';

import { useCreateEntity } from './useCreateEntity';
import { useDeleteEntity } from './useDeleteEntity';

import type { Entity } from '../types';
import type { EntitySchema } from './types';

type EntityPath = [entityType: string, listKey?: string]

interface UseEntityActionsOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>
}

interface EntityActionEndpoints {
  post?: string
  delete?: string
}

function useEntityActions<TEntity extends Entity = Entity, Params = any>(
  path: EntityPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) {
  const api = useApi();
  const [entityType] = path;

  const deleteEntity = useDeleteEntity(entityType, (entityId) => {
    if (!endpoints.delete) return Promise.reject(endpoints);
    return api.delete(endpoints.delete.replace(':id', entityId));
  });

  const createEntity = useCreateEntity(path, (params: Params) => {
    if (!endpoints.post) return Promise.reject(endpoints);
    return api.post(endpoints.post, params);
  }, opts);

  return {
    createEntity,
    deleteEntity,
  };
}

export { useEntityActions };