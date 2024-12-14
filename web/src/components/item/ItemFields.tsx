import { FC } from 'react';
import Barcode from 'react-barcode';
import { match } from 'ts-pattern';

import { useItemFields } from '@/api/fields/item';

const PREFERRED_FIELD_ORDER = [''];

export const ItemFields: FC<{ item_id: string }> = ({ item_id }) => {
    const { data: fields } = useItemFields(item_id);

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields?.map((field) =>
                    match(field)
                        .with({ definition_id: 'ean' }, (field) => (
                            <div>
                                <div className="font-bold">
                                    {field.definition_name}
                                </div>
                                <div>{field.value as string}</div>
                                <div className="w-16">
                                    <Barcode value={field.value as string} />
                                </div>
                            </div>
                        ))
                        .otherwise(() => (
                            <div>
                                <div className="font-bold">
                                    {field.definition_name}
                                </div>
                                <div>{field.value as string}</div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};
