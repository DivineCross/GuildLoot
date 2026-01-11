import { useState } from 'react';
import { sheetNames } from './mock';

export default function SheetNav() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="sheet-nav">{sheetNames.map((x, i) =>
            <SheetNavItem
                key={i}
                label={x}
                isActive={i == activeIndex}
                onClick={() => setActiveIndex(i)} />
        )}</div>
    );
};

function SheetNavItem({ label, isActive, onClick }) {
    const activeClass = isActive ? ' sheet-nav__item--active' : '';

    return (
        <div className={`sheet-nav__item${activeClass}`} onClick={onClick}>
            <span>{label}</span>
        </div>
    );
}
