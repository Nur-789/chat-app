import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

const upload = async (file) => {
    if (!file) {
        throw new Error("Файл не выбран");
    }

    try {
        // Проверка размера файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Файл слишком большой. Максимальный размер: 5MB");
            return null;
        }

        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            toast.error("Пожалуйста, загрузите изображение");
            return null;
        }

        // Создаем уникальное имя файла
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `images/${fileName}`);

        // Метаданные файла
        const metadata = {
            contentType: file.type
        };

        // Загружаем файл
        const snapshot = await uploadBytes(storageRef, file, metadata);
        
        // Получаем URL загруженного файла
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Файл успешно загружен:', downloadURL);
        
        return downloadURL;
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        throw error;
    }
};

export default upload;