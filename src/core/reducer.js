import Validator from './validator';
import Sheet, { Cell } from './sheet';

/**
 * @typedef {Object} ReducerAction
 * @property {string} type
 * @property {Map<string, Sheet>} sheetMap
 * @property {Cell} targetCell
 * @property {string} cellValue
 */

const ActionType = Object.freeze({
    AddRow: 'AddRow',
    UpdateCell: 'UpdateCell',
});

/** @param {Sheet} sheet @param {ReducerAction} action */
function reducer(sheet, action) {
    const newSheet = new Sheet(
        sheet.name,
        [...sheet.heads],
        [...sheet.rows],
        [...sheet.colValidators]);

    switch (action.type) {
        case ActionType.AddRow: {
            newSheet.addRow();

            return newSheet;
        }
        case ActionType.UpdateCell: {
            for (const row of newSheet.allRows)
                for (const [c, cell] of row.entries())
                    if (cell === action.targetCell)
                        row[c] = new Cell(action.cellValue);

            return calculateSheet(newSheet, action.sheetMap);
        }
        default:
            return sheet;
    }
}

/** @param {Sheet} sheet @param {Map<string, Sheet>} sheetMap @returns {Validator[]} */
function createValidators(sheet, sheetMap) {
    switch (sheet.name) {
        case '戰利品': return [
            Validator.fromDate('yyyy/MM/dd'),
            Validator.fromSheet(sheetMap.get('頭目')),
            Validator.fromSheet(sheetMap.get('成員')),
            Validator.fromSheet(sheetMap.get('道具')),
            Validator.fromIntMinMax(1, 99),
            Validator.fromSheet(sheetMap.get('成員')),
            Validator.fromIntMinMax(1, 99),
            null,
        ];
        case ('交易所'): return [
            Validator.fromDate('yyyy/MM/dd'),
            Validator.fromSheet(sheetMap.get('道具')),
            Validator.fromIntMinMax(1, 99),
            Validator.fromIntMinMax(0, 100000),
            Validator.fromSheet(sheetMap.get('成員')),
            null,
        ];
        case ('口袋'): return [
            Validator.fromSheet(sheetMap.get('道具')),
        ];
        case ('成員'): return [
            Validator.fromDate('yyyy/MM/dd'),
        ];
        default: return [
        ];
    }
}

/** @param {Map<string, Sheet>} sheetMap */
function calculate(sheetMap) {
    for (const [name, sheet] of sheetMap)
        sheetMap.set(name, calculateSheet(sheet, sheetMap));

    return sheetMap;
}

/** @param {Sheet} sheet @param {Map<string, Sheet>} sheetMap */
function calculateSheet(sheet, sheetMap) {
    const newSheet = new Sheet(
        sheet.name, sheet.heads, sheet.rows, createValidators(sheet, sheetMap));

    switch (newSheet.name) {
        case '口袋': {
            const lootSheet = sheetMap.get('戰利品');
            newSheet.rows = sheet.rows.map(r => r.map(Cell.fromObject));

            for (const row of newSheet.rows) {
                const itemName = row[0].value;
                if (!itemName.trim().length)
                    continue;

                for (const [c, _] of row.entries()) {
                    if (c === 0)
                        continue;

                    const ownerName = newSheet.heads[c].value;
                    const count = lootSheet.rows
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

function parseInt(str = '') {
    if (!/^(?:(?:-?[1-9]\d*)|0)$/.test(str))
        return NaN;

    const num = Number(str);

    return Number.isSafeInteger(num) ? num : NaN;
}

export { calculate, calculateSheet, reducer, ActionType };
