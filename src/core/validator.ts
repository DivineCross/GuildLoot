import Sheet, { Cell } from './sheet';

interface Props {
    validValues?: string[];
    dateFormat?: string;
    min?: number;
    max?: number;
}

export default class Validator {
    readonly validValues?: readonly string[];
    readonly dateFormat?: string;
    readonly min?: number;
    readonly max?: number;

    constructor({ validValues, dateFormat, min, max }: Props) {
        this.validValues = validValues ? Object.freeze([...validValues]) : undefined;
        this.dateFormat = dateFormat;
        this.min = min;
        this.max = max;

        Object.freeze(this);
    }

    get message() {
        return '違反驗證規則';
    }

    get isByValues() {
        return this.hasValues(this.validValues);
    }

    get isByDate() {
        return this.hasValues(this.dateFormat);
    }

    get isByIntMinMax() {
        return this.hasValues(this.min, this.max);
    }

    static fromObject(obj: any) {
        return obj ? new Validator(obj) : obj;
    }

    static fromSheet(sheet: Sheet) {
        return new Validator({
            validValues: sheet.rows.flatMap(
                row => row.filter(c => !c.isEmpty).map(c => c.value))
        });
    }

    static fromDate(dateFormat: string) {
        if (dateFormat !== 'yyyy/MM/dd')
            throw new Error('support only yyyy/MM/dd');

        return new Validator({ dateFormat });

    }

    static fromIntMinMax(min: number, max: number) {
        if (!(Number.isSafeInteger(min) && Number.isSafeInteger(max)))
            throw new Error('min and max should be integer');
        if (min > max)
            throw new Error('min should be less than max');

        return new Validator({ min, max });
    }

    validate(cell: Cell) {
        const str = cell.value;

        if (cell.isEmpty)
            return true;

        if (this.isByValues)
            return this.validValues!.includes(cell.value);

        if (this.isByDate) {
            if (!/^\d{4}\/\d{2}\/\d{2}$/.test(str))
                return false;

            const [y, m, d] = str.split('/').map(Number);
            const date = new Date(y, m - 1, d);

            return (
                date.getFullYear() === y
                && date.getMonth() === m - 1
                && date.getDate() === d);
        }

        if (this.isByIntMinMax) {
            if (!/^(?:(?:-?[1-9]\d*)|0)$/.test(str))
                return false;

            const num = Number(str);

            return !Number.isSafeInteger(num)
                ? false
                : this.min! <= num && num <= this.max!;
        }

        return false;
    }

    hasValues(...props: any[]) {
        return props.every(x => x !== undefined);
    }
}
