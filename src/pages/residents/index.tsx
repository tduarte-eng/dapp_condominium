import { useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import Alert from "../../components/Alert";
import ResidentRow from "./ResidentRow"; 
import { type Resident, getResidents } from "../../services/Web3Service";


function Residents(){

    const [residents, setResidents] = useState<Resident[]>();
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);


    function useQuery(){
        return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();

    useEffect(() => {
        setIsLoading(true);
        getResidents(1,10)
            .then(result => {
                setResidents(result.residents);
                setIsLoading(false);
                console.log(result);
            })
            .catch(err => {
                console.log("ERRO NO CATCH");
                setIsLoading(false);
                setError(err.message);
            })
        const tx = query.get("tx");
        if(tx) {
            setMessage("Your Transaction is being processed.");
        }
    }, [])

    return (
        <>
        <Sidebar />
        <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
            <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                <div className="card my-4">
                    <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                    <div className="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                        <h6 className="text-white text-capitalize ps-3">
                            <i className="material-icons opacity-10 me-2">group</i>    
                                Residents
                        </h6>
                    </div>
                    </div>
                    <div className="card-body px-0 pb-2">
                        {
                            message
                                ? <Alert alertClass="alert-success" materialIcon='thumb_up_off_alt' title="Sucess!" text={message} />
                                : <></>
                        }
                        {
                            error
                                ? <Alert alertClass="alert-danger" materialIcon="error" title="Error!" text={error} />
                                : <></>
                        }
                        {
                        isLoading
                        ? (
                            <div className='row ms-3'>
                                <div className='col-md-6 mb-3'>
                                    <p>
                                        <i className="material-icons opacity-10 me-2">hourglass_empty</i>
                                        Loading...                                    
                                    </p>
                                </div>    
                            </div>
                        )    
                        : <></>    
                        }                        
                    <div className="table-responsive p-0">
                        <table className="table align-items-center mb-0">
                        <thead>
                            <tr>
                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Carteira</th>
                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Residência</th>
                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Is Counselor?</th>
                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Next Payment</th>
                            <th className="text-secondary opacity-7"></th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                        residents && residents.length 
                            ? residents.map(resident => <ResidentRow data={resident} onDelete={(wallet: string) => alert(wallet)} />)
                            : <></>
                        }
                        </tbody>
                        </table>
                    </div>
                        <div className='row ms-3'>
                            <div className='col-md-12 mb-3'>
                                <a className='btn bg-gradient-dark me-2' href="/residents/new">
                                <i className="material-icons opacity-10 me-2">add</i>
                                    Add New Resident    
                                </a>                                    
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <Footer />
            </div>
        </main>
        </>
    )

}

export default Residents;