import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Sheet, { Cell } from '../core/sheet';
import { type ReducerAction, ActionType } from '../core/reducer';

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
    const viewRows = useMemo(() => {
        return sheet.allRows.map((row, r) => row.map((cell, c) => {
            const validator = sheet.colValidators[c];
            const isInvalid = r !== 0 && validator?.validate(cell) === false;
            const cellProps: CellProps = {
                cell,
                isActive: cell === activeCell,
                isInvalid,
                message: isInvalid ? validator.message : undefined,
            };

            return cellProps;
        }));
    }, [sheet, activeCell]);

    return (
        <DispatchContext.Provider value={dispatchContext}>
            <div className="sheet-editor" ref={editorRef}>
                <div className="sheet__grid" style={gridStyle}>{
                    viewRows.map((row, r) =>
                        <div className={`sheet__row${r === 0 ? ' sheet__head' : ''}`} key={r}>{
                            row.map((props, c) =>
                                <SheetCell key={c} {...props} />
                            )
                        }</div>
                    )
                }</div>
                <div className="sheet__toolbar">
                    <button onClick={handleAddRow}>
                        ＋ 新增列
                    </button>
                </div>
            </div>
        </DispatchContext.Provider>
    );
};

interface CellProps {
    cell: Cell;
    isActive: boolean;
    isInvalid: boolean;
    message: string | undefined;
}
const SheetCell = React.memo(function SheetCell({ cell, isActive, isInvalid, message }: CellProps) {
    const dispatchContext = useContext(DispatchContext)!;
    const activeClass = isActive ? ' sheet__cell--active' : '';
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
            title={message}
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
