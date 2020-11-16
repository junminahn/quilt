import {FieldDictionary} from '../../types';
import {addFieldItemAction, removeFieldItemAction} from './hooks';
import {useBaseList, FieldListConfig} from './baselist';

interface DynamicList<Item extends object> {
  fields: FieldDictionary<Item>[];
  addItem(): void;
  removeItem(index: number): void;
}

type FactoryFunction<Item> = () => Item;

export function useDynamicList<Item extends object>(
  listOrConfig: FieldListConfig<Item> | Item[],
  fieldFactory: FactoryFunction<Item>,
  validationDependencies: unknown[] = [],
): DynamicList<Item> {
  const {fields, dispatch} = useBaseList(listOrConfig, validationDependencies);

  function addItem() {
    dispatch(addFieldItemAction([fieldFactory()]));
  }

  function removeItem(index: number) {
    dispatch(removeFieldItemAction(index));
  }

  return {fields, addItem, removeItem};
}
