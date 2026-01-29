import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Sheet, { Cell } from '../core/sheet';
import Validator from '../core/validator';
import { type ReducerAction, ActionType } from '../core/reducer';

interface SheetContextType {
    sheet: Sheet;
    activeCell: Cell;
}
const SheetContext = createContext<SheetContextType | null>(null);

interface DispatchContextType {
    setActiveCell: (cell: Cell) => void;
    dispatch: (action: ReducerAction) => void;
}
const DispatchContext = createContext<DispatchContextType | null>(null);

interface Props {
    sheet: Sheet;
    reducer: (sheet: Sheet, action: ReducerAction) => Sheet;
    onSheetChange: (sheet: Sheet) => void;
}
export default function SheetEditor({ sheet: propSheet, reducer, onSheetChange }: Props) {
    const [activeCell, setActiveCell] = useState(new Cell);
    const [sheet, dispatch] = useReducer(reducer, propSheet);
    const isMountedRef = useRef<boolean>(false);
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMountedRef.current)
            return void (isMountedRef.current = true);

        onSheetChange(sheet);
    }, [sheet, onSheetChange]);

    const sheetContext: SheetContextType = {
        sheet,
        activeCell,
    };

    const dispatchContext: DispatchContextType = useMemo(() => ({
        setActiveCell,
        dispatch,
    }), [setActiveCell, dispatch]);

    const handleAddRow = () => {
        dispatchContext.dispatch({ type: ActionType.AddRow });

        requestAnimationFrame(() => {
            if (editorRef.current)
                editorRef.current.scrollTop = editorRef.current.scrollHeight;
        });
    };

    const gridStyle = { gridTemplateColumns: `repeat(${sheet.colCount}, max-content)` };

    return (
        <SheetContext.Provider value={sheetContext}>
            <DispatchContext.Provider value={dispatchContext}>
                <div className="sheet-editor" ref={editorRef}>
                    <div className="sheet__grid" style={gridStyle}>
                        <SheetRow key="head" cells={sheet.heads} isHead={true} />
                        {sheet.rows.map((row: Cell[], i: number) =>
                            <SheetRow key={i} cells={row} />)}
                    </div>
                    <div className="sheet__toolbar">
                        <button onClick={handleAddRow}>
                            ＋ 新增列
                        </button>
                    </div>
                </div>
            </DispatchContext.Provider>
        </SheetContext.Provider>
    );
};

interface RowProps {
    cells: Cell[];
    isHead?: boolean;
}
function SheetRow({ cells, isHead = false }: RowProps) {
    const sheetContext = useContext(SheetContext)!;
    const validators = isHead ? [] : sheetContext.sheet.colValidators;
    const headClass = isHead ? ' sheet__head' : '';

    return (
        <div className={`sheet__row${headClass}`}>{cells.map((cell, i) =>
            <SheetCell
                key={i}
                cell={cell}
                validator={validators[i]}
                isActive={cell === sheetContext.activeCell} />
        )}</div>
    );
}

interface CellProps {
    cell: Cell;
    validator: Validator | null;
    isActive: boolean;
}
const SheetCell = React.memo(function SheetCell({ cell, validator, isActive }: CellProps) {
    const dispatchContext = useContext(DispatchContext)!;
    const activeClass = isActive ? ' sheet__cell--active' : '';
    const isInvalid = validator?.validate(cell) === false;
    const invalidClass = isInvalid ? ' sheet__cell--invalid' : '';

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const input = inputRef.current;
        if (!input || !isActive)
            return;

        const handler = (e: Event) => dispatchContext?.dispatch({
            type: ActionType.UpdateCell,
            targetCell: cell,
            cellValue: (e.target as HTMLInputElement).value,
        });

        input.addEventListener('change', handler);

        return () => input.removeEventListener('change', handler);
    }, [dispatchContext, cell, isActive]);

    return (
        <div
            className={`sheet__cell${activeClass}${invalidClass}`}
            title={isInvalid ? validator.message : undefined}
            onClick={() => dispatchContext.setActiveCell(cell)}>
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
}, (prev, next) => {
    return (Object.keys(prev) as (keyof CellProps)[]).every(k => prev[k] === next[k]);
});
