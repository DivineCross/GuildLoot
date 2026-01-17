import { useState } from 'react';
import SheetNav from './components/SheetNav';
import SheetEditor from './components/SheetEditor';
import './App.css';

import Service from './core/service';
import { Calculate } from './core/calculator';

const sheetMap = Service.loadData();

export default function App() {
    const sheetNames = [...sheetMap.keys()];
    const [activeName, setActiveName] = useState(sheetNames[0]);
    const onSheetChange = () => Service.saveData(sheetMap);

    Calculate(sheetMap);

    return (
        <div className="app">
            <SheetNav
                names={sheetNames}
                activeName={activeName}
                onSelect={setActiveName} />
            <SheetEditor
                key={activeName}
                sheet={sheetMap.get(activeName)}
                onSheetChange={onSheetChange} />
        </div>
    );
};
