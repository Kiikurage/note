import { Logger } from '../../lib/logger';
import { Position } from '../Position';
import {
    DeleteResult,
    Doc,
    InsertNodeResult,
    InsertTextResult,
    MergeResult,
    Node,
    NodeConstructor,
    NodeId,
    SplitResult,
} from '../interfaces';

export abstract class AbstractNode<Props = void> implements Node {
    constructor(
        public readonly props: Props,
        readonly id: NodeId = Node.generateId(),
    ) {}

    get type() {
        return Node.getTypeName(this.constructor as NodeConstructor);
    }

    copy(props: Partial<Props> = {}, id: NodeId = this.id): this {
        return new (this.constructor as NodeConstructor)({ ...this.props, ...props }, id) as this;
    }

    abstract length(doc: Doc): number;

    abstract split(doc: Doc, position: Position): SplitResult;

    abstract merge(doc: Doc): MergeResult;

    abstract insertText(doc: Doc, offset: number, text: string): InsertTextResult;

    abstract insertParagraph(doc: Doc, offset: number): InsertNodeResult;

    abstract deleteContentBackward(doc: Doc, offset: number): DeleteResult;

    abstract deleteContentForward(doc: Doc, offset: number): DeleteResult;

    abstract deleteByOffsetRange(doc: Doc, from: number, to: number): DeleteResult;
}

const logger = Logger.of(AbstractNode);
