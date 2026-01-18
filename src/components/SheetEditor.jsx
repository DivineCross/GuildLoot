import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import Sheet, { Cell } from '../core/sheet';
import Validator from '../core/validator';

/**
 * @typedef {Object} SheetContextType
 * @property {Sheet} sheet
 * @property {Cell} activeCell
 * @property {(cell: Cell) => void} setActiveCell
 * @property {(action: ReducerAction) => void} dispatch
 */
/** @type {React.Context<SheetContextType> | null} */
const Context = createContext(null);

const ActionType = Object.freeze({
    AddRow: 'AddRow',
    UpdateCell: 'UpdateCell',
});

/**
 * @typedef {Object} ReducerAction
 * @property {string} type
 * @property {Cell} targetCell
 * @property {string} cellValue
 */

/**
 * @param {Sheet} sheet
 * @param {ReducerAction} action
 * @param {(sheet: Sheet) => Sheet} calculateSheet
 */
function reducer(sheet, action, calculateSheet) {
    const newSheet = new Sheet(sheet.name, sheet.heads, sheet.rows);

    switch (action.type) {
        case ActionType.AddRow: {
            newSheet.addRow();

            return newSheet;
        }
        case ActionType.UpdateCell: {
            for (const row of [newSheet.heads, ...newSheet.rows])
                for (const [c, cell] of row.entries())
                    if (cell === action.targetCell)
                        row[c] = new Cell(action.cellValue);

            return calculateSheet(newSheet);
        }
        default:
            return sheet;
    }
}

/**
 * @param {{
 *  sheet: Sheet,
 *  calculateSheet: (sheet: Sheet) => Sheet,
 *  onSheetChange: (sheet: Sheet) => void,
 * }}
 */
export default function SheetEditor({ sheet, calculateSheet, onSheetChange }) {
    const [activeCell, setActiveCell] = useState(new Cell);
    const [localSheet, dispatch] = useReducer((s, a) => reducer(s, a, calculateSheet), sheet);
    const isMountedRef = useRef(false);
    const editorRef = useRef(null);

    useEffect(() => {
        if (!isMountedRef.current)
            return void (isMountedRef.current = true);

        onSheetChange(localSheet);
    }, [localSheet, onSheetChange]);

    /** @type {SheetContextType} */
    const context = {
        sheet: localSheet,
        activeCell,
        setActiveCell,
        dispatch,
    };

    const heads = localSheet.heads;
    const colCount = heads.length;
    const gridStyle = { gridTemplateColumns: `repeat(${colCount}, max-content)` };

    const handleAddRow = () => {
        dispatch({ type: ActionType.AddRow });

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
                    <SheetBody rows={localSheet.rows} />
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
    const context = useContext(Context);
    const validators = isHead ? [] : context.sheet.colValidators;
    const headClass = isHead ? ' sheet__head' : '';

    return (
        <div className={`sheet__row${headClass}`}>{cells.map((cell, i) =>
            <SheetCell key={i} cell={cell} validator={validators[i]} />
        )}</div>
    );
}

/** @param {{cell: Cell, validator: Validator}} */
function SheetCell({ cell, validator }) {
    const [value, setValue] = useState(cell.value);
    const context = useContext(Context);
    const isActive = context.activeCell === cell;
    const activeClass = isActive ? ' sheet__cell--active' : '';
    const isInvalid = validator?.validate(cell) === false;
    const invalidClass = isInvalid ? ' sheet__cell--invalid' : '';

    return (
        <div
            className={`sheet__cell${activeClass}${invalidClass}`}
            title={isInvalid ? validator.message : undefined}
            onClick={() => context.setActiveCell(cell)}>
            {isActive
                ? <input
                    value={value}
                    onMouseDown={e => e.detail > 1 ? e.preventDefault() : undefined}
                    onChange={e => setValue(e.target.value)}
                    onBlur={e => {
                        context.dispatch({
                            type: ActionType.UpdateCell,
                            targetCell: cell,
                            cellValue: e.target.value,
                        });
                    }} />
                : cell.value}
        </div>
    );
}
