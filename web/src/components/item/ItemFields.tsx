import { Link } from '@tanstack/react-router';
import { FC, useState } from 'react';
import Barcode, { BarcodeProps } from 'react-barcode';
import { FaAmazon } from 'react-icons/fa6';
import { match } from 'ts-pattern';

import { useItemFields } from '@/api';
import { Button, FieldOption, FieldSelect } from '@/gui';

const AMAZON_DOMAINS = [
    { label: 'Amazon.com', value: 'amazon.com', icon: () => <FaAmazon /> },
    { label: 'Amazon Sweden', value: 'amazon.se', icon: () => <div>🇸🇪</div> },
    {
        label: 'Amazon Netherlands',
        value: 'amazon.nl',
        icon: () => <div>🇳🇱</div>,
    },
    { label: 'Amazon Germany', value: 'amazon.de', icon: () => <div>🇩🇪</div> },
    { label: 'Amazon UK', value: 'amazon.co.uk', icon: () => <div>🇬🇧</div> },
    { label: 'Amazon France', value: 'amazon.fr', icon: () => <div>🇫🇷</div> },
    { label: 'Amazon Italy', value: 'amazon.it', icon: () => <div>🇮🇹</div> },
    { label: 'Amazon Spain', value: 'amazon.es', icon: () => <div>🇪🇸</div> },
] as FieldOption[];

export const ItemFields: FC<{ item_id: string }> = ({ item_id }) => {
    const { data: fields } = useItemFields(item_id);
    const [selectedDomain, setSelectedDomain] = useState(
        AMAZON_DOMAINS[0].value
    );

    if (fields?.length === 0) {
        return;
    }

    return (
        <div className="px-4">
            <div className="grid gap-2">
                {fields?.map((field) =>
                    match(field)
                        .with({ definition_id: 'asin' }, (field) => (
                            <div className="space-y-2">
                                <h3 className="h3">
                                    {field.definition_name}
                                </h3>
                                <div className="card no-padding px-4 py-2">
                                    {field.value as string}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <Button variant="default" asChild>
                                        <Link
                                            to={`https://${selectedDomain}/dp/${field.value}`}
                                            target="_blank"
                                            className="w-full"
                                        >
                                            View on Amazon
                                            {'.' +
                                                selectedDomain
                                                    .split('.')
                                                    .slice(1)
                                                    .join('.')}
                                        </Link>
                                    </Button>
                                    {/* TODO: Migrate to use Select component & fix height */}
                                    <FieldSelect
                                        value={selectedDomain}
                                        onChange={(event) =>
                                            setSelectedDomain(event)
                                        }
                                        options={AMAZON_DOMAINS}
                                    />
                                </div>
                            </div>
                        ))
                        .with(
                            { definition_id: 'ean' },
                            { definition_id: 'upc' },
                            { definition_id: 'gtin' },
                            (field) => (
                                <div className="space-y-2">
                                    <h3 className="h3">
                                        {field.definition_name}
                                    </h3>
                                    <div className="card no-padding flex items-center justify-center p-0.5">
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
                                    <div className="card no-padding px-4 py-2">
                                        {field.value as string}
                                    </div>
                                </div>
                            )
                        )
                        .otherwise(() => (
                            <div>
                                <h3 className="h3">
                                    {field.definition_name}
                                </h3>
                                <div>{field.value as string}</div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};
