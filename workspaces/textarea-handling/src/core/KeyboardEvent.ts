export interface IKeyboardEvent {
    key: string;
    shiftKey: boolean;
    altKey: boolean;
    cmdKey: boolean;
    ctrlKey: boolean;

    preventDefault(): void;
}
