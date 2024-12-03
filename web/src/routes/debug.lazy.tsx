import { createLazyFileRoute } from '@tanstack/react-router';
import { cva, VariantProps } from 'class-variance-authority';
import { ReactNode, useState } from 'react';
import { FaGear } from 'react-icons/fa6';
import { toast } from 'sonner';

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
import * as Dropdown from '@/components/ui/Dropdown';
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
        <div className="space-y-8 card">
            <ComponentTitle>{displayName}</ComponentTitle>
            {/* <div className="flex flex-wrap gap-4"> */}
            {Object.entries(combinations).map(([variant, combos], index) => {
                return (
                    <div key={`${variant}-${index}`} className="contents">
                        <VariantTitle key={`title-${variant}-${index}`}>
                            {variant}
                        </VariantTitle>
                        <div
                            className="flex flex-wrap gap-2 items-center p-4 justify-around"
                            key={`container-${variant}-${index}`}
                        >
                            {combos.map((combo, index) => (
                                <div
                                    key={`button-${variant}-${index}`}
                                    className="contents"
                                >
                                    {children({
                                        variant,
                                        ...(combo as any),
                                    })}
                                </div>
                            ))}
                        </div>
                        <hr />
                    </div>
                );
            })}
        </div>
        // </div>
    );
};

const ComponentTitle = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <h2 className="text-2xl font-semibold pb-4">{children}</h2>
        </>
    );
};

const VariantTitle = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <h3 className="text-base font-semibold py-1 pt-4">{children}</h3>
        </>
    );
};

const CustomComponentSection = <
    TStates extends Record<string, any> | undefined
>({
    displayName,
    children,
    states,
}: {
    displayName: string;
    states?: TStates;
    children: TStates extends undefined
        ? ReactNode
        : (
              _properties: {
                  [K in keyof TStates]: TStates[K];
              } & {
                  [SetK in keyof TStates &
                      string as `set${Capitalize<SetK>}`]: (
                      _value: TStates[SetK]
                  ) => void;
              }
          ) => ReactNode;
}) => {
    const stateObject: Record<string, any> = {};

    for (const [key, defaultValue] of Object.entries(states ?? {})) {
        const [state, setState] = useState(defaultValue);

        stateObject[key] = state;
        stateObject[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] =
            setState;
    }

    return (
        <div className="space-y-4 card">
            <ComponentTitle>{displayName}</ComponentTitle>
            {typeof children === 'function' ? children(stateObject) : children}
        </div>
    );
};

