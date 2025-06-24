import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, Timestamp, query, orderBy, where } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import './TestScore.css';

const TestScoreDashboard = ({ students }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudentForChart, setSelectedStudentForChart] = useState('');
    const [studentChartData, setStudentChartData] = useState([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [errorChart, setErrorChart] = useState(null);
    const [learningPlan, setLearningPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [errorPlan, setErrorPlan] = useState(null);

    const handleGeneratePlan = async (scoreEntry) => {
        setLoadingPlan(true);
        setErrorPlan(null);
        setLearningPlan(null);

        try {
            const response = await fetch('http://localhost:5001/generate-learning-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: scoreEntry.studentName,
                    subject: scoreEntry.subject,
                    score: scoreEntry.score,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate learning plan from server.');
            }

            const data = await response.json();
            setLearningPlan(data.plan);

        } catch (err) {
            setErrorPlan('Could not generate plan. Please ensure the backend server is running.');
            console.error(err);
        } finally {
            setLoadingPlan(false);
        }
    };

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "testScores"), orderBy("date", "desc"));
                const querySnapshot = await getDocs(q);
                const scoresList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Create a map of student IDs to names for easy lookup
                const studentMap = students.reduce((acc, student) => {
                    acc[student.id] = student.name;
                    return acc;
                }, {});

                // Combine scores with student names
                const combinedScores = scoresList.map(score => ({
                    ...score,
                    studentName: studentMap[score.student_id] || 'Unknown Student',
                    date: score.date.toDate().toLocaleDateString()
                }));
                
                setScores(combinedScores);
            } catch (error) {
                console.error("Error fetching test scores: ", error);
            }
            setLoading(false);
        };

        if (students.length > 0) {
            fetchScores();
        }
    }, [students]);

    useEffect(() => {
        const fetchChartData = async () => {
            if (!selectedStudentForChart) {
                setStudentChartData([]); // Clear data when no student is selected
                return;
            }
            
            setLoadingChart(true);
            setErrorChart(null);

            try {
                const q = query(
                    collection(db, "testScores"), 
                    where("student_id", "==", selectedStudentForChart),
                    orderBy("date", "asc")
                );
                const querySnapshot = await getDocs(q);
                const chartData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        subject: data.subject,
                        score: data.score,
                        date: data.date.toDate().toLocaleDateString()
                    };
                });
                setStudentChartData(chartData);
            } catch (error) {
                console.error("Error fetching chart data: ", error);
                setErrorChart("Could not load scores for this student.");
            } finally {
                setLoadingChart(false);
            }
        };

        fetchChartData();
    }, [selectedStudentForChart]);

    if (loading) {
        return <p>Loading scores...</p>;
    }

    return (
        <div className="score-dashboard">
            <h3>All Test Scores</h3>
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Score</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map(score => (
                        <tr key={score.id}>
                            <td>{score.studentName}</td>
                            <td>{score.subject}</td>
                            <td>{score.score}</td>
                            <td>{score.date}</td>
                            <td>
                                <button 
                                    onClick={() => handleGeneratePlan(score)} 
                                    className="plan-button"
                                    disabled={loadingPlan}
                                >
                                    Generate Plan
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="performance-chart">
                <h3>Student Performance Graph</h3>
                <select onChange={(e) => setSelectedStudentForChart(e.target.value)} value={selectedStudentForChart}>
                    <option value="">-- Select a student --</option>
                    {students.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                </select>

                <div className="chart-area">
                    {!selectedStudentForChart && (
                        <p className="chart-placeholder">Please select a student to view their performance graph.</p>
                    )}
                    {loadingChart && <p>Loading chart...</p>}
                    {errorChart && <p className="chart-error">{errorChart}</p>}
                    
                    {selectedStudentForChart && !loadingChart && !errorChart && studentChartData.length > 0 && (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={studentChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subject" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}

                    {selectedStudentForChart && !loadingChart && !errorChart && studentChartData.length === 0 && (
                        <p className="chart-placeholder">No scores have been recorded for this student yet.</p>
                    )}
                </div>
            </div>

            <div className="learning-plan-section">
                <h3>Personalized Learning Plan</h3>
                {loadingPlan && <p>Generating plan, please wait...</p>}
                {errorPlan && <p className="chart-error">{errorPlan}</p>}
                {learningPlan && (
                    <div className="plan-content">
                        <ReactMarkdown>{learningPlan}</ReactMarkdown>
                    </div>
                )}
                {!learningPlan && !loadingPlan && (
                    <p className="chart-placeholder">Click "Generate Plan" for any test score to create a personalized learning path for the student.</p>
                )}
            </div>
        </div>
    );
};

const TestScore = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [subject, setSubject] = useState('');
    const [score, setScore] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "students"));
                const studentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setStudents(studentsList);
                if (studentsList.length > 0) {
                    setSelectedStudent(studentsList[0].id);
                }
            } catch (error) {
                console.error("Error fetching students: ", error);
            }
        };

        fetchStudents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !subject || !score) {
            alert('Please fill all fields');
            return;
        }

        try {
            await addDoc(collection(db, "testScores"), {
                student_id: selectedStudent,
                subject: subject,
                score: Number(score),
                date: Timestamp.fromDate(new Date())
            });
            alert('Test score submitted!');
            // Clear fields
            setSubject('');
            setScore('');
        } catch (error) {
            console.error("Error adding test score: ", error);
            alert('Error adding test score');
        }
    };

    return (
        <div className="test-score-container">
            <h2>Test Scores</h2>
            
            <div className="score-submission-form">
                <h3>Submit New Score</h3>
                <form onSubmit={handleSubmit}>
                    <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                        {students.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.name}
                            </option>
                        ))}
                    </select>
                    <input 
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    <input 
                        type="number"
                        placeholder="Score"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                    />
                    <button type="submit">Submit Score</button>
                </form>
            </div>

            <hr />

            <TestScoreDashboard students={students} />
        </div>
    );
};

export default TestScore; 