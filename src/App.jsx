import { useState } from 'react';
import SheetNav from './components/SheetNav';
import SheetEditor from './components/SheetEditor';
import './App.css';

import { sheetMap as mockSheetMap } from './mock';
import Sheet, { Cell } from './core/sheet';

const sheetMap = loadData();

export default function App() {
    const sheetNames = [...sheetMap.keys()];
    const [activeName, setActiveName] = useState(sheetNames[0]);

    return (
        <div className="app">
            <SheetNav names={sheetNames} activeName={activeName} onSelect={setActiveName} />
            <SheetEditor key={activeName} sheet={sheetMap.get(activeName)} />
        </div>
    );
};

/** @returns {Map<string, Sheet>} */
function loadData() {
    const localSheetMap = (() => {
        const appName = 'guildLoot';
        const mapKey = `${appName}_sheetMap`;
        const json = localStorage.getItem(mapKey);
        if (!json)
            return null;

        const map = new Map(JSON.parse(json)
            .map(kv => [kv[0], Sheet.fromObject(kv[1])]));

        return map;
    })();

    const sheetMap = localSheetMap ?? mockSheetMap;

    for (const sheet of sheetMap.values())
        sheet.rows = sheet.rows.map(row =>
            [...Array(sheet.heads.length).keys()].map(i => row[i] ?? new Cell));

    return sheetMap;
}
