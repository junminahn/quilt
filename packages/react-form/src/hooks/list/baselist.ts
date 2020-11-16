import {useMemo, useEffect} from 'react';
import isEqual from 'fast-deep-equal';

import {
  ValidationDictionary,
  NormalizedValidationDictionary,
  FieldDictionary,
  ListValidationContext,
} from '../../types';
import {mapObject, normalizeValidation} from '../../utilities';
import {
  useHandlers,
  useListReducer,
  ListAction,
  reinitializeAction,
} from './hooks';

export interface FieldListConfig<Item extends object> {
  list: Item[];
  validates?: Partial<ValidationDictionary<Item, ListValidationContext<Item>>>;
}

interface BaseList<Item extends object> {
  fields: FieldDictionary<Item>[];
  dispatch: React.Dispatch<ListAction<Item>>;
}

export function useBaseList<Item extends object>(
  listOrConfig: FieldListConfig<Item> | Item[],
  validationDependencies: unknown[] = [],
): BaseList<Item> {
  const list = Array.isArray(listOrConfig) ? listOrConfig : listOrConfig.list;
  const validates: FieldListConfig<Item>['validates'] = Array.isArray(
    listOrConfig,
  )
    ? {}
    : listOrConfig.validates || {};

  const [state, dispatch] = useListReducer(list);

  useEffect(() => {
    if (!isEqual(list, state.initial)) {
      dispatch(reinitializeAction(list));
    }
  }, [list, state.initial, dispatch]);

  const validationConfigs = useMemo(
    () =>
      mapObject<NormalizedValidationDictionary<any>>(
        validates,
        normalizeValidation,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validates, ...validationDependencies],
  );

  const handlers = useHandlers(state, dispatch, validationConfigs);

  const fields: FieldDictionary<Item>[] = useMemo(() => {
    return state.list.map((item, index) => {
      return mapObject(item, (field, key: keyof Item) => {
        return {
          ...field,
          ...(handlers[index][key] as any),
        };
      });
    });
  }, [state.list, handlers]);

  return {fields, dispatch};
}