const component = () => {
    return (
        <SCPage title="Debug" width="4xl" className="pb-32">
            <DebugVariants
                displayName="Button"
                config={buttonVariantsConfig.variants!}
                variants={buttonVariants}
            >
                {(properties) => (
                    <>
                        <Button {...properties}>
                            {properties.size === 'icon' ? (
                                <FaGear />
                            ) : (
                                <>
                                    {properties.variant} {properties.size}
                                </>
                            )}
                        </Button>
                        <Button {...properties} disabled>
                            {properties.size === 'icon' ? (
                                <FaGear />
                            ) : (
                                <>Disabled</>
                            )}
                        </Button>
                    </>
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

            <CustomComponentSection
                displayName="Dropdown"
                states={{
                    showStatusBar: false,
                    showActivityBar: false,
                    showPanel: false,
                    position: 'bottom',
                }}
            >
                {(properties) => (
                    <>
                        <VariantTitle>Default</VariantTitle>
                        <Dropdown.Root>
                            <Dropdown.Trigger asChild>
                                <Button variant="default">Open</Button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Label>My Account</Dropdown.Label>
                                <Dropdown.Separator />
                                <Dropdown.Item>Profile</Dropdown.Item>
                                <Dropdown.Item>Billing</Dropdown.Item>
                                <Dropdown.Item>Team</Dropdown.Item>
                                <Dropdown.Item>Subscription</Dropdown.Item>
                            </Dropdown.Content>
                        </Dropdown.Root>

                        <VariantTitle>With Checkboxes</VariantTitle>
                        <Dropdown.Root>
                            <Dropdown.Trigger asChild>
                                <Button variant="default">Open</Button>
                            </Dropdown.Trigger>
                            <Dropdown.Content className="w-56">
                                <Dropdown.Label>Appearance</Dropdown.Label>
                                <Dropdown.Separator />
                                <Dropdown.CheckboxItem
                                    checked={properties.showStatusBar}
                                    onCheckedChange={(value) =>
                                        properties.setShowStatusBar(value)
                                    }
                                >
                                    Status Bar
                                </Dropdown.CheckboxItem>
                                <Dropdown.CheckboxItem
                                    checked={properties.showActivityBar}
                                    onCheckedChange={(value) =>
                                        properties.setShowActivityBar(value)
                                    }
                                >
                                    Activity Bar
                                </Dropdown.CheckboxItem>
                                <Dropdown.CheckboxItem
                                    checked={properties.showPanel}
                                    onCheckedChange={(value) =>
                                        properties.setShowPanel(value)
                                    }
                                >
                                    Panel
                                </Dropdown.CheckboxItem>
                            </Dropdown.Content>
                        </Dropdown.Root>

                        <VariantTitle>With Radio Group</VariantTitle>
                        <Dropdown.Root>
                            <Dropdown.Trigger asChild>
                                <Button variant="default">Open</Button>
                            </Dropdown.Trigger>
                            <Dropdown.Content className="w-56">
                                <Dropdown.Label>Panel Position</Dropdown.Label>
                                <Dropdown.Separator />
                                <Dropdown.RadioGroup
                                    value={properties.position}
                                    onValueChange={(value) =>
                                        properties.setPosition(value)
                                    }
                                >
                                    <Dropdown.RadioItem value="top">
                                        Top
                                    </Dropdown.RadioItem>
                                    <Dropdown.RadioItem value="bottom">
                                        Bottom
                                    </Dropdown.RadioItem>
                                    <Dropdown.RadioItem value="right">
                                        Right
                                    </Dropdown.RadioItem>
                                </Dropdown.RadioGroup>
                            </Dropdown.Content>
                        </Dropdown.Root>
                    </>
                )}
            </CustomComponentSection>

            <CustomComponentSection displayName="Toasts">
                <div className="flex gap-2 flex-wrap">
                    {/* default, info, success, warning, error, action, cancel, promise, loading, custom */}
                    <Button onClick={() => toast('Normal Toast')}>Toast</Button>

                    <Button
                        variant="primary"
                        onClick={() => toast.info('Info Toast')}
                    >
                        Info
                    </Button>

                    <Button
                        variant="success"
                        onClick={() =>
                            toast.success('Your media has been uploaded!', {
                                duration: 15_000,
                            })
                        }
                    >
                        Success Toast
                    </Button>

                    <Button
                        variant="warning"
                        onClick={() => toast.warning('Warning Toast')}
                    >
                        Warning
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={() =>
                            toast.error(
                                'It appears your piano fell down the skyrise'
                            )
                        }
                    >
                        Error Toast
                    </Button>
                    <Button
                        onClick={() =>
                            toast('My action toast', {
                                action: {
                                    label: 'Action',
                                    onClick: () => toast('Action clicked!'),
                                },
                                cancel: {
                                    label: 'Cancel',
                                    onClick: () => toast('Cancel clicked!'),
                                },
                            })
                        }
                    >
                        Action Toast
                    </Button>
                    <Button
                        onClick={() =>
                            toast('My action toast', {
                                action: (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            toast.success(
                                                'Your genius plan has been executed'
                                            );
                                        }}
                                    >
                                        Destroy them all
                                    </Button>
                                ),
                            })
                        }
                    >
                        Custom Action Toast
                    </Button>

                    <Button
                        onClick={() =>
                            toast.promise(
                                new Promise((resolve, reject) => {
                                    setTimeout(() => {
                                        if (Math.random() > 0.5) {
                                            resolve('Viva la vida!');
                                        } else {
                                            reject('No revolution for you!');
                                        }
                                    }, 1000);
                                }),
                                {
                                    loading: 'Loading...',
                                    success: (data) => {
                                        return `'${data}' toast has been added`;
                                    },
                                    error: (data) => {
                                        return `'${data}' failed`;
                                    },
                                }
                            )
                        }
                    >
                        Promise Toast
                    </Button>
                </div>
            </CustomComponentSection>
        </SCPage>
    );
};

export const Route = createLazyFileRoute('/debug')({
    component,
});
