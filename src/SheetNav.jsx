export default function SheetNav({ names = [], activeName = '', onSelect }) {
    return (
        <div className="sheet-nav">{names.map((name, i) =>
            <SheetNavItem
                key={i}
                name={name}
                isActive={name == activeName}
                onSelect={onSelect} />
        )}</div>
    );
};

function SheetNavItem({ name = '', isActive = false, onSelect }) {
    const activeClass = isActive ? ' sheet-nav__item--active' : '';

    return (
        <div
            className={`sheet-nav__item${activeClass}`}
            onClick={() => onSelect(name)}>
            <span>{name}</span>
        </div>
    );
}
