import { Path } from '../../core/common/Node';

const ZERO_WIDTH_SPACE = '\u200b';

export const Spacer = ({ path }: { path: Path }) => {
    return (
        <span contentEditable={false} data-spacer="true" data-path={path}>
            {ZERO_WIDTH_SPACE}
        </span>
    );
};
