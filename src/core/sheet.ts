import Validator from './validator';

interface SheetProps {
    name?: string;
    heads?: Cell[];
    rows?: Cell[][];
    colValidators?: (Validator | null)[];
}

class Sheet {
    name: string;
    heads: Cell[];
    rows: Cell[][];
    colValidators: (Validator | null)[];

    constructor(name: string, heads: Cell[], rows: Cell[][], colValidators: (Validator | null)[]) {
        this.name = name;
        this.heads = heads;
        this.rows = rows;
        this.colValidators = colValidators;
    }

    get rowCount() {
        return this.rows.length;
    }

    get colCount() {
        return this.heads.length;
    }

    get allRows() {
        return [this.heads, ...this.rows];
    }

    static fromObject({ name = '', heads = [], rows = [], colValidators = [] }: SheetProps) {
        return new Sheet(
            name,
            heads.map(Cell.fromObject),
            rows.map(row => row.map(Cell.fromObject)),
            colValidators.map(Validator.fromObject),
        );
    }

    static fromPaste(name = '', content = '') {
        const rows = content.trim().split('\n')
            .map(line => line.split('\t').map(v => new Cell(v)));

        return new Sheet(name, rows[0], rows.slice(1), []);
    }

    normalize() {
        this.rows = this.rows.map(row =>
            [...Array(this.colCount).keys()].map(i => row[i] ?? new Cell));

        for (let i = this.rowCount - 1; i >= 0; --i)
            if (this.rows[i].every(c => c.isEmpty))
                this.rows.pop();
            else
                break;
    }

    addRow() {
        const newRow = [...Array(this.colCount)].map(() => new Cell);
        this.rows.push(newRow);
    }
}

class Cell {
    value: string;

    constructor(value = '') {
        this.value = value;
    }

    get isEmpty() {
        return !this.value.trim().length;
    }

    static fromObject({ value = '' }) {
        return new Cell(value);
    }

    setValue(value = '') {
        this.value = value;
    }
}

export default Sheet;
export { Cell };
