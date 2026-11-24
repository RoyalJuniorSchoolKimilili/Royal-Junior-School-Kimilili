"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AnyRow = Record<string, any>;
type Learner = {
  id: string; admission_number: string; full_name: string; class_id: string | null;
  date_of_birth: string | null; gender: string | null; study_mode: string;
  enrollment_status: string; guardian_name: string | null; guardian_phone: string | null;
};
const base = "/Royal-Junior-School-Kimilili/portal/";
const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-KE") : "—";
const money = (value?: number | string | null) => value == null ? "—" : "KES " + Number(value).toLocaleString("en-KE");

export default function LearnerProfilePage() {
  const [loading,setLoading]=useState(true),[error,setError]=useState(""),[role,setRole]=useState("");
  const [learner,setLearner]=useState<Learner|null>(null),[className,setClassName]=useState("");
  const [attendance,setAttendance]=useState<AnyRow[]>([]),[marks,setMarks]=useState<AnyRow[]>([]);
  const [fees,setFees]=useState<AnyRow[]>([]),[documents,setDocuments]=useState<AnyRow[]>([]);
  const [directory,setDirectory]=useState<AnyRow|null>(null),[choices,setChoices]=useState<AnyRow[]>([]),[choiceClasses,setChoiceClasses]=useState<AnyRow[]>([]);
  const [selected,setSelected]=useState(""),[selectedGrade,setSelectedGrade]=useState(""),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
  const canSeeFees=(r:string)=>["admin","director","headteacher","parent"].includes(r);
  useEffect(()=>{let alive=true;const supabase=createSupabaseBrowserClient();
    const load=async()=>{
      const params=new URLSearchParams(window.location.search);
      const directId=params.get("id"),directoryId=params.get("directoryId");
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){window.location.replace(base);return;}
      const {data:account,error:accountError}=await supabase.from("profiles").select("id,role,approval_status").eq("id",user.id).maybeSingle();
      if(!alive)return;
      if(accountError||!account||account.approval_status!=="approved"){setError("Your approved school account could not be verified.");setLoading(false);return;}
      if(!["admin","director","headteacher","teacher","parent"].includes(account.role)){setError("Your role does not have access to individual learner profiles. Use your authorised portal section.");setLoading(false);return;}
      setRole(account.role);
      let learnerId=directId;
      if(directoryId){
        const {data:entry,error:entryError}=await (supabase as any).from("learner_directory_2026").select("id,grade,learner_name,parent_name,parent_phone,learner_id").eq("id",directoryId).maybeSingle();
        if(!alive)return;
        if(entryError||!entry){setError(entryError?.message??"Directory entry not found or access denied.");setLoading(false);return;}
        setDirectory(entry);learnerId=entry.learner_id;
        if(account.role==="admin"){
          const {data:available}=await supabase.from("learners").select("id,full_name,admission_number").order("full_name").limit(500);
          if(alive)setChoices(available??[]);
        }
        if(!learnerId){setLoading(false);return;}
      }
      if(!learnerId){setError("No learner was selected.");setLoading(false);return;}
      const {data:record,error:recordError}=await supabase.from("learners").select("id,admission_number,full_name,class_id,date_of_birth,gender,study_mode,enrollment_status,guardian_name,guardian_phone").eq("id",learnerId).maybeSingle();
      if(!alive)return;
      if(recordError||!record){setError(recordError?.message??"This learner record is unavailable or you do not have permission to view it.");setLoading(false);return;}
      setLearner(record as Learner);
      const [classResult,attendanceResult,marksResult]=await Promise.all([
        record.class_id ? supabase.from("classes").select("name").eq("id",record.class_id).maybeSingle() : Promise.resolve({data:null,error:null}),
        supabase.from("attendance").select("id,attendance_date,status,note").eq("learner_id",learnerId).order("attendance_date",{ascending:false}).limit(100),
        (supabase.from("marks") as any).select("id,score,maximum_score,grade,feedback,competency_progress,learner_strengths,support_needs,next_steps,evidence_notes,created_at,assessments(title,assessment_date,strand,sub_strand,subjects(name),academic_terms(name,academic_year))").eq("learner_id",learnerId).order("created_at",{ascending:false}).limit(100)
      ]);
      if(!alive)return;
      setClassName(classResult.data?.name??"Not assigned");
      setAttendance(attendanceResult.data??[]);setMarks(marksResult.data??[]);
      if(canSeeFees(account.role)){
        const {data}=await supabase.from("fee_payments").select("id,amount_kes,payment_method,payment_reference,receipt_number,status,paid_at").eq("learner_id",learnerId).order("paid_at",{ascending:false}).limit(100);
        if(alive)setFees(data??[]);
      }
      if(["admin","director","headteacher","parent"].includes(account.role)){
        const {data}=await supabase.from("learner_documents").select("id,document_type,original_filename,created_at").eq("learner_id",learnerId).order("created_at",{ascending:false}).limit(50);
        if(alive)setDocuments(data??[]);
      }
      if(alive)setLoading(false);
    };
    void load();return()=>{alive=false};
  },[]);
  const linkDirectory=async()=>{
    if(!directory||!selected)return;
    setSaving(true);setMessage("");const supabase=createSupabaseBrowserClient();
    const {error:saveError}=await (supabase as any).from("learner_directory_2026").update({learner_id:selected}).eq("id",directory.id);
    setSaving(false);
    if(saveError){setMessage("Could not link learner: "+saveError.message);return;}
    setMessage("Directory entry linked. Open the profile again to load the full school record.");
    setDirectory({...directory,learner_id:selected});
  };
  if(loading)return <main className="auth-page"><section className="auth-card"><p>Loading individual learner profile…</p></section></main>;
  if(error)return <main className="auth-page"><section className="auth-card"><a href={base+"dashboard/"}>← Back to dashboard</a><h1>Learner profile</h1><p role="alert" className="portal-error">{error}</p></section></main>;
  if(directory&&!learner)return <main className="auth-page"><section className="auth-card profile-card"><a href={base+"learners-2026/"}>← Back to 2026 directory</a><p className="eyebrow">ROYAL JUNIOR SCHOOL · CONFIDENTIAL</p><h1>{directory.learner_name}</h1><p className="profile-subtitle">Directory entry · {directory.grade}</p><div className="profile-grid"><div><small>Parent / guardian</small><strong>{directory.parent_name||"Not supplied"}</strong></div><div><small>Phone</small><strong>{directory.parent_phone||"Not supplied"}</strong></div></div>{role==="admin"&&<section className="profile-section"><h2>Connect to the full school record</h2><p>Choose the matching learner record manually. No automatic name or phone matching is performed.</p><label>1. Select grade / class<select value={selectedGrade} onChange={e=>{setSelectedGrade(e.target.value);setSelected("");}}><option value="">Choose grade first</option>{Array.from(new Set(choices.map(x=>choiceClasses.find(c=>c.id===x.class_id)?.name??"Unassigned"))).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).map(g=><option key={g} value={g}>{g}</option>)}</select></label><label>2. Select matching learner<select disabled={!selectedGrade} value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose learner</option>{choices.filter(x=>(choiceClasses.find(c=>c.id===x.class_id)?.name??"Unassigned")===selectedGrade).map(x=><option key={x.id} value={x.id}>{x.admission_number} — {x.full_name}</option>)}</select></label><button className="auth-button" disabled={!selected||saving} onClick={linkDirectory}>{saving?"Saving…":"Link learner record"}</button><p>{message}</p></section>}<p className="profile-subtitle">This directory entry has not yet been linked to the main learner record. Full academic, attendance and fee details will appear after an administrator links it.</p></section><style jsx>{styles}</style></main>;
  if(!learner)return <main className="auth-page"><section className="auth-card"><a href={base+"dashboard/"}>← Back to dashboard</a><p>No learner record was selected.</p></section></main>;
  return <main className="auth-page"><section className="auth-card profile-card">
    <a href={base+"dashboard/"}>← Back to school dashboard</a><p className="eyebrow">ROYAL JUNIOR SCHOOL · KIMILILI</p><h1>{learner.full_name}</h1><p className="profile-subtitle">Admission No. {learner.admission_number} · {className}</p>
    <div className="profile-grid"><div><small>Admission status</small><strong>{learner.enrollment_status}</strong></div><div><small>Study mode</small><strong>{learner.study_mode}</strong></div><div><small>Date of birth</small><strong>{dateLabel(learner.date_of_birth)}</strong></div><div><small>Gender</small><strong>{learner.gender||"—"}</strong></div><div><small>Parent / guardian</small><strong>{learner.guardian_name||"Not recorded"}</strong></div><div><small>Guardian phone</small><strong>{learner.guardian_phone||"Not recorded"}</strong></div></div>
    <section className="profile-section"><h2>School documents</h2><p><a href="/Royal-Junior-School-Kimilili/portal/receipts/">Open secure school receipts ↗</a></p></section><section className="profile-section"><h2>Attendance history</h2>{attendance.length?<div className="table-scroll"><table className="school-data-table"><thead><tr><th>Date</th><th>Status</th><th>Note</th></tr></thead><tbody>{attendance.map(x=><tr key={x.id}><td>{dateLabel(x.attendance_date)}</td><td>{x.status}</td><td>{x.note||"—"}</td></tr>)}</tbody></table></div>:<p>No attendance records available.</p>}</section>
    <section className="profile-section"><h2>CBE assessments and results</h2>{marks.length?<div className="table-scroll"><table className="school-data-table"><thead><tr><th>Date</th><th>Learning area / assessment</th><th>Strand / sub-strand</th><th>Score / grade</th><th>Feedback and competencies</th></tr></thead><tbody>{marks.map(x=>{const a=x.assessments??{};return <tr key={x.id}><td>{dateLabel(a.assessment_date||x.created_at)}</td><td>{[a.subjects?.name,a.title].filter(Boolean).join(" · ")||"Assessment"}</td><td>{[a.strand,a.sub_strand].filter(Boolean).join(" / ")||"—"}</td><td>{x.score==null?(x.grade||"—"):(x.score+"/"+(x.maximum_score??"—")+" · "+(x.grade||""))}</td><td>{[x.feedback,x.competency_progress,x.learner_strengths,x.support_needs,x.next_steps].filter(Boolean).join(" · ")||"—"}</td></tr>})}</tbody></table></div>:<p>No assessment results recorded yet.</p>}</section>
    {canSeeFees(role)&&<section className="profile-section"><h2>Fee payment history</h2>{fees.length?<div className="table-scroll"><table className="school-data-table"><thead><tr><th>Paid date</th><th>Amount</th><th>Method</th><th>Receipt</th><th>Status</th></tr></thead><tbody>{fees.map(x=><tr key={x.id}><td>{dateLabel(x.paid_at)}</td><td>{money(x.amount_kes)}</td><td>{x.payment_method}</td><td>{x.receipt_number||"—"}</td><td>{x.status}</td></tr>)}</tbody></table></div>:<p>No fee payments recorded.</p>}</section>}
    {documents.length>0&&<section className="profile-section"><h2>School documents</h2><ul>{documents.map(x=><li key={x.id}>{x.document_type} · {x.original_filename} · {dateLabel(x.created_at)}</li>)}</ul></section>}
  </section><style jsx>{styles}</style></main>;
}
const styles=`
.profile-card{width:min(1100px,100%);max-width:1100px}.profile-card h1{margin:.5rem 0}.profile-subtitle{color:#64748b;margin:.4rem 0 1.25rem}.profile-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.8rem;margin:1.2rem 0}.profile-grid>div{padding:1rem;border:1px solid #e2e8f0;border-radius:12px;display:flex;flex-direction:column;gap:.35rem;min-width:0}.profile-grid small{color:#64748b}.profile-grid strong{overflow-wrap:anywhere}.profile-section{margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e2e8f0}.profile-section h2{font-size:1.1rem;margin:0 0 .8rem}.profile-section select{display:block;width:100%;padding:.8rem;margin:.8rem 0;border:1px solid #cbd5e1;border-radius:10px}.profile-section ul{padding-left:1.2rem}.profile-section li{margin:.4rem 0}.profile-card>.auth-button{margin-top:.5rem}@media(max-width:640px){.profile-card{padding:1rem}.profile-section .table-scroll{max-width:100%;overflow-x:auto}}
`;
