import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doLogin } from '../services/Web3Service'

function Login() {

  const navigate = useNavigate();

  const [message, setMessage] = useState<string>("");

  function btnLoginClick() {
    doLogin()
      .then(result => navigate("/topics"))
      .catch(err => setMessage(err.message));
  }

  return (
    <main className="main-content  mt-0">
      <div className="page-header align-items-start min-vh-100" style={{backgroundImage: `url('/background.jpg')`}}>
        <span className="mask bg-gradient-dark opacity-6"></span>
        <div className="container my-auto">
          <div className="row">
            <div className="col-lg-4 col-md-8 col-12 mx-auto">
              <div className="card z-index-0 fadeIn3 fadeInBottom">
                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                  <div className="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1">
                    <h4 className="text-white font-weight-bolder text-center mt-2 mb-0">Banco Comunidade V1.0</h4>
                    
                  </div>
                </div>
                <div className="card-body">
                  <form role="form" className="text-start">
                    <div className='text-center'>
                      <img src="/logo192.png" alt='Banco Comunidade logo' />
                    </div>
                    <div className="text-center">
                      <button type="button" className="btn bg-gradient-primary w-100 my-4 mb-2" onClick={btnLoginClick}>
                        <img src="/assets/metamask.svg" alt="Metamask Logo" width="48" className="me-2" />Sign in With Metamask</button>
                    </div>
                    <p className="mt-4 text-sm text-center text-danger">
                      {message}
                    </p>
                    <p className="mt-4 text-sm text-center">
                      Don't have an account? Ask to the
                      <a href="mailto:thiagodp@bnb.gov.br" className="text-primary text-gradient font-weight-bold ms-2">Agente</a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login;
