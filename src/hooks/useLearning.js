import {useCallback,useMemo} from 'react';
import {api} from '../services/api';
import {useLearningStore} from '../store/learningStore';
import {useAuth} from '../context/AuthContext';
export function useLearning(){const enrollments=useLearningStore(s=>s.enrollments);const setEnrollments=useLearningStore(s=>s.setEnrollments);const upsertEnrollment=useLearningStore(s=>s.upsertEnrollment);const removeEnrollment=useLearningStore(s=>s.removeEnrollment);const updateLocal=useLearningStore(s=>s.updateLocal);const {isAuthenticated}=useAuth();
 const refreshEnrollments=useCallback(async()=>{if(!isAuthenticated)return [];const {data}=await api.get('/enrollments');setEnrollments(data.enrollments);return data.enrollments;},[isAuthenticated,setEnrollments]);
 const enrollCourse=useCallback(async(courseId)=>{const {data}=await api.post('/enrollments',{courseId});upsertEnrollment(data.enrollment);return data.enrollment;},[upsertEnrollment]);
 const updateProgress=useCallback(async(enrollment,updates)=>{const {data}=await api.patch(`/enrollments/${enrollment.id}`,updates);upsertEnrollment(data.enrollment);return data.enrollment;},[upsertEnrollment]);
 const completeLesson=useCallback(async(enrollment,course)=>{const completed=[...(enrollment.completedLessons||[])];const next= Math.min(course.lessons,completed.length+1);if(next>completed.length)completed.push(`lesson-${next}`);const progress=Math.round((completed.length/course.lessons)*100);return updateProgress(enrollment,{completedLessons:completed,progress});},[updateProgress]);
 const submitQuiz=useCallback(async(courseId,answers,score)=>{const {data}=await api.post('/quizzes',{courseId,answers,score});const e=enrollments.find(x=>x.courseId===String(courseId));if(e)await updateProgress(e,{quizScore:score});return data.result;},[enrollments,updateProgress]);
 const submitAssignment=useCallback(async(courseId,title,submission)=>{const {data}=await api.post('/assignments',{courseId,title,submission});const e=enrollments.find(x=>x.courseId===String(courseId));if(e)await updateProgress(e,{assignmentStatus:'Submitted'});return data.assignment;},[enrollments,updateProgress]);
 const deleteEnrollment=useCallback(async(id)=>{await api.delete(`/enrollments/${id}`);removeEnrollment(id);},[removeEnrollment]);
 const courseCompletion=useCallback((courseId)=>enrollments.find(e=>e.courseId===String(courseId))?.progress||0,[enrollments]);
 const overallProgress=useMemo(()=>enrollments.length?Math.round(enrollments.reduce((sum,e)=>sum+(e.progress||0),0)/enrollments.length):0,[enrollments]);
 const certificateEligible=useCallback((courseId)=>{const e=enrollments.find(x=>x.courseId===String(courseId));return !!e&&e.progress>=100&&e.quizScore!==null&&e.quizScore!==undefined&&e.assignmentStatus==='Submitted';},[enrollments]);
 return {enrollments,refreshEnrollments,enrollCourse,updateProgress,completeLesson,submitQuiz,submitAssignment,deleteEnrollment,courseCompletion,overallProgress,certificateEligible,updateLocal};}
