import Sheet, { Cell } from './sheet';
import { sheetMap as mockSheetMap } from '../mock';

const AppName = 'guildLoot';
const StorageKey = Object.freeze({
    SheetMap: `${AppName}_sheetMap`
});

export default class Service {
    /** @returns {Map<string, Sheet>} */
    static loadData() {
        /** @type {Map<string, Sheet>} */
        const localSheetMap = (() => {
            const json = localStorage.getItem(StorageKey.SheetMap);
            if (!json)
                return null;

            const map = new Map(JSON.parse(json)
                .map(kv => [kv[0], Sheet.fromObject(kv[1])]));

            return map;
        })();

        const sheetMap = localSheetMap ?? mockSheetMap;

        for (const sheet of sheetMap.values())
            sheet.normalize();

        return sheetMap;
    }

    /** @param {Map<string, Sheet>} sheetMap */
    static saveData(sheetMap) {
        localStorage.setItem(StorageKey.SheetMap, JSON.stringify([...sheetMap]));
    }
}
