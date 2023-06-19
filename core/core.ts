namespace Core {
    export const version = "0.2.1";
    export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    export class Table<T> {
        data: (T | null)[][];

        constructor() {
            this.data = [];
        }

        set(x: number, y: number, val: any): null {
            if (y < 1) {
                return;
                // Col 0 is unused
            }
            while (this.data.length < y + 1) {
                this.data.push([]);
            }
            while (this.data[y].length < x + 1) {
                this.data[y].push(null);
            }
            this.data[y][x] = val;
        }

        get(x: number, y: number): T | null | string {
            // TODO: убрать это
            if (y == 0) {
                return alphabet[x];
            }
            if (this.data[y] == undefined || this.data[y][x] == undefined) {
                return null;
            } else {
                return this.data[y][x];
            }
        }
    }

    export interface IError {
        type: string,
        text?: string
    }

    export let errors: IError[];

    export function parse(text: string): CalculatedTable {
        const tokens = tokenize(text);
        const tree = buildTree(tokens);
        const table = calc(tree);
        return table;
    }
}
