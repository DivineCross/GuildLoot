import Sheet from './sheet';
import { sheetMap as mockSheetMap } from '../mock';

const AppName = 'guildLoot';
const StorageKey = Object.freeze({
    SheetMap: `${AppName}_sheetMap`
});

export default class Service {
    static loadData() {
        const localSheetMap = (() => {
            const json = localStorage.getItem(StorageKey.SheetMap);
            if (!json)
                return null;

            const kvs: [string, any][] = JSON.parse(json);
            const map = new Map(kvs.map(kv => [kv[0], Sheet.fromObject(kv[1])]));

            return map;
        })();

        const sheetMap = localSheetMap ?? mockSheetMap;

        for (const sheet of sheetMap.values())
            sheet.normalize();

        return sheetMap;
    }

    static saveData(sheetMap: Map<string, Sheet>) {
        localStorage.setItem(StorageKey.SheetMap, JSON.stringify([...sheetMap]));
    }
}
