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
            // if it starts with feather:
            .with(P.string.startsWith('feather:'), (icon) => (
                <SvgMask
                    src={`https://cdn.jsdelivr.net/gh/feathericons/feather@4.29.2/icons/${icon.replace(
                        'feather:feather/',
                        ''
                    )}.svg`}
                    {...properties}
                />
            ))
            .with(P.string.startsWith('https://'), (icon) => (
                <SvgMask src={icon} {...properties} />
            ))
            .otherwise(() => <div>{icon}</div>)
    );
};
