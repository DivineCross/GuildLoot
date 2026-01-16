import React, { createContext, useContext, useRef, useState } from 'react';
import Sheet, { Cell } from '../core/sheet';

/**
 * @typedef {Object} SheetContextType
 * @property {Sheet} sheet
 * @property {Cell} activeCell
 * @property {(cell: Cell) => void} setActiveCell
 * @property {(value: string) => void} onCellChange
 * @property {() => void} onSheetChange
 */
/** @type {React.Context<SheetContextType> | null} */
const Context = createContext(null);

/** @param {{sheet: Sheet, onSheetChange: () => void}} */
export default function SheetEditor({ sheet, onSheetChange }) {
    const [activeCell, setActiveCell] = useState(new Cell);
    const [_, setLocalSheet] = useState(sheet);
    const editorRef = useRef(null);

    /** @type {SheetContextType} */
    const context = {
        sheet,
        activeCell,
        setActiveCell,
        onCellChange: v => activeCell.setValue(v),
        onSheetChange,
    };

    const heads = sheet.heads;
    const colCount = heads.length;
    const gridStyle = { gridTemplateColumns: `repeat(${colCount}, max-content)` };

    const handleAddRow = () => {
        sheet.addRow();
        onSheetChange();
        setLocalSheet(Sheet.fromObject(sheet));

        requestAnimationFrame(() => {
            if (editorRef.current)
                editorRef.current.scrollTop = editorRef.current.scrollHeight;
        });
    };

    return (
        <Context.Provider value={context}>
            <div className="sheet-editor" ref={editorRef}>
                <div className="sheet__grid" style={gridStyle}>
                    <SheetHead cells={heads} />
                    <SheetBody rows={sheet.rows} />
                </div>
                <div className="sheet__toolbar">
                    <button onClick={handleAddRow}>
                        ＋ 新增列
                    </button>
                </div>
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
                    onMouseDown={e => e.detail > 1 ? e.preventDefault() : undefined}
                    onChange={e => setValue(e.target.value)}
                    onBlur={e => {
                        context.onCellChange(e.target.value);
                        context.onSheetChange();
                    }} />
                : value}
        </div>
    );
}
