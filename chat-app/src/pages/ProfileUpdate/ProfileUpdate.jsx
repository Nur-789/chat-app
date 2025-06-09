import React, { useContext, useEffect, useState } from 'react'
import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../lib/upload'
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (event) => {
    event.preventDefault();

    if (!uid) {
      toast.error("Ошибка авторизации");
      return;
    }

    if (!name.trim()) {
      toast.error("Введите имя");
      return;
    }

    if (!bio.trim()) {
      toast.error("Введите информацию о себе");
      return;
    }

    setIsLoading(true);

    try {
      const docRef = doc(db, 'users', uid);

      // Обновляем данные профиля
      const updateData = {
        bio: bio.trim(),
        name: name.trim(),
      };

      if (image) {
        try {
          const imgUrl = await upload(image);
          if (!imgUrl) {
            throw new Error("Не удалось загрузить изображение");
          }
          updateData.avatar = imgUrl;
          setPrevImage(imgUrl);
        } catch (error) {
          console.error("Ошибка загрузки изображения:", error);
          toast.error(`Ошибка загрузки изображения: ${error.message}`);
          setIsLoading(false);
          return;
        }
      }

      // Обновляем документ
      await updateDoc(docRef, updateData);

      // Получаем обновленные данные
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setUserData(snap.data());
        toast.success("Профиль успешно обновлен");
        navigate('/chat');
      } else {
        throw new Error("Документ не найден после обновления");
      }
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
      toast.error(`Ошибка обновления профиля: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setUid(user.uid);
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || "");
            setBio(data.bio || "");
            setPrevImage(data.avatar || "");
          } else {
            toast.error("Данные пользователя не найдены");
            navigate('/');
          }
        } catch (error) {
          console.error("Ошибка загрузки данных профиля:", error);
          toast.error("Не удалось загрузить данные профиля");
          navigate('/');
        }
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id='avatar'
              accept='.png, .jpg, .jpeg'
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon}
              alt="Profile"
            />
            upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder='Your name'
            required
          />
          <textarea 
            onChange={(e) => setBio(e.target.value)} 
            value={bio} 
            placeholder='Write profile bio' 
            required
          />
          <button 
            type='submit' 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </form>
        <img 
          className='profile-pic' 
          src={image ? URL.createObjectURL(image) : prevImage || assets.logo_icon} 
          alt="Profile Preview" 
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
