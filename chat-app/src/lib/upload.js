import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../config/firebase';

const upload = async (file) => {
    const storageRef = ref(storage, `images/${Date.now() + file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');

                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                console.error("Ошибка при загрузке файла:", error);
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                }).catch((error) => {
                    console.error("Ошибка при получении URL загрузки:", error);
                    reject(error);
                });
            }
        );
    });
}

export default upload;