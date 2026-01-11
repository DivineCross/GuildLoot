import { sheetNames } from './mock';

export default function SheetNav() {
    return (
        <div className="sheet-nav">
            {sheetNames.map((x, i) =>
                <SheetNavItem key={i} label={x} isActive={i == 0} />
            )}
        </div>
    );
};

function SheetNavItem({ label, isActive }) {
    return (
        <div className={`sheet-nav__item${isActive ? " sheet-nav__item--active" : ""}`}>
            <span>{label}</span>
        </div>
    );
}
