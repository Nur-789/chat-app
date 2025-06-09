import React, { useContext, useEffect, useState } from 'react'
import "./LeftSidebar.css"
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../config/firebase'

const LeftSidebar = () => {

    const navigate = useNavigate();
    const {userData, chatsData, chatUser, setChatUser, messagesId, setMessagesId, chatVisible, setchatVisible,} = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);
                if(!querySnap.empty && querySnap.docs[0].data().id !== userData.id){
                    let userExist = false
                    chatsData.map((user)=>{
                        if (user.rId === querySnap.docs[0].id) {
                            userExist = true;
                        }
                    })
                    if (!userExist) {
                        setUser(querySnap.docs[0].data());
                    }
                }
                else {
                    setUser(null);
                }
            }
            else {
                setShowSearch(false);
            }
        } catch (error) {
            toast.error("Ошибка при поиске пользователя");
            console.error("Ошибка поиска:", error);
        }
    }

    const addChat = async () => {
        const messagesRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");
        try {
            const newMessageRef = doc(messagesRef);
            await setDoс(newMessageRef,{
                createAt: serverTimestamp(),
                messages: []
            })

            await updateDoc(doc(chatsRef,user.id),{
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updateAt: Date.now(),
                    messageSeen: true
                })
            })

            await updateDoc(doc(chatsRef,userData.id),{
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updateAt: Date.now(),
                    messageSeen: true
                })
            })

            const uSnap = await getDoc(doc(db, "users", user.id));
            const uData = uSnap.data();
            setChat({
                messagesId:newMessageRef.id,
                lastMessage:"",
                rId:user.id,
                updateAt:Date.now(),
                messageSeen:true,
                userData: uData
            })
            setShowSearch(false)
            setchatVisible(true)
        } catch (error) {
            toast.error(error.message);
            console.error(error)
        }
    }

    
    const upload = async (file) => {
        try {
            const storageRef = ref(storage, `images/${Date.now()}${file.name}`);
            const uploadTask = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadTask.ref);
            return downloadURL;
        } catch (error) {
            console.error("Ошибка загрузки файла:", error);
            if (error.code === 'storage/cors-error') {
                toast.error("Ошибка CORS при загрузке файла");
            } else {
                toast.error("Ошибка при загрузке файла");
            }
            throw error;
        }
    };

    const setChat = async (item) => {
        try {
        setMessagesId(item.messageId);
        setChatUser(item);
        const userChatsRef = doc(db, 'chats', userData.id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId === item.messageId);
        userChatsData.chatsData[chatIndex].messageSeen = true;
        await updateDoc(userChatsRef, {
            chatsData: userChatsData.chatsData
        })
        setchatVisible(true);
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{

        const updateChatUserData = async () => {
            if (chatUser) {
                const userRef = doc(db, "users", chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev=>({...prev,userData:userData}))
            }
        }
        updateChatUserData();

    },[chatsData])

  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
        <div className="ls-top">
            <div className="ls-nav">
                <img src={assets.logo} className='logo' alt="" />
                <div className="menu">
                    <img src={assets.menu_icon} alt="" />
                    <div className="sub-menu">
                        <p onClick={()=>navigate('/profile')}>Edit Profile</p>
                        <hr />
                        <p>Logout</p>
                    </div>
                </div>
            </div>
            <div className="ls-search">
                <img src={assets.search_icon} alt="" />
                <input onChange={inputHandler} type="text" placeholder='Search here..'/>
            </div>
        </div>
        <div className="ls-list">
            {showSearch && user
            ? <div onClick={addChat} className="friends add-user">
                <img src={user.avatar} alt="" />
                <p>{user.name}</p>
            </div>
            :chatsData && Array.isArray(chatsData) ? chatsData.map((item, index)=>(
                <div onClick={()=>setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
                    <img src={item?.userData?.avatar || ""} alt="" />
                    <div className="">
                        <p>{item?.userData?.name || "Ошибка: нет имени"}</p>
                        <span>{item?.lastMessage || "Нет сообщений"}</span>
                    </div>
                </div>
            )) : <div className="error">Ошибка загрузки чатов</div>
            }
        </div>
    </div>
  )
}

export default LeftSidebar