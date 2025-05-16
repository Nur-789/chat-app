import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useState, useEffect } from "react";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { toast } from 'react-toastify';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);

    const loadUserData = async (uid) => {
        let currentIntervalId = null;
        
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                throw new Error("Пользователь не найден");
            }
            const userData = userSnap.data();
            setUserData(userData);
            if (userData.avatar && userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }
            
            currentIntervalId = setInterval(async () => {
                if (auth.currentUser) {
                    try {
                        await updateDoc(userRef, {
                            lastSeen: Date.now()
                        });
                    } catch (error) {
                        console.error("Ошибка при обновлении lastSeen:", error);
                    }
                } else {
                    clearInterval(currentIntervalId);
                }
            }, 60000);

            setIntervalId(currentIntervalId);
        } catch (error) {
            console.error("Ошибка загрузки данных пользователя:", error);
            toast.error("Не удалось загрузить данные пользователя");
        }
    }

    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                if (!res.exists()) {
                    console.error("Чаты не найдены");
                    return;
                }
                const chatItems = res.data().chatData; // Исправлено: chatsData на chatData
                const tempData = [];
                for (const item of chatItems) {
                    const userRef = doc(db, 'users', item.rId);
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) {
                        console.error(`Пользователь с ID ${item.rId} не найден`);
                        continue;
                    }
                    const userData = userSnap.data();
                    tempData.push({ ...item, userData });
                }
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
            });
            return () => {
                unSub();
            }
        }
    }, [userData]);

    useEffect(() => {
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages,setMessages,
        messagesId,setMessagesId,
        chatUser,setChatUser,
        chatVisible,setChatVisible,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider