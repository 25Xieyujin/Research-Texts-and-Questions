import React, { useState, useEffect } from 'react';
import { auth, db, signIn, logOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { TEXTS, QUESTIONS } from './constants';
import { 
  Assessment, 
  Demographics, 
  TextContent, 
  Scores, 
  Question,
  Answer 
} from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Brain,
  ShieldCheck,
  Zap,
  Info,
  X,
  Ghost,
  Target,
  FileText,
  BarChart3,
  Clock,
  Download,
  Trash2
} from 'lucide-react';
import { cn } from './lib/utils';

const ADMIN_EMAIL = "xyujin674@gmail.com";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [step, setStep] = useState<'welcome' | 'demographics' | 'questionnaire' | 'admin'>('welcome');
  const [loading, setLoading] = useState(false);
  
  // Assessment State
  const [demographics, setDemographics] = useState<Demographics>({ age: '', gender: '', raceEthnicity: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(new Array(QUESTIONS.length).fill(null).map(() => ({ value: null, reason: '' })));
  const [adminResults, setAdminResults] = useState<Assessment[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const textContent = TEXTS.find(t => t.id === currentQuestion.textId) || TEXTS[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const email = user.email?.toLowerCase().trim();
      if (email === ADMIN_EMAIL.toLowerCase().trim()) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminResults = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'assessments'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assessment));
      setAdminResults(results);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'assessments', id));
      setAdminResults(prev => prev.filter(res => res.id !== id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting assessment:", error);
      setErrorMessage("Failed to delete result.");
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = () => {
    setStep('demographics');
  };

  const handleAdminClick = async () => {
    if (!user) {
      await handleSignIn();
    } else if (isAdmin) {
      setStep('admin');
      fetchAdminResults();
    } else {
      setErrorMessage("Access denied. Only the administrator can view results.");
    }
  };

  const handleDemographicsSubmit = () => {
    setStep('questionnaire');
  };

  const handleAnswer = (value: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = { ...newAnswers[currentQuestionIndex], value };
    setAnswers(newAnswers);
  };

  const handleReason = (reason: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = { ...newAnswers[currentQuestionIndex], reason };
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const calculateScores = (userAnswers: Answer[]): { scores: Scores, total: number, level: 'Developing' | 'Proficient' | 'Advanced' } => {
    let correctCount = 0;
    
    QUESTIONS.forEach((q, i) => {
      const userAnswer = userAnswers[i].value;
      if (q.type === 'MC') {
        if (userAnswer === q.correctAnswer) correctCount++;
      } else if (q.type === 'CLICK_SENTENCE') {
        const correct = q.correctAnswer as string[];
        if (Array.isArray(userAnswer) && userAnswer.length === correct.length && userAnswer.every(v => correct.includes(v))) {
          correctCount++;
        }
      } else if (q.type === 'CLICK_PAIR') {
        const correct = q.correctAnswer as string[];
        if (Array.isArray(userAnswer) && userAnswer.length === 2 && userAnswer.every(v => correct.includes(v))) {
          correctCount++;
        }
      }
    });

    const total = Math.round((correctCount / QUESTIONS.length) * 100);
    let level: 'Developing' | 'Proficient' | 'Advanced' = 'Developing';
    if (total >= 80) level = 'Advanced';
    else if (total >= 60) level = 'Proficient';

    return { 
      scores: { L1: total, L2: total, L3: total, L4: total }, 
      total, 
      level 
    };
  };

  const submitAssessment = async () => {
    setLoading(true);

    const { scores, total, level } = calculateScores(answers);

    // For multi-text assessments, we might want to record which texts were involved.
    // For now, we'll just use the first text's ID or a generic one if multiple.
    const assessment: Assessment = {
      userId: user?.uid || `anon_${Date.now()}`,
      textId: 'multi-text-assessment',
      textVersion: 'A',
      answers,
      scores,
      totalScore: total,
      thinkingLevel: level,
      submittedAt: Timestamp.now(),
      demographics
    };

    try {
      await addDoc(collection(db, 'assessments'), assessment);
      setShowSuccessModal(true);
    } catch (error) {
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          emailVerified: auth.currentUser?.emailVerified,
          isAnonymous: auth.currentUser?.isAnonymous,
        },
        operationType: 'create',
        path: 'assessments'
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
      setErrorMessage("Submission failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cheat = () => {
    setAnswers([
      { value: 1, reason: '' },
      { value: 1, reason: '' },
      { value: ['4'], reason: 'Missing quantitative data.' },
      { value: ['3', '5'], reason: 'Logical jump between problem and intervention.' },
      { value: ['2'], reason: 'Omitted key information about cause.' },
      { value: 1, reason: '' },
      { value: 1, reason: '' },
      { value: ['7', '8'], reason: 'No specific data provided for hardship.' },
      { value: ['4', '5'], reason: 'Missing step about blocking sunlight.' },
      { value: ['4'], reason: 'Omitted volcano name and date.' }
    ]);
    setStep('questionnaire');
    setCurrentQuestionIndex(9);
  };

  const exportToCSV = () => {
    const headers = [
      "ID", "Date", "UserID", "Age", "Gender", "Ethnicity", 
      "TotalScore", "Level"
    ];
    
    // Add dynamic headers for each question
    QUESTIONS.forEach((_, idx) => {
      headers.push(`Q${idx + 1}_Value`, `Q${idx + 1}_Reason`);
    });
    
    const rows = adminResults.map(res => {
      const row = [
        res.id,
        res.submittedAt?.toDate().toISOString(),
        res.userId,
        res.demographics.age,
        res.demographics.gender,
        res.demographics.raceEthnicity,
        res.totalScore,
        res.thinkingLevel
      ];
      
      // Map all answers, even if the assessment had fewer questions than current QUESTIONS array
      // (though in this app they should match)
      res.answers.forEach(ans => {
        row.push(Array.isArray(ans.value) ? ans.value.join("|") : ans.value);
        row.push(ans.reason || "N/A");
      });
      
      return row;
    });

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `critical_thinking_results_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Views ---

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8 relative group">
            <Brain size={40} />
            <button 
              onClick={cheat}
              className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-indigo-400"
              title="Cheat Mode (Dev Only)"
            >
              <Ghost size={16} />
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Critical Thinking Assessment</h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Evaluate your critical thinking skills by analyzing a text on Refeeding Syndrome.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={startAssessment}
              className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group"
            >
              Start Assessment <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleAdminClick}
              className="px-10 py-5 bg-white text-indigo-600 border-2 border-indigo-50 rounded-2xl font-bold text-xl hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              {user && isAdmin ? "Admin Dashboard" : "Admin Login"} <ShieldCheck size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'demographics') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Basic Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Age Group</label>
              <select 
                value={demographics.age}
                onChange={(e) => setDemographics({ ...demographics, age: e.target.value })}
                className="w-full p-4 rounded-xl border-2 border-gray-50 focus:border-indigo-600 focus:outline-none transition-all bg-white"
              >
                <option value="">Select Age</option>
                <option value="Under 18">Under 18</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45+">45+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gender</label>
              <select 
                value={demographics.gender}
                onChange={(e) => setDemographics({ ...demographics, gender: e.target.value })}
                className="w-full p-4 rounded-xl border-2 border-gray-50 focus:border-indigo-600 focus:outline-none transition-all bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Race / Ethnicity</label>
              <select 
                value={demographics.raceEthnicity}
                onChange={(e) => setDemographics({ ...demographics, raceEthnicity: e.target.value })}
                className="w-full p-4 rounded-xl border-2 border-gray-50 focus:border-indigo-600 focus:outline-none transition-all bg-white"
              >
                <option value="">Select Ethnicity</option>
                <option value="Asian">Asian</option>
                <option value="Black">Black / African American</option>
                <option value="Hispanic">Hispanic / Latino</option>
                <option value="White">White / Caucasian</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button 
              onClick={handleDemographicsSubmit}
              disabled={!demographics.age || !demographics.gender || !demographics.raceEthnicity}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'questionnaire') {
    const q = currentQuestion;
    const currentAnswer = answers[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Brain size={20} />
              </div>
              <h2 className="font-bold text-gray-900 hidden sm:block">Critical Thinking Assessment</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Question {currentQuestionIndex + 1} of {QUESTIONS.length}
              </div>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500" 
                  style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid lg:grid-cols-2 gap-8 items-start">
          {/* Text View */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 sticky top-24">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FileText size={16} /> Reference Text
            </h3>
            <div className="prose prose-indigo max-w-none">
              <div className="text-lg leading-relaxed text-gray-800">
                {textContent.sentences.map((s) => {
                  const isSelected = (q.type === 'CLICK_SENTENCE' || q.type === 'CLICK_PAIR')
                    ? Array.isArray(currentAnswer.value) && currentAnswer.value.includes(s.id)
                    : false;

                  return (
                    <span 
                      key={s.id}
                      onClick={() => {
                        if (q.type === 'CLICK_SENTENCE') {
                          const current = Array.isArray(currentAnswer.value) ? currentAnswer.value : [];
                          if (current.includes(s.id)) {
                            handleAnswer(current.filter((id: string) => id !== s.id));
                          } else {
                            handleAnswer([...current, s.id]);
                          }
                        } else if (q.type === 'CLICK_PAIR') {
                          const current = Array.isArray(currentAnswer.value) ? currentAnswer.value : [];
                          if (current.includes(s.id)) {
                            handleAnswer(current.filter((id: string) => id !== s.id));
                          } else if (current.length < 2) {
                            handleAnswer([...current, s.id]);
                          }
                        }
                      }}
                      className={cn(
                        "transition-all duration-200 rounded px-1 -mx-1 inline-block mb-1",
                        (q.type === 'CLICK_SENTENCE' || q.type === 'CLICK_PAIR') && "cursor-pointer hover:bg-indigo-50",
                        isSelected && "bg-indigo-100 text-indigo-900 border-b-2 border-indigo-400 font-medium"
                      )}
                    >
                      {s.text}{" "}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question View */}
          <div className="space-y-6">
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <Target size={18} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{q.instruction}</h3>
              </div>

              {q.type === 'MC' && (
                <div className="space-y-3">
                  {q.options?.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={cn(
                        "w-full p-5 rounded-2xl border-2 text-left transition-all font-medium flex items-center gap-4",
                        currentAnswer.value === idx 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900" 
                          : "border-gray-50 hover:border-indigo-100 text-gray-600"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                        currentAnswer.value === idx ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {(q.type === 'CLICK_SENTENCE' || q.type === 'CLICK_PAIR') && (
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <p className="text-indigo-900 font-medium flex items-center gap-2">
                    <Zap size={18} /> 
                    {q.type === 'CLICK_SENTENCE' 
                      ? "Click the relevant sentence(s) in the text on the left."
                      : "Click two sentences to form a pair."}
                  </p>
                  {currentAnswer.value && currentAnswer.value.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {currentAnswer.value.map((id: string) => (
                        <span key={id} className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-200">
                          Sentence {id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(q.type === 'CLICK_SENTENCE' || q.type === 'CLICK_PAIR') && (
                <div className="mt-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reasoning (Required)</label>
                  <textarea 
                    value={currentAnswer.reason}
                    onChange={(e) => handleReason(e.target.value)}
                    placeholder="Explain your choice in at least one sentence..."
                    className="w-full p-4 rounded-xl border-2 border-gray-50 focus:border-indigo-600 focus:outline-none transition-all text-sm h-24 resize-none"
                  />
                </div>
              )}

              <button 
                onClick={nextQuestion}
                disabled={
                  currentAnswer.value === null || 
                  (q.type === 'CLICK_PAIR' && (!Array.isArray(currentAnswer.value) || currentAnswer.value.length < 2)) ||
                  ((q.type === 'CLICK_SENTENCE' || q.type === 'CLICK_PAIR') && currentAnswer.reason.trim().length < 5)
                }
                className="w-full mt-8 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {currentQuestionIndex === QUESTIONS.length - 1 ? "Finish Assessment" : "Next Question"}
                <ChevronRight size={24} />
              </button>
            </motion.div>
          </div>
        </main>

        <AnimatePresence>
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-10 text-center"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Assessment Finished!</h3>
                <p className="text-gray-500 mb-8">Thank you for participating. Your responses have been recorded.</p>
                
                <button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    setStep('welcome');
                    // Reset assessment state
                    setCurrentQuestionIndex(0);
                    setAnswers(new Array(QUESTIONS.length).fill(null).map(() => ({ value: null, reason: '' })));
                    setDemographics({ age: '', gender: '', raceEthnicity: '' });
                  }}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                  Return to Home
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (step === 'admin' && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <button onClick={() => setStep('welcome')} className="p-2 hover:bg-white rounded-xl transition-all">
                <Brain className="text-indigo-600" size={32} />
              </button>
              <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
            </div>
            <button 
              onClick={logOut}
              className="px-6 py-3 bg-white text-gray-600 rounded-xl font-bold border border-gray-100 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              Sign Out <LogOut size={20} />
            </button>
          </header>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="text-indigo-600" /> Assessment Results
              </h2>
              <button 
                onClick={exportToCSV}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700"
              >
                <Download size={16} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">User</th>
                    <th className="px-8 py-4">Demographics</th>
                    <th className="px-8 py-4">Answers & Reasons</th>
                    <th className="px-8 py-4 text-center">Score</th>
                    <th className="px-8 py-4">Level</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {adminResults.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Clock size={14} />
                          {res.submittedAt?.toDate().toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-medium text-gray-900">{res.userId.substring(0, 8)}...</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs text-gray-500">
                          {res.demographics.age} • {res.demographics.gender} • {res.demographics.raceEthnicity}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2 max-w-xs">
                          {res.answers.map((ans, idx) => (
                            <div key={idx} className="text-[10px] border-b border-gray-50 pb-1 last:border-0">
                              <span className="font-bold text-indigo-600">Q{idx+1}:</span> {Array.isArray(ans.value) ? ans.value.join(",") : String(ans.value)}
                              {ans.reason && ans.reason.trim() !== '' && <p className="text-gray-400 italic">Reason: {ans.reason}</p>}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">
                          {res.totalScore}%
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold",
                          res.thinkingLevel === 'Advanced' ? "bg-green-100 text-green-700" :
                          res.thinkingLevel === 'Proficient' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {res.thinkingLevel}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => res.id && setDeleteConfirmId(res.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Result"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {deleteConfirmId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmId(null)}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-10 text-center"
              >
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Result?</h3>
                <p className="text-gray-500 mb-8">This action cannot be undone. Are you sure you want to delete this assessment result?</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => deleteAssessment(deleteConfirmId)}
                    disabled={loading}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {errorMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setErrorMessage(null)}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-10 text-center"
              >
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <X size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Error</h3>
                <p className="text-gray-500 mb-8">{errorMessage}</p>
                
                <button 
                  onClick={() => setErrorMessage(null)}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
