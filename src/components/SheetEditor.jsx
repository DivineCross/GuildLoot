import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import Sheet, { Cell } from '../core/sheet';
import Validator from '../core/validator';
import { ActionType } from '../core/reducer';

/**
 * @typedef {Object} ReducerAction
 * @property {string} type
 * @property {Map<string, Sheet>} sheetMap
 * @property {Cell} targetCell
 * @property {string} cellValue
 */

/**
 * @typedef {Object} SheetContextType
 * @property {Sheet} sheet
 * @property {Cell} activeCell
 * @property {(cell: Cell) => void} setActiveCell
 * @property {(action: ReducerAction) => void} dispatch
 */
/** @type {React.Context<SheetContextType> | null} */
const Context = createContext(null);

/**
 * @param {{
 *  sheet: Sheet
 *  reducer: (sheet: Sheet, action: ReducerAction) => Sheet
 *  onSheetChange: (sheet: Sheet) => void
 * }}
 */
export default function SheetEditor({ sheet: propSheet, reducer, onSheetChange }) {
    const [activeCell, setActiveCell] = useState(new Cell);
    const [sheet, dispatch] = useReducer(reducer, propSheet);
    const isMountedRef = useRef(false);
    const editorRef = useRef(null);

    useEffect(() => {
        if (!isMountedRef.current)
            return void (isMountedRef.current = true);

        onSheetChange(sheet);
    }, [sheet, onSheetChange]);

    /** @type {SheetContextType} */
    const context = {
        sheet: sheet,
        activeCell,
        setActiveCell,
        dispatch,
    };

    const handleAddRow = () => {
        context.dispatch({ type: ActionType.AddRow });

        requestAnimationFrame(() => {
            if (editorRef.current)
                editorRef.current.scrollTop = editorRef.current.scrollHeight;
        });
    };

    const gridStyle = { gridTemplateColumns: `repeat(${sheet.colCount}, max-content)` };

    return (
        <Context.Provider value={context}>
            <div className="sheet-editor" ref={editorRef}>
                <div className="sheet__grid" style={gridStyle}>
                    <SheetRow key="head" cells={sheet.heads} isHead={true} />
                    {sheet.rows.map((row, i) =>
                        <SheetRow key={i} cells={row} />)}
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
    const context = useContext(Context);
    const isActive = context.activeCell === cell;
    const activeClass = isActive ? ' sheet__cell--active' : '';
    const isInvalid = validator?.validate(cell) === false;
    const invalidClass = isInvalid ? ' sheet__cell--invalid' : '';

    const inputRef = useRef();
    useEffect(() => {
        /** @type {HTMLInputElement} */
        const input = inputRef.current;
        if (!input || !isActive)
            return;

        const handler = e => context.dispatch({
            type: ActionType.UpdateCell,
            targetCell: cell,
            cellValue: e.target.value,
        });

        input.addEventListener('change', handler);

        return () => input.removeEventListener('change', handler);
    }, [context, cell, isActive]);

    return (
        <div
            className={`sheet__cell${activeClass}${invalidClass}`}
            title={isInvalid ? validator.message : undefined}
            onClick={() => context.setActiveCell(cell)}>
            {isActive
                ? <>
                    <input
                        ref={inputRef}
                        defaultValue={cell.value}
                        onMouseDown={e => e.detail > 1 ? e.preventDefault() : undefined} />
                    <span>{cell.value}</span>
                </>
                : cell.value}
        </div>
    );
}
