// https://www.youtube.com/watch?v=gbocZlm71nE  //5:34:30 //2つ違います

import React, { useContext, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Chat from './pages/Chat/Chat'
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { AppContext } from './context/AppContext'

const App = () => {

  const navigate = useNavigate();
  const {loadUserData} = useContext(AppContext);

  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, async (user)=>{
      try {
        if (user) {
          navigate('/chat')
          await loadUserData(user.uid)
        }
        else{
          navigate('/')
        }
      } catch (error) {
        console.error("Ошибка при проверке состояния аутентификации:", error);
        toast.error("Произошла ошибка при проверке авторизации");
      }
    });

    return () => unsubscribe();
  },[]);

  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<ProfileUpdate />} />
      </Routes>
    </>
  )
}

export default App 