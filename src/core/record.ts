import { Stack } from "./stack.ts";

const undoStack = new Stack<string>();
const rollbackStack = new Stack<string>();

export const addRecord = (command: string) => {
    undoStack.push(command);
}

export const getUndoStack = () => {
    return undoStack;
}

export const getRollbackStack = () => {
    return rollbackStack;
}

export const clearRecord = () => {
    undoStack.clear();
    rollbackStack.clear();
}

export const undoRecord = (command: string) => {
    rollbackStack.unshift(command!);
    return undoStack.shift();
}

export const rollbackRecord = (command: string) => {
    undoStack.unshift(command!);
    return rollbackStack.shift();
}