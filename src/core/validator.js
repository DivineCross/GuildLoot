import Sheet, { Cell } from './sheet';

export default class Validator {
    constructor(validValues = []) {
        this.validValues = validValues;
    }

    get message() {
        return '違反驗證規則';
    }

    /** @param {Sheet} sheet */
    static FromSheet(sheet) {
        return new Validator(sheet.rows.flatMap(
            row => row.filter(c => !c.isEmpty).map(c => c.value)));
    }

    /** @param {Cell} cell */
    validate(cell) {
        return cell.isEmpty || this.validValues.includes(cell.value);
    }
}
