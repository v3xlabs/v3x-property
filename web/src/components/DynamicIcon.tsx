import { ComponentProps } from 'react';
import { match, P } from 'ts-pattern';

const SvgMask = ({
    src,
    ...properties
}: { src: string } & ComponentProps<'div'>) => (
    <div
        style={{
            maskImage: `url(${src})`,
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor',
        }}
        {...properties}
    />
);

export const DynamicIcon = ({
    icon,
    ...properties
}: {
    icon: string;
    className?: string;
}) => {
    return (
        match(icon)
            // if it starts with fa6:
            .with(P.string.startsWith('fa6:'), (icon) => (
                <SvgMask
                    src={`https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@6.x/svgs/${icon.replace(
                        'fa6:',
                        ''
                    )}.svg`}
                    {...properties}
                />
            ))
            .otherwise(() => <div>{icon}</div>)
    );
};
