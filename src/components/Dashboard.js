import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import './Dashboard.css';
import ProgressSummary from './ProgressSummary';

const AttendanceAnomalyDetector = () => {
    const [flaggedStudents, setFlaggedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const ABSENCE_THRESHOLD = 3; // Number of absences to trigger a flag

    useEffect(() => {
        const fetchAndAnalyzeData = async () => {
            setLoading(true);

            // 1. Fetch all students
            const studentsSnapshot = await getDocs(collection(db, "students"));
            const students = studentsSnapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data().name;
                return acc;
            }, {});

            // 2. Fetch attendance for the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

            const attendanceQuery = query(
                collection(db, "dailyAttendance"),
                where("date", ">=", sevenDaysAgoTimestamp)
            );
            const attendanceSnapshot = await getDocs(attendanceQuery);

            // 3. Analyze attendance data
            const absenceCounts = {};
            attendanceSnapshot.forEach(doc => {
                const dayLog = doc.data().records;
                for (const studentId in dayLog) {
                    if (dayLog[studentId] === 'Absent') {
                        if (!absenceCounts[studentId]) {
                            absenceCounts[studentId] = 0;
                        }
                        absenceCounts[studentId]++;
                    }
                }
            });

            // 4. Identify flagged students
            const flagged = [];
            for (const studentId in absenceCounts) {
                if (absenceCounts[studentId] >= ABSENCE_THRESHOLD) {
                    flagged.push({
                        id: studentId,
                        name: students[studentId] || 'Unknown Student',
                        absences: absenceCounts[studentId]
                    });
                }
            }

            setFlaggedStudents(flagged);
            setLoading(false);
        };

        fetchAndAnalyzeData();
    }, []);

    if (loading) {
        return <p>Analyzing attendance data...</p>;
    }

    return (
        <div className="anomaly-detector">
            <h3>Attendance Anomaly Detection (Last 7 Days)</h3>
            {flaggedStudents.length > 0 ? (
                <ul>
                    {flaggedStudents.map(student => (
                        <li key={student.id}>
                            <strong>{student.name}</strong> has been absent {student.absences} times.
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No students with anomalous attendance patterns in the last 7 days.</p>
            )}
        </div>
    );
};

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            <AttendanceAnomalyDetector />
            <ProgressSummary />
        </div>
    );
};

export default Dashboard; 