import React, { useState, useEffect } from 'react';
import { auth, db, signIn, logOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { TOPICS } from './constants';
import { SurveyResult, TextResponse, NASA_TLX, QuestionResponse, TopicText, Demographics } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronRight, 
  BarChart3, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  AlertCircle,
  User as UserIcon,
  Clock,
  Brain,
  ShieldCheck,
  Zap,
  Download,
  Trash2
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-8">
    <motion.div 
      className="bg-indigo-600 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

const NASA_TLX_Question = ({ 
  label, 
  description, 
  value, 
  onChange 
}: { 
  label: string; 
  description: string; 
  value: number; 
  onChange: (val: number) => void 
}) => (
  <div className="mb-8">
    <div className="flex justify-between items-end mb-2">
      <h4 className="text-lg font-semibold text-gray-800">{label}</h4>
      <span className="text-indigo-600 font-bold text-xl">{value}</span>
    </div>
    <p className="text-sm text-gray-500 mb-4 italic">{description}</p>
    <div className="flex justify-between gap-1">
      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={cn(
            "flex-1 py-3 rounded-lg border-2 transition-all duration-200 font-medium",
            value === num 
              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105" 
              : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"
          )}
        >
          {num}
        </button>
      ))}
    </div>
    <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
      <span>Low / Easy</span>
      <span>High / Hard</span>
    </div>
  </div>
);

