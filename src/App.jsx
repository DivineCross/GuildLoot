import { useState } from 'react';
import SheetNav from './components/SheetNav';
import SheetEditor from './components/SheetEditor';
import './App.css';

import Service from './core/service';
import { Calculate, CalculateSheet } from './core/calculator';
import Sheet from './core/sheet';

const sheetMap = Calculate(Service.loadData());

/** @param {Sheet} sheet */
const calculateSheet = sheet => {
    return CalculateSheet(sheet, sheetMap);
};

/** @param {Sheet} sheet */
const onSheetChange = sheet => {
    sheetMap.set(sheet.name, sheet);
    Service.saveData(sheetMap);
};

export default function App() {
    const sheetNames = [...sheetMap.keys()];
    const [activeName, setActiveName] = useState(sheetNames[0]);

    return (
        <div className="app">
            <SheetNav
                names={sheetNames}
                activeName={activeName}
                onSelect={setActiveName} />
            <SheetEditor
                key={activeName}
                sheet={sheetMap.get(activeName)}
                calculateSheet={calculateSheet}
                onSheetChange={onSheetChange} />
        </div>
    );
};
