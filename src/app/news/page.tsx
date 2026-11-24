"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Post = { id:string; title:string; excerpt:string; content:string; cover_image_url:string|null; published_at:string|null; created_at:string };
export default function NewsPage(){
 const [posts,setPosts]=useState<Post[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{let live=true;(async()=>{
  const supabase=createSupabaseBrowserClient();
  const {data,error}=await supabase.from("school_posts").select("id,title,excerpt,content,cover_image_url,published_at,created_at").eq("status","published").not("published_at","is",null).lte("published_at",new Date().toISOString()).order("published_at",{ascending:false});
  if(!live)return;
  if(error)setError("School news is temporarily unavailable. Please try again later.");
  else setPosts((data??[]) as Post[]);
  setLoading(false);
 })();return()=>{live=false}},[]);
 return <main style={{minHeight:"100vh",background:"#f7f8fb",color:"#172437",fontFamily:"Arial, sans-serif"}}>
  <header style={{background:"#102b4e",color:"white",padding:"22px max(5vw,20px)",borderBottom:"4px solid #c9a34a"}}>
   <p style={{margin:0,color:"#e7c66f",fontSize:12,letterSpacing:2,fontWeight:700}}>ROYAL JUNIOR SCHOOL · KIMILILI</p>
   <h1 style={{margin:"8px 0"}}>School News & Blog</h1>
   <p style={{margin:"0 0 12px"}}>Updates, achievements, learning activities and stories from our school community.</p>
   <Link href="/" style={{color:"white",textDecoration:"underline"}}>← Main website</Link>
  </header>
  <section style={{maxWidth:1000,margin:"30px auto",padding:"0 18px"}}>
   {loading&&<p>Loading school news…</p>}{error&&<p role="alert">{error}</p>}
   {!loading&&!error&&posts.length===0&&<article style={{background:"white",padding:24,borderRadius:12}}><h2>Welcome to our school news page</h2><p>School announcements, events, learner achievements and educational articles will appear here after they are approved and published by the school.</p></article>}
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,300px),1fr))",gap:20}}>
    {posts.map(post=><article key={post.id} style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 5px 20px #102b4e12"}}>
     {post.cover_image_url&&<img src={post.cover_image_url} alt="" style={{width:"100%",height:190,objectFit:"cover"}}/>}
     <div style={{padding:22}}><small style={{color:"#8a6a24"}}>{post.published_at?new Date(post.published_at).toLocaleDateString("en-KE",{day:"numeric",month:"long",year:"numeric"}):""}</small>
      <h2 style={{color:"#102b4e",margin:"8px 0"}}>{post.title}</h2>{post.excerpt&&<p style={{fontWeight:600}}>{post.excerpt}</p>}
      <p style={{whiteSpace:"pre-wrap",lineHeight:1.7}}>{post.content}</p>
     </div>
    </article>)}
   </div>
  </section>
  <footer style={{textAlign:"center",padding:24,color:"#66758a"}}>© {new Date().getFullYear()} Royal Junior School, Kimilili</footer>
 </main>
}