// --- Constants ---
const ADMIN_EMAIL = "xyujin674@gmail.com";

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [step, setStep] = useState<'welcome' | 'demographics' | 'reading' | 'nasa' | 'questions' | 'complete' | 'admin'>('welcome');
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [assignedTexts, setAssignedTexts] = useState<{ topicId: string; text: TopicText }[]>([]);
  const [responses, setResponses] = useState<TextResponse[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({
    age: '',
    gender: '',
    raceEthnicity: ''
  });
  
  // Current step state
  const [currentNASA, setCurrentNASA] = useState<NASA_TLX>({ fluency: 4, cognitiveLoad: 4, trust: 4 });
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [adminResults, setAdminResults] = useState<SurveyResult[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const email = user.email?.toLowerCase().trim();
      const adminEmail = ADMIN_EMAIL.toLowerCase().trim();
      console.log(`Admin check: User=${email}, Admin=${adminEmail}, Match=${email === adminEmail}`);
      
      if (email === adminEmail) {
        setIsAdmin(true);
        // Auto-redirect to admin dashboard if on welcome screen
        if (step === 'welcome') {
          setStep('admin');
          fetchResults();
        }
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [user, step]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('popup-blocked')) {
        alert("Sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
      } else {
        alert("Failed to sign in: " + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'surveyResults'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SurveyResult));
      setAdminResults(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      alert("Access Denied or Error: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this response? This action cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, 'surveyResults', id));
      setAdminResults(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("Failed to delete result.");
    }
  };

  const handleDownloadCSV = () => {
    if (adminResults.length === 0) return;

    const headers = [
      "Participant ID",
      "Timestamp",
      "Age",
      "Gender",
      "Race/Ethnicity",
      "Topic 1 ID",
      "Topic 1 Type",
      "Topic 1 Fluency",
      "Topic 1 Cognitive Load",
      "Topic 1 Trust",
      "Topic 1 Comprehension Correct",
      "Topic 1 Inference Correct",
      "Topic 1 Critical Correct",
      "Topic 1 Total Correct",
      "Topic 2 ID",
      "Topic 2 Type",
      "Topic 2 Fluency",
      "Topic 2 Cognitive Load",
      "Topic 2 Trust",
      "Topic 2 Comprehension Correct",
      "Topic 2 Inference Correct",
      "Topic 2 Critical Correct",
      "Topic 2 Total Correct"
    ];

    const rows = adminResults.map(result => {
      const row = [
        result.participantId,
        result.timestamp?.toDate().toISOString(),
        `"${result.demographics?.age || ''}"`,
        `"${result.demographics?.gender || ''}"`,
        `"${result.demographics?.raceEthnicity || ''}"`
      ];

      result.responses.forEach(resp => {
        const comp = resp.answers.filter(a => a.type === 'comprehension' && a.isCorrect).length;
        const inf = resp.answers.filter(a => a.type === 'inference' && a.isCorrect).length;
        const crit = resp.answers.filter(a => a.type === 'critical' && a.isCorrect).length;
        const total = resp.answers.filter(a => a.isCorrect).length;

        row.push(
          resp.topicId,
          resp.textType,
          resp.nasaTlx.fluency.toString(),
          resp.nasaTlx.cognitiveLoad.toString(),
          resp.nasaTlx.trust.toString(),
          comp.toString(),
          inf.toString(),
          crit.toString(),
          total.toString()
        );
      });

      return row.join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `survey_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startSurvey = () => {
    setStep('demographics');
  };

  const handleDemographicsSubmit = () => {
    // Randomly assign texts: 
    // Participant reads 2 topics. For each topic, randomly pick AI or Human.
    // Ensure they get one of each type if possible, or just random.
    // Requirement: "two different texts (one is AI, one is Human) on different topics"
    const topics = [...TOPICS];
    const shuffledTopics = topics.sort(() => Math.random() - 0.5);
    
    const firstType = Math.random() > 0.5 ? 'ai' : 'human';
    const secondType = firstType === 'ai' ? 'human' : 'ai';

    const assigned = [
      { topicId: shuffledTopics[0].id, text: shuffledTopics[0].texts[firstType] },
      { topicId: shuffledTopics[1].id, text: shuffledTopics[1].texts[secondType] }
    ];

    setAssignedTexts(assigned);
    setStep('reading');
    setCurrentTopicIndex(0);
  };

  const handleNextFromReading = () => setStep('nasa');

  const handleNextFromNASA = () => setStep('questions');

  const handleFinishQuestions = async () => {
    const currentTopic = TOPICS.find(t => t.id === assignedTexts[currentTopicIndex].topicId)!;
    const textType = assignedTexts[currentTopicIndex].text.type;

    const questionResponses: QuestionResponse[] = currentTopic.questions.map(q => ({
      questionId: q.id,
      answer: currentAnswers[q.id] || "",
      isCorrect: currentAnswers[q.id] === q.correctAnswer,
      type: q.type
    }));

    const textResponse: TextResponse = {
      topicId: currentTopic.id,
      textType: textType,
      nasaTlx: currentNASA,
      answers: questionResponses
    };

    const newResponses = [...responses, textResponse];
    setResponses(newResponses);

    if (currentTopicIndex < assignedTexts.length - 1) {
      // Move to next topic
      setCurrentTopicIndex(currentTopicIndex + 1);
      setCurrentNASA({ fluency: 4, cognitiveLoad: 4, trust: 4 });
      setCurrentAnswers({});
      setStep('reading');
    } else {
      // Final submission
      setLoading(true);
      try {
        await addDoc(collection(db, 'surveyResults'), {
          participantId: `p_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Timestamp.now(),
          responses: newResponses,
          demographics: demographics
        });
        setStep('complete');
      } catch (error) {
        console.error("Error saving results:", error);
        alert("There was an error saving your results. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (step === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-500 text-sm">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                title="Download CSV"
              >
                <Download size={18} /> Export CSV
              </button>
              <button 
                onClick={fetchResults}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Refresh Results"
              >
                <Zap size={20} />
              </button>
              <button 
                onClick={() => logOut().then(() => setStep('welcome'))}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors font-medium"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid gap-6">
              {adminResults.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-gray-300">
                  <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No survey results collected yet.</p>
                </div>
              ) : (
                adminResults.map((result) => (
                  <div key={result.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {result.participantId}
                        </span>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Clock size={14} /> {result.timestamp?.toDate().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                        <span>Age: {result.demographics?.age}</span>
                        <span>Gender: {result.demographics?.gender}</span>
                        <span>Race/Ethnicity: {result.demographics?.raceEthnicity}</span>
                      </div>
                      <button 
                        onClick={() => result.id && handleDeleteResult(result.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete Response"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="p-6 grid md:grid-cols-2 gap-8">
                      {result.responses.map((resp, idx) => {
                        const topic = TOPICS.find(t => t.id === resp.topicId);
                        const criticalScore = resp.answers.filter(a => a.type === 'critical' && a.isCorrect).length;
                        const totalCritical = resp.answers.filter(a => a.type === 'critical').length;
                        
                        return (
                          <div key={idx} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-gray-800 text-lg">{topic?.title}</h3>
                              <span className={cn(
                                "px-2 py-1 rounded text-xs font-bold uppercase",
                                resp.textType === 'ai' ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                              )}>
                                {resp.textType}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-blue-50 p-3 rounded-xl text-center">
                                <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Fluency</p>
                                <p className="text-xl font-bold text-blue-900">{resp.nasaTlx.fluency}</p>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-xl text-center">
                                <p className="text-[10px] text-orange-600 font-bold uppercase mb-1">Load</p>
                                <p className="text-xl font-bold text-orange-900">{resp.nasaTlx.cognitiveLoad}</p>
                              </div>
                              <div className="bg-emerald-50 p-3 rounded-xl text-center">
                                <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Trust</p>
                                <p className="text-xl font-bold text-emerald-900">{resp.nasaTlx.trust}</p>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Critical Thinking Score</p>
                                <span className="text-indigo-600 font-bold">{criticalScore} / {totalCritical}</span>
                              </div>
                              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-full" 
                                  style={{ width: `${(criticalScore / totalCritical) * 100}%` }}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-bold text-gray-400 uppercase">Question Details</p>
                              {resp.answers.map((ans, aIdx) => (
                                <div key={aIdx} className="flex items-center gap-2 text-sm">
                                  {ans.isCorrect ? (
                                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                  ) : (
                                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                                  )}
                                  <span className="text-gray-600 truncate">{ans.type}: {ans.isCorrect ? 'Correct' : 'Incorrect'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto px-6 py-20 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-3xl mb-8 text-indigo-600">
              <BookOpen size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
              Reading Comprehension Study
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              In this study, you will read two short texts on different topics and answer a few questions about each. 
              Your responses will help us understand how people process information from various sources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={startSurvey}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
              >
                Start Study <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              {user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() ? (
                <button 
                  onClick={() => { setStep('admin'); fetchResults(); }}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <BarChart3 size={20} /> Go to Dashboard
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleSignIn}
                    disabled={loading}
                    className="px-8 py-4 bg-white text-gray-600 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    ) : (
                      <>
                        <LogIn size={20} /> Admin Login
                      </>
                    )}
                  </button>
                  {user && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-600">
                        Signed in as: <span className="font-bold text-gray-900">{user.email}</span>
                      </p>
                      {!isAdmin && (
                        <p className="text-xs text-red-500 font-medium mt-1 flex items-center justify-center gap-1">
                          <AlertCircle size={12} /> This email is not authorized as admin.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="mt-12 text-sm text-gray-400">
              Estimated time: 5-10 minutes. Your data is collected anonymously.
            </p>
          </motion.div>
        )}

        {step === 'demographics' && (
          <motion.div 
            key="demographics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto px-6 py-12"
          >
            <ProgressBar current={1} total={7} />
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Demographic Information</h2>
              <p className="text-gray-500">Please provide some basic information about yourself. This data is collected anonymously.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Age</label>
                <input 
                  type="text" 
                  value={demographics.age}
                  onChange={(e) => setDemographics({ ...demographics, age: e.target.value })}
                  placeholder="e.g. 25"
                  className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Gender</label>
                <select 
                  value={demographics.gender}
                  onChange={(e) => setDemographics({ ...demographics, gender: e.target.value })}
                  className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-600 focus:outline-none transition-all bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Race/Ethnicity</label>
                <input 
                  type="text" 
                  value={demographics.raceEthnicity}
                  onChange={(e) => setDemographics({ ...demographics, raceEthnicity: e.target.value })}
                  placeholder="e.g. White, Black, Asian, Hispanic, etc."
                  className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleDemographicsSubmit}
              disabled={!demographics.age || !demographics.gender || !demographics.raceEthnicity}
              className={cn(
                "w-full mt-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-lg flex items-center justify-center gap-2",
                (!demographics.age || !demographics.gender || !demographics.raceEthnicity)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
              )}
            >
              Continue to Study <ChevronRight />
            </button>
          </motion.div>
        )}

        {step === 'reading' && (
          <motion.div 
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-6 py-12"
          >
            <ProgressBar current={currentTopicIndex * 3 + 2} total={7} />
            <div className="mb-10">
              <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-2 block">
                Topic {currentTopicIndex + 1} of 2
              </span>
              <h2 className="text-3xl font-bold text-gray-900">
                {TOPICS.find(t => t.id === assignedTexts[currentTopicIndex].topicId)?.title}
              </h2>
            </div>
            <div className="prose prose-indigo prose-lg max-w-none bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-inner mb-12">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {assignedTexts[currentTopicIndex].text.content}
              </p>
            </div>
            <button 
              onClick={handleNextFromReading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              I have finished reading <ChevronRight />
            </button>
          </motion.div>
        )}

        {step === 'nasa' && (
          <motion.div 
            key="nasa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto px-6 py-12"
          >
            <ProgressBar current={currentTopicIndex * 3 + 3} total={7} />
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Evaluation</h2>
              <p className="text-gray-500">Please rate the text you just read on the following scales.</p>
            </div>
            
            <div className="space-y-4">
              <NASA_TLX_Question 
                label="Fluency"
                description="How easy was this text to read? (1 = Very Difficult, 7 = Very Easy)"
                value={currentNASA.fluency}
                onChange={(v) => setCurrentNASA({ ...currentNASA, fluency: v })}
              />
              <NASA_TLX_Question 
                label="Cognitive Load"
                description="How much mental effort did reading this require? (1 = Very Low, 7 = Very High)"
                value={currentNASA.cognitiveLoad}
                onChange={(v) => setCurrentNASA({ ...currentNASA, cognitiveLoad: v })}
              />
              <NASA_TLX_Question 
                label="Trust"
                description="How confident do you feel about the accuracy of this text? (1 = Not Confident, 7 = Very Confident)"
                value={currentNASA.trust}
                onChange={(v) => setCurrentNASA({ ...currentNASA, trust: v })}
              />
            </div>

            <button 
              onClick={handleNextFromNASA}
              className="w-full mt-8 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              Continue to Questions <ChevronRight />
            </button>
          </motion.div>
        )}

        {step === 'questions' && (
          <motion.div 
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl mx-auto px-6 py-12"
          >
            <ProgressBar current={currentTopicIndex * 3 + 4} total={7} />
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Comprehension Check</h2>
              <p className="text-gray-500">Answer the following questions based on the text.</p>
            </div>

            <div className="space-y-12 mb-12">
              {TOPICS.find(t => t.id === assignedTexts[currentTopicIndex].topicId)?.questions.map((q, idx) => (
                <div key={q.id} className="bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-800 leading-tight">
                      {q.text}
                    </h3>
                  </div>
                  <div className="grid gap-3 ml-12">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCurrentAnswers({ ...currentAnswers, [q.id]: opt })}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                          currentAnswers[q.id] === opt 
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-medium" 
                            : "bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleFinishQuestions}
              disabled={loading || Object.keys(currentAnswers).length < 5}
              className={cn(
                "w-full py-5 rounded-2xl font-bold text-xl transition-all shadow-lg flex items-center justify-center gap-2",
                Object.keys(currentAnswers).length < 5
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
              )}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                currentTopicIndex < assignedTexts.length - 1 ? "Next Topic" : "Finish Study"
              )}
              {Object.keys(currentAnswers).length >= 5 && <ChevronRight />}
            </button>
            {Object.keys(currentAnswers).length < 5 && (
              <p className="text-center mt-4 text-sm text-gray-400">Please answer all questions to continue.</p>
            )}
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto px-6 py-24 text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-8 text-green-500">
              <CheckCircle2 size={56} />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Your responses have been recorded successfully. Your participation is greatly appreciated and will contribute to our research on information processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all"
              >
                Back to Start
              </button>
              {isAdmin && (
                <button 
                  onClick={() => { setStep('admin'); fetchResults(); }}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <BarChart3 size={20} /> View All Results
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-end">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 shadow-sm pointer-events-auto flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
               <Brain size={14} /> Cognitive Study v1.0
             </div>
             {isAdmin && step !== 'admin' && (
               <button 
                 onClick={() => { setStep('admin'); fetchResults(); }}
                 className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 transition-all pointer-events-auto"
               >
                 <BarChart3 size={12} /> View Results
               </button>
             )}
             {user && (
               <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                 <span className="text-xs font-medium text-gray-600">{user.email}</span>
                 <button onClick={() => logOut()} className="text-gray-400 hover:text-red-500 transition-colors">
                   <LogOut size={14} />
                 </button>
               </div>
             )}
          </div>
        </div>
      </footer>
    </div>
  );
}
