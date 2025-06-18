import { ethers } from "ethers";
import { type Resident } from "../../services/Web3Service";

type Props = {
    data: Resident;
    onDelete: Function;
}

/**
 * props:
 *  - data
 * - onDelete
 */
function ResidentRow(props: Props) {

    function getNextPayment() {
        let dateMs = 0;

        if(props.data.nextPayment)
            dateMs = ethers.toNumber(props.data.nextPayment) * 1000;
            
        const text = !dateMs ? "Never Payed" : new Date(dateMs).toDateString();
        let color = "text-success";

        if (!dateMs || dateMs < Date.now())
            color = "text-danger";
        return (

            <p className={"text-xs mb-0 ms-3 " + color}>
                {text}
            </p>
        )
    }

    function btnDeleteClick() {
        if (window.confirm("Are you sure to delete this resident?"))
            props.onDelete(props.data.wallet);
    }

    return (
        <tr>
            <td>
                <div className="d-flex px-3 py-1">
                    <div className="d-flex flex-column justify-content-center">
                        <h6 className="mb-0 text-sm">{props.data.wallet}</h6>
                    </div>
                </div>
            </td>
            <td>
                <p className="text-xs font-weight-bold mb-0 px-3">{ethers.toBigInt(props.data.residence).toString()}</p>
            </td>
            <td>
                <p className="text-xs font-weight-bold mb-0 px-3">{JSON.stringify(props.data.isCounselor)}</p>
            </td>
            <td>
                {getNextPayment()}
            </td>
            <td>
                {
                    <></>
                }
            </td>
        </tr>
    )
}

export default ResidentRow;