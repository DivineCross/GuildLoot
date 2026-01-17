import Sheet, { Cell } from './sheet';

export default class Validator {
    constructor() {
        /** @type {string[] | undefined} */
        this.validValues = undefined;
        /** @type {number | undefined} */
        this.min = undefined;
        /** @type {number | undefined} */
        this.max = undefined;
    }

    get message() {
        return '違反驗證規則';
    }

    get isByValues() {
        return [this.validValues].every(x => x !== undefined);
    }

    get isByIntMinMax() {
        return [this.min, this.max].every(x => x !== undefined);
    }

    /** @param {Sheet} sheet */
    static FromSheet(sheet) {
        const v = new Validator;
        v.validValues = sheet.rows.flatMap(
            row => row.filter(c => !c.isEmpty).map(c => c.value));

        return v;
    }

    static FromIntMinMax(min, max) {
        if (!(Number.isSafeInteger(min) && Number.isSafeInteger(max)))
            throw new Error('min and max should be integer');
        if (min > max)
            throw new Error('min should be less than max');

        const v = new Validator;
        v.min = min;
        v.max = max;

        return v;
    }

    /** @param {Cell} cell */
    validate(cell) {
        if (cell.isEmpty)
            return true;

        if (this.isByValues)
            return this.validValues.includes(cell.value);

        if (this.isByIntMinMax) {
            const str = cell.value;
            const num = /^(?:(?:-?[1-9]\d*)|0)$/.test(str) ? Number(str) : null;

            return (num === null || !Number.isSafeInteger(num))
                ? false
                : this.min <= num && num <= this.max;
        }

        return false;
    }
}
