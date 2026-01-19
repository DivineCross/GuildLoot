import Validator from './validator';
import Sheet from './sheet';

/** @param {Map<string, Sheet>} sheetMap */
function CreateValidator(sheetMap) {
    sheetMap.get('戰利品').colValidators = [
        Validator.fromDate('yyyy/MM/dd'),
        Validator.fromSheet(sheetMap.get('頭目')),
        Validator.fromSheet(sheetMap.get('成員')),
        Validator.fromSheet(sheetMap.get('道具')),
        Validator.fromIntMinMax(1, 99),
        Validator.fromSheet(sheetMap.get('成員')),
        Validator.fromIntMinMax(1, 99),
        null,
    ];
    sheetMap.get('交易所').colValidators = [
        Validator.fromDate('yyyy/MM/dd'),
        Validator.fromSheet(sheetMap.get('道具')),
        Validator.fromIntMinMax(1, 99),
        Validator.fromIntMinMax(0, 100000),
        Validator.fromSheet(sheetMap.get('成員')),
        null,
    ];
    sheetMap.get('口袋').colValidators = [
        Validator.fromSheet(sheetMap.get('道具')),
    ];
    sheetMap.get('成員').colValidators = [
        Validator.fromDate('yyyy/MM/dd'),
    ];
}

/** @param {Map<string, Sheet>} sheetMap */
function Calculate(sheetMap) {
    CreateValidator(sheetMap);

    const lootSheet = sheetMap.get('戰利品');
    const pocketSheet = sheetMap.get('口袋');

    for (const pocketRow of pocketSheet.rows) {
        const itemName = pocketRow[0].value;
        if (!itemName.trim().length)
            continue;

        for (const [i, pocketCell] of pocketRow.entries()) {
            if (i === 0)
                continue;

            const ownerName = pocketSheet.heads[i].value;
            const count = lootSheet.rows
                .filter(r => r[3].value === itemName && r[5].value === ownerName)
                .reduce((acc, r) => acc + Number(r[4].value), 0);

            pocketCell.setValue(count > 0 ? `${count}` : '');
        }
    }
}

export { Calculate };
