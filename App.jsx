import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SkillInput from './components/SkillInput';
import Recommendations from './components/Recommendations';
import { calculateCosineSimilarity } from './utils/cosineSimilarity';
import { jobsData } from './data/jobs';
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LoginModal from './components/LoginModal';

function App() {
  const [userSkills, setUserSkills] = useState({});
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const { currentUser } = useAuth();

  // Fetch skills on auth change
  useEffect(() => {
    if (currentUser) {
      getDoc(doc(db, "users", currentUser.uid)).then(docSnap => {
        if (docSnap.exists()) {
          setUserSkills(docSnap.data().skills || {});
        }
      });
    } else {
      setUserSkills({});
    }
  }, [currentUser]);

  // Handles adding/updating a skill from the SkillInput component
  const handleUpdateSkills = (skillsDict) => {
    setUserSkills(skillsDict);
    if (currentUser) {
      setDoc(doc(db, "users", currentUser.uid), { skills: skillsDict }, { merge: true });
    }
  };

  // Triggers the recommendation engine
  useEffect(() => {
    if (Object.keys(userSkills).length === 0) {
      setRecommendedJobs([]);
      return;
    }

    const scoredJobs = jobsData.map(job => {
      const score = calculateCosineSimilarity(userSkills, job.requiredSkills);
      return { ...job, score };
    });

    // Sort by highest score (closest to 1.0)
    const sorted = scoredJobs.sort((a, b) => b.score - a.score);
    // Return top matches (we will show those with a score > 0 or just the top 5)
    setRecommendedJobs(sorted.filter(job => job.score > 0).slice(0, 5));
  }, [userSkills]);

  if (!currentUser) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '32px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
             <h1 className="text-4xl font-bold" style={{ marginBottom: '16px' }}>
                Welcome to <span className="text-gradient">CareerCompass</span>
             </h1>
             <p className="text-secondary text-lg">
                Sign in to discover your ideal tech career based on your unique skills, experience, and psychometric profile.
             </p>
          </div>
          <LoginModal isOpen={true} isInline={true} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <main>
        <Hero />
        
        <div className="container" style={{ display: 'flex', gap: '32px', marginTop: '40px', paddingBottom: '80px', flexWrap: 'wrap' }}>
          {/* Left Side: Skill Input & Psychometric Test */}
          <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
            <SkillInput 
              userSkills={userSkills} 
              onUpdateSkills={handleUpdateSkills} 
            />
          </div>
          
          {/* Right Side: Results or Placeholder */}
          <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
            <Recommendations jobs={recommendedJobs} userSkills={userSkills} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
