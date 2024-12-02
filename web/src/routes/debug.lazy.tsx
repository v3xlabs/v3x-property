import { createLazyFileRoute } from '@tanstack/react-router';
import { cva, VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';
import { FaGear } from 'react-icons/fa6';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import {
    Button,
    buttonVariants,
    buttonVariantsConfig,
} from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SCPage } from '@/layouts/SimpleCenterPage';
import { BaseVariants } from '@/util/style';

// Helper function to generate all combinations of variant values
const generateCombinations = <
    T extends BaseVariants,
    TGroup extends keyof T | undefined
>(
    variants: T,
    groupBy?: TGroup
): TGroup extends undefined
    ? Record<string, string>[]
    : Record<string, Record<string, string>[]> => {
    const entries = Object.entries(variants);

    if (entries.length === 0) return groupBy ? [] : ([{}] as any);

    // If grouping is requested, handle it differently
    if (groupBy) {
        const result: Record<string, Record<string, string>[]> = {};
        const groupValues = variants[groupBy];

        // Remove the groupBy key from variants for sub-combinations
        const remainingVariants = { ...variants };

        delete remainingVariants[groupBy];

        // Generate combinations for each group value
        for (const groupValue of Object.keys(groupValues)) {
            result[groupValue] = generateCombinations(
                remainingVariants
            ) as Record<string, string>[];
        }

        return result as any;
    }

    // Regular combination generation without grouping
    const [key, values] = entries[0];
    const remainingVariants = { ...variants };

    delete remainingVariants[key];

    const subCombinations = generateCombinations(remainingVariants) as Record<
        string,
        string
    >[];
    const combinations: Record<string, string>[] = [];

    for (const value of Object.keys(values)) {
        for (const subCombo of subCombinations) {
            combinations.push({ ...subCombo, [key]: value });
        }
    }

    return combinations as TGroup extends undefined
        ? Record<string, string>[]
        : Record<string, Record<string, string>[]>;
};

const DebugVariants = <
    TVariants extends ReturnType<typeof cva>,
    TConfig extends BaseVariants
>({
    displayName,
    config,
    children,
}: {
    displayName: string;
    variants: TVariants;
    config: TConfig;
    children: (properties_: VariantProps<TVariants>) => ReactNode;
}) => {
    const combinations = generateCombinations(config, 'variant');

    if (Array.isArray(combinations)) {
        return;
    }

    return (
        <div className="space-y-4">
            <ComponentTitle>{displayName}</ComponentTitle>
            {/* <div className="flex flex-wrap gap-4"> */}
            {Object.entries(combinations).map(([variant, combos]) => {
                return (
                    <>
                        <VariantTitle>{variant}</VariantTitle>
                        <div className="flex gap-2 items-center p-4 card">
                            {combos.map((combo) => (
                                <div key={variant} className="w-full">
                                    {children({
                                        variant,
                                        ...(combo as any),
                                    })}
                                </div>
                            ))}
                        </div>
                    </>
                );
            })}
        </div>
        // </div>
    );
};

const ComponentTitle = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <h2 className="text-2xl font-semibold border-b">{children}</h2>
        </>
    );
};

const VariantTitle = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold">{children}</h3>
            <hr />
        </div>
    );
};

const CustomComponentSection = ({
    displayName,
    children,
}: {
    displayName: string;
    children: ReactNode;
}) => {
    return (
        <div className="space-y-4">
            <ComponentTitle>{displayName}</ComponentTitle>
            {children}
        </div>
    );
};

const component = () => {
    return (
        <SCPage title="Debug" width="4xl">
            <DebugVariants
                displayName="Button"
                config={buttonVariantsConfig.variants!}
                variants={buttonVariants}
            >
                {(properties) => (
                    <Button {...properties}>
                        {properties.size === 'icon' ? (
                            <FaGear />
                        ) : (
                            <>
                                {properties.variant} {properties.size}
                            </>
                        )}
                    </Button>
                )}
            </DebugVariants>

            <CustomComponentSection displayName="Input">
                <VariantTitle>Default</VariantTitle>
                <Input type="email" placeholder="Email" />

                <VariantTitle>File</VariantTitle>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture">Picture</Label>
                    <Input id="picture" type="file" />
                </div>

                <VariantTitle>Disabled</VariantTitle>
                <Input type="email" placeholder="Email" disabled />

                <VariantTitle>With Label</VariantTitle>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Email" />
                </div>

                <VariantTitle>With Button</VariantTitle>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input type="email" placeholder="Email" />
                    <Button type="submit">Subscribe</Button>
                </div>
            </CustomComponentSection>

            <CustomComponentSection displayName="AlertDialog">
                <AlertDialog>
                    <AlertDialogTrigger>Open</AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CustomComponentSection>
        </SCPage>
    );
};

export const Route = createLazyFileRoute('/debug')({
    component,
});
