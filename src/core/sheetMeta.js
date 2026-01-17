import Validator from './validator';
import Sheet from './sheet';

/** @param {Map<string, Sheet>} sheetMap */
function CreateValidator(sheetMap) {
    sheetMap.get('戰利品').colValidators = [
        Validator.FromDate('yyyy/MM/dd'),
        Validator.FromSheet(sheetMap.get('頭目')),
        Validator.FromSheet(sheetMap.get('成員')),
        Validator.FromSheet(sheetMap.get('道具')),
        Validator.FromIntMinMax(1, 99),
        Validator.FromSheet(sheetMap.get('成員')),
        Validator.FromIntMinMax(1, 99),
        null,
    ];
    sheetMap.get('交易所').colValidators = [
        Validator.FromDate('yyyy/MM/dd'),
        Validator.FromSheet(sheetMap.get('道具')),
        Validator.FromIntMinMax(1, 99),
        Validator.FromIntMinMax(0, 100000),
        Validator.FromSheet(sheetMap.get('成員')),
        null,
    ];
    sheetMap.get('口袋').colValidators = [
        Validator.FromSheet(sheetMap.get('道具')),
    ];
    sheetMap.get('成員').colValidators = [
        Validator.FromDate('yyyy/MM/dd'),
    ];
}

export { CreateValidator as SetSheetMeta };
