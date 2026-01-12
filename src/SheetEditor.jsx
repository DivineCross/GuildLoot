export default function SheetEditor({ heads = [], rows = [] }) {
    const gridStyle = { gridTemplateColumns: `repeat(${heads.length}, max-content)` };

    return (
        <div className="sheet-editor" style={gridStyle}>
            <SheetHead heads={heads} />
            <SheetBody rows={rows} />
        </div>
    );
};

function SheetHead({ heads }) {
    return (
        <SheetRow cells={heads} isHead={true} />
    );
}

function SheetBody({ rows }) {
    return rows.map((row, i) =>
        <SheetRow key={i} cells={row} />
    );
}

function SheetRow({ cells = [], isHead = false }) {
    const headClass = isHead ? ' sheet__head' : '';

    return (
        <div className={`sheet__row${headClass}`}>{cells.map((cell, i) =>
            <SheetCell key={i} value={cell} />
        )}</div>
    );
}

function SheetCell({ value }) {
    return (
        <div className="sheet__cell">
            {value}
        </div>
    );
}
