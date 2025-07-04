import type { Category } from "../services/Web3Service";

type Props = {
    value: Category;
    onchange: (e: { target: { id: string; value: Category } }) => void;
    disabled?: boolean;
}

/**
 * 
 * props:
 * - Value;
 * - Onchange;
 * - disabled;
 */

function TopicCategory(props: Props){
    
    function onCategoryChange(evt: React.ChangeEvent<HTMLSelectElement>) {
        if (!evt.target.value) return;
        props.onchange({ target: { id: "category", value: Number(evt.target.value) as Category } });
    }


    return (

<select
    id="category"
    className="form-select px-3"
    value={String(props.value)}
    onChange={onCategoryChange}
    disabled={props.disabled}
>
            <option value="">Select...</option>
            <option value="0">Decision</option>
            <option value="1">Spent</option>
            <option value="2">Change Quota</option>
            <option value="3">Change Manager</option>
        </select>

    )


}
export default TopicCategory;