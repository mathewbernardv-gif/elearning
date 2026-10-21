import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'scenario7-local-demo-secret-change-me';
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const seed = {
  courses: [
    {id:'101',title:'Cybersecurity Fundamentals',category:'Cybersecurity',level:'Beginner',duration:6,instructor:'Ananya Rao',description:'Learn core security principles, common threats, and practical ways to protect systems.',materials:['Security basics','Threat landscape','Account protection'],lessons:5},
    {id:'102',title:'React Development Essentials',category:'Web Development',level:'Intermediate',duration:8,instructor:'Arun Kumar',description:'Build component-based user interfaces with React, hooks, routing, and reusable patterns.',materials:['JSX and components','React Hooks','Routing and forms'],lessons:6},
    {id:'103',title:'Python for Data Analysis',category:'Programming',level:'Beginner',duration:5,instructor:'Meera Shah',description:'Explore Python fundamentals and learn to transform data into useful insights.',materials:['Python basics','Collections','Data processing'],lessons:4},
    {id:'104',title:'Cloud Security Practices',category:'Cybersecurity',level:'Advanced',duration:10,instructor:'Vikram Das',description:'Understand identity, access control, monitoring, and cloud security architecture.',materials:['Cloud identity','Secure configuration','Monitoring'],lessons:7},
    {id:'105',title:'API Design with Node.js',category:'Web Development',level:'Intermediate',duration:7,instructor:'Priya Nair',description:'Design and implement REST APIs, validate requests, and handle errors.',materials:['REST principles','Express routes','API testing'],lessons:5}
  ], users: [{id:'STU1001',name:'Demo Student',email:'student@example.com',password:'student123'}], enrollments: [], quizzes: [], assignments: [], history: []
};
function loadData(){ try { if(fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')); } catch(e){ console.error('[storage] Could not read data file; reseeding:',e.message); } return structuredClone(seed); }
let db=loadData();
function save(){ fs.mkdirSync(path.dirname(DATA_FILE),{recursive:true}); fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2)); }
const log=(action,details={})=>console.log(`[API ${new Date().toISOString()}] ${action}`,JSON.stringify(details));
app.use((req,res,next)=>{ log(`${req.method} ${req.path}`,{body: req.body && Object.keys(req.body).length ? req.body : undefined}); next(); });
function auth(req,res,next){ const header=req.headers.authorization||''; const token=header.startsWith('Bearer ')?header.slice(7):''; if(!token){return res.status(401).json({error:'Authentication token required'});} try{req.user=jwt.verify(token,JWT_SECRET); next();}catch(e){return res.status(401).json({error:'Token is invalid or expired'});} }
function record(type,details){db.history.unshift({id:Date.now().toString(),type,details,at:new Date().toISOString(),userId:'STU1001'}); save();}
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'Scenario 7 E-Learning API'}));
app.post('/api/auth/login',(req,res)=>{const {email,password,studentId}=req.body||{}; const user=db.users.find(u=>(u.email===email||u.id===studentId)&&u.password===password); if(!user){log('LOGIN_FAILED',{email,studentId});return res.status(401).json({error:'Invalid email/student ID or password'});} const token=jwt.sign({sub:user.id,email:user.email,name:user.name},JWT_SECRET,{expiresIn:'2h'}); log('JWT_GENERATED',{studentId:user.id,expiresIn:'2h'}); res.json({token,user:{id:user.id,name:user.name,email:user.email}});});
app.get('/api/auth/me',auth,(req,res)=>res.json({user:req.user}));
app.get('/api/courses',(req,res)=>{let list=[...db.courses]; const q=String(req.query.search||'').toLowerCase(); if(q)list=list.filter(c=>`${c.title} ${c.description} ${c.instructor} ${c.category}`.toLowerCase().includes(q)); if(req.query.category)list=list.filter(c=>c.category===req.query.category); if(req.query.level)list=list.filter(c=>c.level===req.query.level); if(req.query.instructor)list=list.filter(c=>c.instructor.toLowerCase().includes(String(req.query.instructor).toLowerCase())); if(req.query.maxDuration)list=list.filter(c=>c.duration<=Number(req.query.maxDuration)); res.json({courses:list});});
app.get('/api/courses/:id',(req,res)=>{const c=db.courses.find(x=>x.id===req.params.id); if(!c)return res.status(404).json({error:'Course not found'});res.json({course:c});});
app.get('/api/courses/:id/materials',(req,res)=>{const c=db.courses.find(x=>x.id===req.params.id);if(!c)return res.status(404).json({error:'Course not found'});res.json({courseId:c.id,materials:c.materials.map((title,i)=>({id:`${c.id}-m${i+1}`,title,completed:false}))});});
app.get('/api/enrollments',auth,(req,res)=>res.json({enrollments:db.enrollments.filter(e=>e.userId===req.user.sub)}));
app.post('/api/enrollments',auth,(req,res)=>{const {courseId}=req.body||{};const course=db.courses.find(c=>c.id===String(courseId));if(!course)return res.status(400).json({error:'Valid courseId is required'});let existing=db.enrollments.find(e=>e.userId===req.user.sub&&e.courseId===course.id);if(existing)return res.json({enrollment:existing,message:'Already enrolled'});const enrollment={id:Date.now().toString(),userId:req.user.sub,courseId:course.id,progress:0,completedLessons:[],quizScore:null,assignmentStatus:'Not submitted',enrolledAt:new Date().toISOString()};db.enrollments.push(enrollment);save();record('ENROLL',{courseId:course.id});log('CRUD_CREATE_ENROLLMENT',{enrollmentId:enrollment.id,courseId:course.id});res.status(201).json({enrollment});});
app.patch('/api/enrollments/:id',auth,(req,res)=>{const e=db.enrollments.find(x=>x.id===req.params.id&&x.userId===req.user.sub);if(!e)return res.status(404).json({error:'Enrollment not found'});const {progress,completedLessons,quizScore,assignmentStatus}=req.body||{};if(progress!==undefined)e.progress=Math.max(0,Math.min(100,Number(progress)||0));if(completedLessons!==undefined)e.completedLessons=completedLessons;if(quizScore!==undefined)e.quizScore=Number(quizScore);if(assignmentStatus!==undefined)e.assignmentStatus=String(assignmentStatus);save();record('PROGRESS_UPDATE',{enrollmentId:e.id,progress:e.progress});log('CRUD_UPDATE_ENROLLMENT',{enrollmentId:e.id,progress:e.progress});res.json({enrollment:e});});
app.put('/api/enrollments/:id',auth,(req,res)=>{const e=db.enrollments.find(x=>x.id===req.params.id&&x.userId===req.user.sub);if(!e)return res.status(404).json({error:'Enrollment not found'});Object.assign(e,req.body,{id:e.id,userId:e.userId,courseId:e.courseId});save();record('ENROLLMENT_REPLACE',{enrollmentId:e.id});res.json({enrollment:e});});
app.delete('/api/enrollments/:id',auth,(req,res)=>{const i=db.enrollments.findIndex(x=>x.id===req.params.id&&x.userId===req.user.sub);if(i<0)return res.status(404).json({error:'Enrollment not found'});const [removed]=db.enrollments.splice(i,1);save();record('UNENROLL',{enrollmentId:removed.id});log('CRUD_DELETE_ENROLLMENT',{enrollmentId:removed.id});res.json({message:'Enrollment removed'});});
app.post('/api/quizzes',auth,(req,res)=>{const {courseId,answers,score}=req.body||{};const result={id:Date.now().toString(),userId:req.user.sub,courseId:String(courseId||''),answers:answers||[],score:Number(score)||0,submittedAt:new Date().toISOString()};db.quizzes.push(result);const e=db.enrollments.find(x=>x.userId===req.user.sub&&x.courseId===result.courseId);if(e)e.quizScore=result.score;save();record('QUIZ_SUBMIT',{courseId:result.courseId,score:result.score});log('QUIZ_SUBMITTED',{score:result.score});res.status(201).json({result});});
app.post('/api/assignments',auth,(req,res)=>{const {courseId,title,submission}=req.body||{};if(!String(submission||'').trim())return res.status(400).json({error:'Assignment submission is required'});const result={id:Date.now().toString(),userId:req.user.sub,courseId:String(courseId||''),title:title||'Course assignment',submission,submittedAt:new Date().toISOString(),status:'Submitted'};db.assignments.push(result);const e=db.enrollments.find(x=>x.userId===req.user.sub&&x.courseId===result.courseId);if(e)e.assignmentStatus='Submitted';save();record('ASSIGNMENT_SUBMIT',{courseId:result.courseId});res.status(201).json({assignment:result});});
app.get('/api/history',auth,(req,res)=>res.json({history:db.history.filter(h=>h.userId===req.user.sub)}));
app.use((err,req,res,next)=>{console.error('[API ERROR]',err);res.status(500).json({error:'Unexpected server error'});});
app.listen(PORT,'0.0.0.0',()=>{console.log(`
Scenario 7 E-Learning API running at http://localhost:${PORT}`);console.log('Demo login: student@example.com / student123');console.log('JWT generation and CRUD actions will be logged here.\n');});
