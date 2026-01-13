class Sheet {
    constructor(name = '', heads = [], rows = []) {
        this.name = name;
        this.heads = heads;
        this.rows = rows;
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
}

class Cell {
    constructor(value = '') {
        this.value = value;
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
