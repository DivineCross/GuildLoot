import { createContext, useContext, useState, useMemo } from 'react';
import Sheet, { Cell } from './sheet';

/** @type {React.Context<SheetContext>} */
const Context = createContext(null);

/** @param {{sheet: Sheet}} */
export default function SheetEditor({ sheet }) {
    const [activeCell, setActiveCell] = useState(null);
    const context = useMemo(
        () => new SheetContext(sheet, activeCell, setActiveCell),
        [sheet, activeCell]);

    const heads = sheet.heads;
    const colCount = heads.length;
    const gridStyle = { gridTemplateColumns: `repeat(${colCount}, max-content)` };

    return (
        <Context.Provider value={context}>
            <div className="sheet-editor" style={gridStyle}>
                <SheetHead cells={heads} />
                <SheetBody rows={sheet.rows} />
            </div>
        </Context.Provider>
    );
};

/** @param {{cells: Cell[]}} */
function SheetHead({ cells = [] }) {
    return (
        <SheetRow cells={cells} isHead={true} />
    );
}

/** @param {{rows: Cell[][]}} */
function SheetBody({ rows = [] }) {
    return rows.map((row, i) =>
        <SheetRow key={i} cells={row} />
    );
}

/** @param {{cells: Cell[], isHead: boolean}} */
function SheetRow({ cells = [], isHead = false }) {
    const headClass = isHead ? ' sheet__head' : '';

    return (
        <div className={`sheet__row${headClass}`}>{cells.map((cell, i) =>
            <SheetCell key={i} cell={cell} />
        )}</div>
    );
}

/** @param {{cell: Cell}} */
function SheetCell({ cell }) {
    const context = useContext(Context);
    const isActive = context.activeCell === cell;
    const activeClass = isActive ? ' sheet__cell--active' : '';

    return (
        <div className={`sheet__cell${activeClass}`} onClick={() => context.setActiveCell(cell)}>
            {cell.value}
        </div>
    );
}

class SheetContext {
    constructor(sheet = null, activeCell = null, setActiveCell = () => {}) {
        /** @type {Sheet} */
        this.sheet = sheet;
        /** @type {Cell} */
        this.activeCell = activeCell;
        /** @type {(cell: Cell) => void} */
        this.setActiveCell = setActiveCell;
    }
}
