import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Curriculum.css';

const Curriculum = () => {
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [file, setFile] = useState(null);
    const [curriculum, setCurriculum] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchCurriculum = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "curriculum"));
            const curriculumList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCurriculum(curriculumList);
        } catch (error) {
            console.error("Error fetching curriculum: ", error);
        }
    };

    useEffect(() => {
        fetchCurriculum();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !grade || !file) {
            alert('Please fill all fields and select a file');
            return;
        }

        setUploading(true);

        try {
            // Upload file to Firebase Storage
            const storageRef = ref(storage, `curriculum/${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Add metadata to Firestore
            await addDoc(collection(db, "curriculum"), {
                subject: subject,
                grade: grade,
                file_url: downloadURL,
                file_name: file.name,
                uploaded_at: new Date()
            });

            alert('Curriculum uploaded!');
            // Clear fields
            setSubject('');
            setGrade('');
            setFile(null);
            document.getElementById('file-input').value = null;

            fetchCurriculum(); // Refresh list
        } catch (error) {
            console.error("Error uploading curriculum: ", error);
            alert('Error uploading curriculum');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="curriculum-container">
            <h2>Curriculum Library</h2>
            
            {/* The curriculum upload form is disabled since Firebase Storage is not enabled. */}
            <div className="curriculum-form-disabled">
                <h3>Upload New Material</h3>
                <p><i>File upload is currently disabled because the Firebase Storage service has not been enabled for this project.</i></p>
            </div>

            <div className="curriculum-list">
                <h3>Available Materials</h3>
                <div className="cards-container">
                    {curriculum.map(item => (
                        <div key={item.id} className="curriculum-card">
                            <h4>{item.subject} - Grade {item.grade}</h4>
                            <p>{item.file_name}</p>
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer">Download</a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Curriculum; 