import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import QRScanner from './QRScanner';
import './Attendance.css';

const Attendance = () => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "students"));
                const studentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setStudents(studentsList);
                // Initialize attendance state
                const initialAttendance = {};
                studentsList.forEach(student => {
                    initialAttendance[student.id] = 'Absent'; // Default to Absent
                });
                setAttendance(initialAttendance);
            } catch (error) {
                console.error("Error fetching students: ", error);
            }
        };

        fetchStudents();
    }, []);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        const date = new Date();
        const attendanceLog = {
            date: Timestamp.fromDate(date),
            records: attendance
        };
        
        try {
            // This is a simplified log. A real app might store this differently.
            // For example, one document per student per day in attendanceLogs.
            // But for the MVP, one doc per day with all statuses is ok.
            await addDoc(collection(db, "dailyAttendance"), attendanceLog);
            alert('Attendance submitted for ' + date.toLocaleDateString());
        } catch (error) {
            console.error("Error submitting attendance: ", error);
            alert('Error submitting attendance.');
        }
    };

    const handleScanSuccess = (studentId) => {
        // Check if the scanned ID is a valid student
        if(attendance.hasOwnProperty(studentId)) {
            handleStatusChange(studentId, 'Present');
            alert(`Marked student as Present!`);
        } else {
            alert('Invalid QR Code: Student not found.');
        }
        setIsScanning(false);
    };

    return (
        <div className="attendance-container">
            <h2>Mark Attendance</h2>

            {isScanning ? (
                <QRScanner onScanSuccess={handleScanSuccess} />
            ) : (
                <>
                    <button onClick={() => setIsScanning(true)} className="scan-qr-btn">Scan QR Code</button>
                    <div className="student-list">
                        {students.map(student => (
                            <div key={student.id} className="student-row">
                                <span>{student.name} ({student.class})</span>
                                <div className="attendance-buttons">
                                    <button 
                                        className={attendance[student.id] === 'Present' ? 'present active' : 'present'}
                                        onClick={() => handleStatusChange(student.id, 'Present')}>
                                        Present
                                    </button>
                                    <button 
                                        className={attendance[student.id] === 'Absent' ? 'absent active' : 'absent'}
                                        onClick={() => handleStatusChange(student.id, 'Absent')}>
                                        Absent
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="submit-attendance" onClick={handleSubmit}>Submit Attendance</button>
                </>
            )}
        </div>
    );
};

export default Attendance; 