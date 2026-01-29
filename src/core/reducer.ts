import Validator from './validator';
import Sheet, { Cell } from './sheet';

interface ReducerAction {
    type: string;
    sheetMap?: Map<string, Sheet>;
    targetCell?: Cell;
    cellValue?: string;
}

const ActionType = Object.freeze({
    Calculate: 'Calculate',
    AddRow: 'AddRow',
    UpdateCell: 'UpdateCell',
});

function reducer(sheet: Sheet, action: ReducerAction) {
    const newSheet = shallowCopySheet(sheet);

    switch (action.type) {
        case ActionType.Calculate: {
            return calculateSheet(newSheet, action.sheetMap!);
        }
        case ActionType.AddRow: {
            newSheet.rows = [
                ...newSheet.rows,
                [...Array(newSheet.colCount)].map(() => new Cell),
            ];

            return newSheet;
        }
        case ActionType.UpdateCell: {
            newSheet.heads = [...newSheet.heads];
            newSheet.rows = newSheet.rows.map(r => [...r]);
            for (const row of newSheet.allRows)
                for (const [c, cell] of row.entries())
                    if (cell === action.targetCell)
                        row[c] = new Cell(action.cellValue);

            return calculateSheet(newSheet, action.sheetMap!);
        }
        default:
            return sheet;
    }
}

function calculateSheet(sheet: Sheet, sheetMap: Map<string, Sheet>) {
    const newSheet = shallowCopySheet(sheet);

    newSheet.colValidators = createValidators(newSheet, sheetMap);

    switch (newSheet.name) {
        case '口袋': {
            const lootSheet = sheetMap.get('戰利品')!;
            newSheet.rows = newSheet.rows.map(r => r.map(Cell.fromObject));

            for (const row of newSheet.rows) {
                const itemName = row[0].value;
                const isEmptyItemName = !itemName.trim().length;

                for (const [c] of row.entries()) {
                    if (c === 0)
                        continue;

                    const ownerName = newSheet.heads[c].value;
                    const count = isEmptyItemName ? 0 : lootSheet.rows
                        .filter(r => r[3].value === itemName && r[5].value === ownerName)
                        .reduce((acc, r) => {
                            if (!Number.isInteger(acc))
                                return NaN;

                            const num = parseInt(r[4].value);
                            if (!Number.isInteger(num))
                                return NaN;

                            return acc + num;
                        }, 0);

                    row[c] = new Cell(Number.isInteger(count)
                        ? count > 0 ? `${count}` : ''
                        : '#ERROR');
                }
            }

            return newSheet;
        }
        default:
            return newSheet;
    }
}

function createValidators(sheet: Sheet, sheetMap: Map<string, Sheet>): (Validator | null)[] {
    switch (sheet.name) {
        case '戰利品': return [
            Validator.fromDate('yyyy/MM/dd'),
            Validator.fromSheet(sheetMap.get('頭目')!),
            Validator.fromSheet(sheetMap.get('成員')!),
            Validator.fromSheet(sheetMap.get('道具')!),
            Validator.fromIntMinMax(1, 99),
            Validator.fromSheet(sheetMap.get('成員')!),
            Validator.fromIntMinMax(1, 99),
            null,
        ];
        case ('交易所'): return [
            Validator.fromDate('yyyy/MM/dd'),
            Validator.fromSheet(sheetMap.get('道具')!),
            Validator.fromIntMinMax(1, 99),
            Validator.fromIntMinMax(0, 100000),
            Validator.fromSheet(sheetMap.get('成員')!),
            null,
        ];
        case ('口袋'): return [
            Validator.fromSheet(sheetMap.get('道具')!),
        ];
        case ('成員'): return [
            Validator.fromDate('yyyy/MM/dd'),
        ];
        default: return [
        ];
    }
}

function shallowCopySheet(s: Sheet): Sheet {
    return new Sheet(s.name, s.heads, s.rows, s.colValidators);
}

function parseInt(str = '') {
    if (!/^(?:(?:-?[1-9]\d*)|0)$/.test(str))
        return NaN;

    const num = Number(str);

    return Number.isSafeInteger(num) ? num : NaN;
}

export { type ReducerAction, ActionType, reducer };
