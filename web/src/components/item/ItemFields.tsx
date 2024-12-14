import { FC } from 'react';
import Barcode, { BarcodeProps } from 'react-barcode';
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
                        .with(
                            { definition_id: 'ean' },
                            { definition_id: 'upc' },
                            { definition_id: 'gtin' },
                            (field) => (
                                <div>
                                    <div className="font-bold">
                                        {field.definition_name}
                                    </div>
                                    <div>{field.value as string}</div>
                                    <div className="border flex justify-center items-center">
                                        <Barcode
                                            value={field.value as string}
                                            format={
                                                match(field.definition_id)
                                                    .with('ean', () => 'EAN13')
                                                    .with('upc', () => 'UPC')
                                                    .otherwise(
                                                        () => 'EAN13'
                                                    ) as BarcodeProps['format']
                                            }
                                        />
                                    </div>
                                </div>
                            )
                        )
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
