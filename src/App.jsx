import { useState } from 'react';
import SheetNav from './components/SheetNav';
import SheetEditor from './components/SheetEditor';
import './App.css';

import Service from './core/service';
import { calculate, calculateSheet, reducer } from './core/reducer';
import Sheet from './core/sheet';

const sheetMap = calculate(Service.loadData());

const sheetReducer = (sheet, action) => {
    return reducer(sheet, {...action, sheetMap: sheetMap});
};

/** @param {Sheet} sheet */
const onSheetChange = sheet => {
    sheetMap.set(sheet.name, sheet);
    Service.saveData(sheetMap);
};

export default function App() {
    const sheetNames = [...sheetMap.keys()];
    const [activeName, setActiveName] = useState(sheetNames[0]);
    const sheet = calculateSheet(sheetMap.get(activeName), sheetMap);

    return (
        <div className="app">
            <SheetNav
                names={sheetNames}
                activeName={activeName}
                onSelect={setActiveName} />
            <SheetEditor
                key={activeName}
                sheet={sheet}
                reducer={sheetReducer}
                onSheetChange={onSheetChange} />
        </div>
    );
};
