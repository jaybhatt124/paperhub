// src/context/DataContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';

const DataContext = createContext();

const normalize = (value) => String(value || '').trim().toLowerCase();

const unique = (values) => [...new Set((values || []).filter(Boolean))];

const mergeUniversities = (remoteUniversities) => {
  const map = new Map(defaultUniversities.map(item => [normalize(item.name), { ...item }]));

  remoteUniversities.forEach(item => {
    const key = normalize(item.name || item.id);
    const existing = map.get(key) || {};
    map.set(key, {
      ...existing,
      ...item,
      classes: unique([...(existing.classes || []), ...(item.classes || [])]),
      branches: unique([...(existing.branches || []), ...(item.branches || [])]),
      streams: { ...(existing.streams || {}), ...(item.streams || {}) },
      subjects: { ...(existing.subjects || {}), ...(item.subjects || {}) },
    });
  });

  return [...map.values()];
};

export const DataProvider = ({ children }) => {
  const [papers, setPapers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookmarks();
    loadRecentlyViewed();

    const unsubscribeUniversities = onSnapshot(
      collection(db, 'universities'),
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setUniversities(mergeUniversities(data));
      },
      () => setUniversities(defaultUniversities)
    );

    setLoading(true);
    const unsubscribePapers = onSnapshot(
      collection(db, 'papers'),
      (snapshot) => {
        setPapers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => {
        setPapers(samplePapers);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeUniversities();
      unsubscribePapers();
    };
  }, []);

  // ─── UNIVERSITIES / BOARDS ───────────────────────────────────────────────
  const fetchUniversities = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'universities'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUniversities(mergeUniversities(data));
    } catch (e) {
      console.log('Using default universities');
      setUniversities(defaultUniversities);
    }
  };

  // ─── PAPERS ──────────────────────────────────────────────────────────────
  const fetchPapers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'papers'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPapers(data);
    } catch (e) {
      console.log('Firebase not connected, using sample data');
      setPapers(samplePapers);
    } finally {
      setLoading(false);
    }
  };

  const addPaper = async (paper) => {
    try {
      const docRef = await addDoc(collection(db, 'papers'), { ...paper, createdAt: new Date() });
      setPapers(prev => [...prev, { id: docRef.id, ...paper }]);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const deletePaper = async (id) => {
    try {
      await deleteDoc(doc(db, 'papers', id));
      setPapers(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const updatePaper = async (id, data) => {
    try {
      await updateDoc(doc(db, 'papers', id), data);
      setPapers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // ─── ADD UNIVERSITY / SUBJECTS / SEMESTERS ───────────────────────────────
  const addUniversity = async (uni) => {
    try {
      const docRef = await addDoc(collection(db, 'universities'), uni);
      setUniversities(prev => [...prev, { id: docRef.id, ...uni }]);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const deleteUniversity = async (id) => {
    try {
      await deleteDoc(doc(db, 'universities', id));
      setUniversities(prev => prev.filter(u => u.id !== id));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // ─── BOOKMARKS ───────────────────────────────────────────────────────────
  const loadBookmarks = async () => {
    const data = await AsyncStorage.getItem('bookmarks');
    if (data) setBookmarks(JSON.parse(data));
  };

  const toggleBookmark = async (paper) => {
    const exists = bookmarks.find(b => b.id === paper.id);
    let updated;
    if (exists) {
      updated = bookmarks.filter(b => b.id !== paper.id);
    } else {
      updated = [...bookmarks, paper];
    }
    setBookmarks(updated);
    await AsyncStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  const isBookmarked = (id) => bookmarks.some(b => b.id === id);

  // ─── RECENTLY VIEWED ─────────────────────────────────────────────────────
  const loadRecentlyViewed = async () => {
    const data = await AsyncStorage.getItem('recentlyViewed');
    if (data) setRecentlyViewed(JSON.parse(data));
  };

  const addRecentlyViewed = async (paper) => {
    const filtered = recentlyViewed.filter(p => p.id !== paper.id);
    const updated = [paper, ...filtered].slice(0, 10);
    setRecentlyViewed(updated);
    await AsyncStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  // ─── FILTER PAPERS ───────────────────────────────────────────────────────
  const getPapers = ({ board, classLevel, branch, stream, semester, subject }) => {
    return papers.filter(p => {
      if (board && p.board !== board) return false;
      if (classLevel && p.classLevel !== classLevel) return false;
      if (branch && p.branch !== branch) return false;
      if (stream && p.stream !== stream) return false;
      if (semester && p.semester !== semester) return false;
      if (subject && p.subject !== subject) return false;
      return true;
    });
  };

  const searchPapers = (query) => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return papers.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.subject?.toLowerCase().includes(q) ||
      p.board?.toLowerCase().includes(q) ||
      p.year?.toString().includes(q)
    );
  };

  return (
    <DataContext.Provider value={{
      papers, universities, bookmarks, recentlyViewed, loading,
      fetchPapers, addPaper, deletePaper, updatePaper,
      addUniversity, deleteUniversity, fetchUniversities,
      toggleBookmark, isBookmarked,
      addRecentlyViewed,
      getPapers, searchPapers,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

// ─── DEFAULT UNIVERSITIES (fallback if Firebase not connected) ────────────
const defaultUniversities = [
  {
    id: 'cbse',
    name: 'CBSE',
    type: 'board',
    classes: ['10th', '12th'],
    streams: { '12th': ['Science', 'Commerce', 'Arts'] },
    subjects: {
      '10th': ['Maths', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
      '12th_Science': ['Physics', 'Chemistry', 'Maths', 'Biology', 'English', 'Computer Science'],
      '12th_Commerce': ['Accounts', 'Economics', 'Business Studies', 'English', 'Maths'],
      '12th_Arts': ['History', 'Geography', 'Political Science', 'English', 'Sociology'],
    }
  },
  {
    id: 'gseb',
    name: 'GSEB',
    type: 'board',
    classes: ['10th', '12th'],
    streams: { '12th': ['Science', 'Commerce', 'Arts'] },
    subjects: {
      '10th': ['Maths', 'Science', 'Social Science', 'English', 'Hindi', 'Gujarati'],
      '12th_Science': ['Physics', 'Chemistry', 'Maths', 'Biology', 'English'],
      '12th_Commerce': ['Accounts', 'Economics', 'Business Studies', 'English'],
      '12th_Arts': ['History', 'Geography', 'Political Science', 'English', 'Gujarati'],
    }
  },
  {
    id: 'gtu',
    name: 'GTU',
    type: 'university',
    branches: [
      'Computer Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Electronics & Communication',
      'Information Technology',
    ],
    semesters: 6,
    subjects: {
      'Computer Engineering_1': ['Maths-1', 'Physics', 'Basic Electronics', 'Programming in C', 'English'],
      'Computer Engineering_2': ['Maths-2', 'Data Structures', 'Digital Electronics', 'OOP with Java'],
      'Computer Engineering_3': ['Maths-3', 'Database Management', 'Computer Networks', 'Operating Systems'],
      'Computer Engineering_4': ['Web Technology', 'Software Engineering', 'Python Programming', 'Linux'],
      'Computer Engineering_5': ['Mobile App Development', 'Cloud Computing', 'Cyber Security', 'AI & ML'],
      'Computer Engineering_6': ['Project Work', 'Professional Ethics', 'Entrepreneurship'],
      'Mechanical Engineering_1': ['Maths-1', 'Physics', 'Engineering Drawing', 'Workshop', 'English'],
      'Mechanical Engineering_2': ['Maths-2', 'Material Science', 'Thermodynamics', 'Manufacturing Processes'],
      'Civil Engineering_1': ['Maths-1', 'Physics', 'Engineering Drawing', 'Surveying', 'English'],
      'Civil Engineering_2': ['Maths-2', 'Strength of Materials', 'Fluid Mechanics', 'Concrete Technology'],
    }
  }
];

// ─── SAMPLE PAPERS (demo data) ────────────────────────────────────────────
const samplePapers = [
  { id: '1', board: 'CBSE', classLevel: '10th', subject: 'Maths', year: '2024', title: 'CBSE 10th Maths 2024', viewLink: 'https://drive.google.com/file/d/SAMPLE/view', downloadLink: 'https://drive.google.com/uc?export=download&id=SAMPLE' },
  { id: '2', board: 'CBSE', classLevel: '10th', subject: 'Maths', year: '2023', title: 'CBSE 10th Maths 2023', viewLink: 'https://drive.google.com/file/d/SAMPLE/view', downloadLink: 'https://drive.google.com/uc?export=download&id=SAMPLE' },
  { id: '3', board: 'CBSE', classLevel: '10th', subject: 'Science', year: '2024', title: 'CBSE 10th Science 2024', viewLink: 'https://drive.google.com/file/d/SAMPLE/view', downloadLink: 'https://drive.google.com/uc?export=download&id=SAMPLE' },
  { id: '4', board: 'GSEB', classLevel: '10th', subject: 'Maths', year: '2024', title: 'GSEB 10th Maths 2024', viewLink: 'https://drive.google.com/file/d/SAMPLE/view', downloadLink: 'https://drive.google.com/uc?export=download&id=SAMPLE' },
  { id: '5', board: 'GTU', classLevel: 'Diploma', branch: 'Computer Engineering', semester: '3', subject: 'Database Management', year: '2024', title: 'GTU CS Sem-3 DBMS 2024', viewLink: 'https://drive.google.com/file/d/SAMPLE/view', downloadLink: 'https://drive.google.com/uc?export=download&id=SAMPLE' },
];
