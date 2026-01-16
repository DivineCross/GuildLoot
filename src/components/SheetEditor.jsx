import React, { createContext, useContext, useState } from 'react';
import Sheet, { Cell } from '../core/sheet';

/**
 * @typedef {Object} SheetContextType
 * @property {Sheet} sheet
 * @property {Cell} activeCell
 * @property {(cell: Cell) => void} setActiveCell
 * @property {(value: string) => void} setActiveCellValue
 */
/** @type {React.Context<SheetContextType> | null} */
const Context = createContext(null);

/** @param {{sheet: Sheet}} */
export default function SheetEditor({ sheet }) {
    const [activeCell, setActiveCell] = useState(new Cell);
    const context = {
        sheet,
        activeCell,
        setActiveCell,
        setActiveCellValue: v => activeCell.setValue(v),
    };

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
    const [value, setValue] = useState(cell.value);
    const context = useContext(Context);
    const isActive = context.activeCell === cell;
    const activeClass = isActive ? ' sheet__cell--active' : '';

    return (
        <div
            className={`sheet__cell${activeClass}`}
            onClick={() => context.setActiveCell(cell)}>
            {isActive
                ? <input
                    value={value}
                    onChange={e => {
                        setValue(e.target.value);
                        context.setActiveCellValue(e.target.value);
                    }} />
                : value}
        </div>
    );
}
