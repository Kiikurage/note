import { keyframes } from '@emotion/react';

export const CursorView = () => {
    return (
        <span
            css={{
                background: 'black',
                display: 'inline-block',
                width: 0,
                outline: '1px solid black',
                height: '1em',
                verticalAlign: 'text-bottom',
                lineHeight: 1,
                animation: `${blink} 0.5s steps(2, jump-none) infinite alternate`,
            }}
        />
    );
};

const blink = keyframes`
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
`;
