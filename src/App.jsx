import { useState } from 'react';
import SheetNav from './SheetNav';
import SheetEditor from './SheetEditor';
import './App.css';

import { sheetMap as mockSheetMap } from './mock';
import { Cell } from './sheet';

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

function loadData() {
    const sheetMap = mockSheetMap;

    for (const sheet of sheetMap.values())
        sheet.rows = sheet.rows.map(row =>
            [...Array(sheet.heads.length).keys()].map(i => row[i] ?? new Cell));

    return sheetMap;
}
