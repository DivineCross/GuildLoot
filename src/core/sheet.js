class Sheet {
    constructor(name = '', heads = [], rows = []) {
        /** @type {string} */
        this.name = name;
        /** @type {Cell[]} */
        this.heads = heads;
        /** @type {Cell[][]} */
        this.rows = rows;
    }

    get rowCount() {
        return this.rows.length;
    }

    get colCount() {
        return this.heads.length;
    }

    static fromObject({ name = '', heads = [], rows = [] } = {}) {
        return new Sheet(
            name,
            heads.map(Cell.fromObject),
            rows.map(row => row.map(Cell.fromObject)));
    }

    static fromPaste(name = '', content = '') {
        const rows = content.trim().split('\n')
            .map(line => line.split('\t').map(v => new Cell(v)));

        return new Sheet(name, rows[0], rows.slice(1));
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
