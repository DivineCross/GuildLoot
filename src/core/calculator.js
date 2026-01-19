import Validator from './validator';
import Sheet, { Cell } from './sheet';

/** @param {Sheet} sheet @param {Map<string, Sheet>} sheetMap @returns {Validator[]} */
function CreateValidators(sheet, sheetMap) {
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
function Calculate(sheetMap) {
    for (const [name, sheet] of sheetMap)
        sheetMap.set(name, CalculateSheet(sheet, sheetMap));

    return sheetMap;
}

/** @param {Sheet} sheet @param {Map<string, Sheet>} sheetMap */
function CalculateSheet(sheet, sheetMap) {
    const newSheet = new Sheet(
        sheet.name, sheet.heads, sheet.rows, CreateValidators(sheet, sheetMap));

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
                        .reduce((acc, r) => acc + Number(r[4].value), 0);

                    row[c] = new Cell(count > 0 ? `${count}` : '');
                }
            }

            return newSheet;
        }
        default:
            return newSheet;
    }
}

export { Calculate, CalculateSheet };
