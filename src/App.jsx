import { useState } from 'react';
import SheetNav from './components/SheetNav';
import SheetEditor from './components/SheetEditor';
import './App.css';

import Service from './core/service';
import { ActionType, reducer, reduceMap } from './core/reducer';
import Sheet from './core/sheet';

const sheetMap = reduceMap(Service.loadData());

const sheetReducer = (sheet, action) => {
    return reducer(sheet, { ...action, sheetMap: sheetMap });
};

/** @param {Sheet} sheet */
const onSheetChange = sheet => {
    sheetMap.set(sheet.name, sheet);
    Service.saveData(sheetMap);
};

export default function App() {
    const sheetNames = [...sheetMap.keys()];
    const [activeName, setActiveName] = useState(sheetNames[0]);
    const sheet = sheetReducer(sheetMap.get(activeName), { type: ActionType.Calculate });

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
