import { useState } from 'react';
import SheetNav from './SheetNav';
import SheetEditor from './SheetEditor';
import './App.css';

import { sheetMap } from './mock';

export default function App() {
    const sheetNames = [...sheetMap.keys()];
    const [activeName, setActiveName] = useState(sheetNames[0]);

    return (
        <div className="app">
            <SheetNav names={sheetNames} activeName={activeName} onSelect={setActiveName} />
            <SheetEditor {...(sheetMap.get(activeName))} />
        </div>
    );
};
