import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const api = axios.create({baseURL,timeout:10000});
api.interceptors.request.use(config=>{const token=localStorage.getItem('elearning_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(r=>r,e=>{if(e.response?.status===401 && localStorage.getItem('elearning_token')){window.dispatchEvent(new CustomEvent('elearning:unauthorized'));}return Promise.reject(e);});
const cache=new Map();
export async function getCourses(params={}){const key=JSON.stringify(params);if(cache.has(key))return cache.get(key);const {data}=await api.get('/courses',{params});cache.set(key,data.courses);return data.courses;}
export async function getCourse(id){const {data}=await api.get(`/courses/${id}`);return data.course;}
export async function getMaterials(id){const {data}=await api.get(`/courses/${id}/materials`);return data.materials;}
export function clearCourseCache(){cache.clear();}

// Native Fetch example used for the learning-history requirement (Axios is used elsewhere).
export async function fetchLearningHistory(){const token=localStorage.getItem('elearning_token');const response=await fetch(`${baseURL}/history`,{headers:token?{Authorization:`Bearer ${token}`}:{}});if(!response.ok){let message='Unable to retrieve learning history';try{message=(await response.json()).error||message}catch{}throw new Error(message)}const data=await response.json();return data.history||[]}
