import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SwitchInput from "../../components/SwitchInput";
import { Category, doLogout, getTopic, isManager, isResident, Profile, Status, type Topic } from "../../services/Web3Service";
import Loader from "../../components/Loader";
import TopicCategory from "../../components/TopicCategory";


function TopicPage(){

    const navigate = useNavigate();

    let { title } = useParams();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [topic, setTopic] = useState<Topic>({} as Topic);

//    useEffect(() => {
//        console.log("🟣 Estado atualizado:", resident);
//    }, [resident]);


    useEffect(() => {
        if (title){
            setIsLoading(true);
            getTopic(title)
               .then(topic => setTopic(topic))
                .catch(err => {
                    setMessage(err.message);
                    setIsLoading(false);
                });      
        }
    },[title])

    function onTopicChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setTopic(prevState => ({ ...prevState, [evt.target.id]: evt.target.value }));
    }

    function btnSaveClick(){
        
        if(topic){
            /*
            setMessage("Connecting to wallet...wait...");
            if (!wallet) {
                const promiseBlockchain = addResident(resident.wallet, resident.residence);
                const promiseBackend = addApiResident({...apiResident, profile: Profile.RESIDENT, wallet: resident.wallet });
                Promise.all([promiseBlockchain, promiseBackend])
                    .then(results => navigate("/residents?tx=" + results[0].hash))
                    .catch(err => setMessage(err.message));
            }
            else { 
                const profile = resident.isCounselor ? Profile.COUNSELOR : Profile.RESIDENT;
                const promises = [];
                if (apiResident.profile !== profile){
                    promises.push(setCounselor(resident.wallet, resident.isCounselor));
                }

                promises.push(updateApiResident(wallet, {...apiResident, profile, wallet}));
                Promise.all(promises)
                    .then(results => navigate("/residents?tx=" + wallet))
                    .catch(err => setMessage(err.message));
 
            }*/
        }
    }
/*
    function getNextPayment() {
        const timestamp = typeof resident.nextPayment === "bigint"
        ? Number(resident.nextPayment) * 1000
        : resident.nextPayment * 1000;

        if (!timestamp) return "Inadimplente";
        return new Date(timestamp).toDateString();
    }

    function getNextPaymentClass() {
        let className = "input-group input-group-outline ";
        const timestamp = typeof resident.nextPayment === "bigint"
        ? Number(resident.nextPayment) * 1000
        : resident.nextPayment * 1000;

        if (!timestamp || timestamp < Date.now()) return className + "is-invalid";
        return className + "is-valid";
    }
*/

    function getStatus() : string {
        switch(topic.status){
            case Status.APPROVED: return "APPROVED";
            case Status.DENIED: return "DENIED";
            case Status.DELETED: return "DELETED";
            case Status.SPENT: return "SPENT";
            default: return "IDLE"
        }
    }

    function showResponsible() : boolean {
        return [Category.SPENT, Category.CHANGE_MANAGER].includes(topic.category)
    }

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
                                <i className="material-icons opacity-10 me-2">interests</i>
                                {title ? "Edit " : "New "} Topic</h6>
                        </div>
                        </div>
                        <div className="card-body px-0 pb-2">
                            {
                                isLoading
                                ? <Loader />    
                                : <></>    
                            }
                            
                            <div className='row ms-3'>
                                <div className='col-md-6 mb-3'>
                                    <div className='form-group'>
                                        <label htmlFor='title'>Title:</label>
                                        <div className='input-group input-group-outline'>
                                            <input className='form-control' type="text" id="title" value={topic.title || ""} placeholder="Would be great..." onChange={onTopicChange} disabled={!!title}></input>
                                        </div>
                                    </div>
                                </div>    
                            </div>
                            <div className='row ms-3'>
                                <div className='col-md-6 mb-3'>
                                    <div className='form-group'>
                                        <label htmlFor='description'>Description:</label>
                                        <div className='input-group input-group-outline'>
                                            <input className='form-control' type="number" id="description" value={topic.description || ""} placeholder="..." onChange={onTopicChange} disabled={!!title && topic.status !== Status.IDLE}></input>
                                        </div>
                                    </div>
                                </div>    
                            </div>
                            {
                                title
                                    ? (
                                        <div className='row ms-3'>
                                            <div className='col-md-6 mb-3'>
                                                <div className='form-group'>
                                                    <label htmlFor='status'>Status:</label>
                                                    <div className='input-group input-group-outline'>
                                                        <input className='form-control' type="text" id="status" value={getStatus()} disabled={true}></input>
                                                    </div>
                                                </div>
                                            </div>    
                                        </div>
                                    ) 
                                    : <></>    
                            }                            
                            <div className='row ms-3'>
                                <div className='col-md-6 mb-3'>
                                    <div className='form-group'>
                                        <label htmlFor='category'>Category:</label>
                                        <div className='input-group input-group-outline'>
                                            <TopicCategory value={topic.category} onchange={onTopicChange} disabled={!!title}/>
                                        </div>
                                    </div>
                                </div>    
                            </div>                            
                            {
                                showResponsible()
                                ? (
                            <div className='row ms-3'>
                                <div className='col-md-6 mb-3'>
                                    <div className='form-group'>
                                        <label htmlFor='responsible'>Responsible:</label>
                                        <div className='input-group input-group-outline'>
                                            <input className='form-control' type="text" id="responsible" value={topic.responsible || ""} placeholder="0x00..." onChange={onTopicChange} disabled={!!title && topic.status !== Status.IDLE}></input>
                                        </div>
                                    </div>
                                </div>    
                            </div>                            
                                )
                                : <></>
                            }    
                           {
                                wallet
                                ? (
                                            <div className='row ms-3'>
                                        <div className='col-md-6 mb-3'>
                                            <div className='form-group'>
                                                <label htmlFor='nextPayment'>Next Payment:</label>
                                                <div className={getNextPaymentClass()}>
                                                    <input className='form-control' type="text" id="nextPayment" value={getNextPayment()} disabled={true}></input>
                                                </div>
                                            </div>
                                        </div>    
                                    </div>
                                )
                                :<></>
                            }
                            {
                                isManager() && wallet
                                ? (
                                    <div className='row ms-3'>
                                        <div className='col-md-6 mb-3'>
                                            <div className='form-group'>
                                                <SwitchInput id="isCounselor" isChecked={resident.isCounselor} text="Is Counselour?" onChange={onResidentChange}/>
                                            </div>
                                        </div>    
                                    </div>
                                )
                                : <></>
                            }
                            

                            <div className='row ms-3'>
                                <div className='col-md-12 mb-3'>
                                <button className='btn bg-gradient-dark me-2' onClick={btnSaveClick}>
                                    <i className="material-icons opacity-10 me-2">save</i>
                                    Save Topic    
                                </button>                                    
                                <span className='text-danger'>
                                    {message}
                                </span>
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

export  default TopicPage;