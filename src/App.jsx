import SheetNav from './SheetNav';
import SheetEditor from './SheetEditor';
import './App.css';

export default function App() {
    return (
        <div className="app">
            <SheetNav />
            <SheetEditor />
        </div>
    );
};
