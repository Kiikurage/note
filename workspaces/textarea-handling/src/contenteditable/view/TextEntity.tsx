const ZERO_WIDTH_SPACE = '\u200b';

export const TextEntity = ({ children, offset }: { children: string; offset: number }) => {
    return (
        <span>
            <span data-from={offset} data-to={offset + children.length}>
                {children + ZERO_WIDTH_SPACE}
            </span>
        </span>
    );
};
