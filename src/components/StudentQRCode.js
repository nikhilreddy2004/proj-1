import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";
import { QRCodeSVG } from 'qrcode.react';
import './StudentQRCode.css';

const StudentQRCode = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "students"));
                const studentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setStudents(studentsList);
            } catch (error) {
                console.error("Error fetching students: ", error);
            }
        };

        fetchStudents();
    }, []);

    return (
        <div className="qr-code-container">
            <h2>Student QR Codes</h2>
            <p>Print these codes for students to scan for attendance.</p>
            <div className="qr-code-list">
                {students.map(student => (
                    <div key={student.id} className="qr-code-card">
                        <h4>{student.name}</h4>
                        <QRCodeSVG value={student.id} size={128} />
                        <small>ID: {student.id}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentQRCode; 