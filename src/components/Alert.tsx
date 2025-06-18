
type Props = {
    title: string;
    text: string;
    materialIcon: string;
    alertClass: string;
}

/**
 * 
 * Props:
 * - title
 * - text
 * - materialIcon
 * - alertClass 
 */ 

function Alert(props: Props){

    return(
    <div className={"alert alert-dismissible text-white fade show mx-3 " + props.alertClass} role="alert">
        {
            props.materialIcon
                ? (
                <span className="alert-icon align-middle me-2">
                    <span className="material-symbols-rounded text-md">
                        {props.materialIcon}
                    </span>
                </span>
            )
            : <></>
        }
        
        
        <span className="alert-text"><strong>{props.title}</strong> {props.text} </span>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>        
    )
}
export default Alert;