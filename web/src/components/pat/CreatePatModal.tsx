import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { toast } from 'sonner';

import { useMe } from '@/api/me';
import { PatCreateResult, useCreateUserPat } from '@/api/user/pat';

import { BaseInput } from '../input/BaseInput';
import { Button } from '../ui/Button';
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';


export const CreatePatModal = () => {
    const { data: user } = useMe();
    const { mutateAsync: createPat } = useCreateUserPat(user?.user_id ?? 0);
    const [tokenData, setTokenData] = useState<PatCreateResult | null>();
    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            name: '',
        },
        onSubmit: async (values) => {
            console.log(values);
            const pat = await createPat({
                name: values.value.name,
                permissions: 'read',
            });

            toast.success(`PAT ${pat.key.name}#${pat.key.token_id} created successfully`);

            setTokenData(pat);
        },
    });

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create PAT</DialogTitle>
            </DialogHeader>
            <DialogDescription>
                Personal Access Tokens are used to authenticate requests to the API.
            </DialogDescription>
            {
                !tokenData &&

                <form onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}>
                    <div className="space-y-4">
                        <Field name="name"
                            validators={{
                                onChange: ({ value }) => {
                                    if (value.length < 3) {
                                        return 'Name must be at least 3 characters';
                                    }
                                },
                            }}
                        >
                            {({ handleChange, state }) => <BaseInput
                                name="name"
                                label="Name"
                                placeholder="My Operator"
                                value={state.value}
                                onChange={handleChange}
                                errorMessage={state.meta.errors.join(', ')}
                                required
                            />}
                        </Field>
                    </div>
                    <DialogFooter>
                        <Subscribe>
                            {({ isValid }) => (
                                <Button type="submit" disabled={!isValid}>Create</Button>
                            )}
                        </Subscribe>
                    </DialogFooter>
                </form>
            }
            {
                tokenData &&
                <>
                    <div>
                        <p>Your new has personal access token "{tokenData.key.name}" has been created. Below you will find the token, you will only be able to view this once so make sure to save it somewhere. You can always roll a token if you lose it.</p>
                        <BaseInput
                            name="token"
                            label="Token"
                            value={tokenData.token}
                            readOnly
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button>Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </>
            }
        </DialogContent>
    );
};
