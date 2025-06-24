import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import './ProgressSummary.css';

const ProgressSummary = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch all students for the dropdown
    useEffect(() => {
        const fetchStudents = async () => {
            const studentsSnapshot = await getDocs(collection(db, "students"));
            const studentList = studentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setStudents(studentList);
        };
        fetchStudents();
    }, []);

    const handleGenerateSummary = async () => {
        if (!selectedStudentId) {
            setError('Please select a student.');
            return;
        }
        setLoading(true);
        setSummary('');
        setError('');

        try {
            // 1. Fetch recent test scores
            const scoresQuery = query(
                collection(db, "testScores"),
                where("studentId", "==", selectedStudentId)
            );
            const scoresSnapshot = await getDocs(scoresQuery);
            const scores = scoresSnapshot.docs.map(doc => doc.data());

            // 2. Fetch recent attendance
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

            const attendanceQuery = query(
                collection(db, "dailyAttendance"),
                where("date", ">=", sevenDaysAgoTimestamp)
            );
            const attendanceSnapshot = await getDocs(attendanceQuery);
            let present = 0;
            let absent = 0;
            attendanceSnapshot.forEach(doc => {
                const record = doc.data().records[selectedStudentId];
                if (record === 'Present') present++;
                else if (record === 'Absent') absent++;
            });

            // 3. Call our backend server
            const response = await fetch('http://localhost:5001/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: students.find(s => s.id === selectedStudentId)?.name,
                    scores,
                    attendance: { present, absent }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch summary from server.');
            }

            const data = await response.json();
            setSummary(data.summary);

        } catch (err) {
            setError('Could not generate summary. Please ensure the backend server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="progress-summary">
            <h3>AI-Powered Student Progress Summary</h3>
            <div className="summary-controls">
                <select 
                    value={selectedStudentId} 
                    onChange={e => setSelectedStudentId(e.target.value)}
                >
                    <option value="">Select a Student</option>
                    {students.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                </select>
                <button onClick={handleGenerateSummary} disabled={loading || !selectedStudentId}>
                    {loading ? 'Generating...' : 'Generate Summary'}
                </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            {summary && (
                <div className="summary-result">
                    <h4>Summary Report:</h4>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
};

export default ProgressSummary; 