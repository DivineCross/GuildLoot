interface Props {
    names: string[];
    activeName: string;
    onSelect: (name: string) => void;
}
export default function SheetNav({ names, activeName, onSelect }: Props) {
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

interface ItemProps {
    name: string;
    isActive: boolean;
    onSelect: (name: string) => void;
}
function SheetNavItem({ name, isActive, onSelect }: ItemProps) {
    const activeClass = isActive ? ' sheet-nav__item--active' : '';

    return (
        <div
            className={`sheet-nav__item${activeClass}`}
            onClick={() => onSelect(name)}>
            <span>{name}</span>
        </div>
    );
}
