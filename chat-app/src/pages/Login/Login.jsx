import React, { useState } from 'react'
import "./Login.css"
import assets from '../../assets/assets'
import { signup, login, resetPass } from '../../config/firebase'
import { toast } from 'react-toastify';

const Login = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currState === "Sign Up") {
        await signup(userName, email, password);
        toast.success("Аккаунт успешно создан!");
      } else {
        await login(email, password);
        toast.success("Успешный вход в систему!");
      }
    } catch (error) {
      console.error("Ошибка аутентификации:", error);
      toast.error(`Ошибка: ${error.message}`);
    }
  }

  return (
    <div className='login'>
        <img src={assets.logo_big} alt="" className='logo' />
        <form onSubmit={onSubmitHandler} className="login-form">
          <h2>{currState}</h2>
          {currState === "Sign Up" ? <input onChange={(e) => setUserName(e.target.value)} value={userName} type="text" placeholder='Username' className="form-input" required /> : null}
          <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder='Email address' className="form-input" required />
          <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder='Password' className="form-input" required />
          <button type='submit'>{currState === "Sign Up" ? "Create Account" : "Login Now"}</button>
          <div className="login-term">
            <input type="checkbox" />
            <p>Agree to the terms of use & privacy policy.</p>
          </div>
          <div className="login-forgot">
            {
              currState === "Sign Up"
                ? <p className="login-toggle">Already have an account <span onClick={() => setCurrState("Login")}>login here</span></p>
                : <p className="login-toggle">Create an account <span onClick={() => setCurrState("Sign Up")}>click here</span></p>
            }
            {currState === "Login" ? <p className="login-toggle">Forgot Password? <span onClick={() => resetPass(email)}>reset here</span></p> : null}
          </div>
        </form>
    </div>
  )
}

export default Login