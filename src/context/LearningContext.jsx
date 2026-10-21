import {createContext,useContext,useMemo} from 'react';
import {useCourses} from '../hooks/useCourses';
import {useLearning} from '../hooks/useLearning';
const LearningContext=createContext(null);
export function LearningProvider({children}){const courses=useCourses();const learning=useLearning();const value=useMemo(()=>({...courses,...learning}),[courses,learning]);return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>}
export function useLearningContext(){const ctx=useContext(LearningContext);if(!ctx)throw new Error('useLearningContext must be used inside LearningProvider');return ctx;}
