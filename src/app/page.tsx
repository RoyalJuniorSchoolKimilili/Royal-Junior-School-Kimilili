const schoolSite = process.env.NODE_ENV === "production"
  ? "/Royal-Junior-School-Kimilili/legacy-school.html"
  : "/legacy-school.html";

export default function HomePage() {
  return (
    <main style={{ width: "100%", minHeight: "100vh", margin: 0 }}>
      <nav aria-label="School quick links" style={{height:48,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:22,padding:"0 22px",background:"#102b4e",borderBottom:"3px solid #c9a34a"}}>
        <a href="/Royal-Junior-School-Kimilili/news/" style={{color:"white",fontWeight:700}}>News & Blog</a>
        <a href="/Royal-Junior-School-Kimilili/gallery/" style={{color:"white",fontWeight:700}}>Gallery</a>
        <a href="/Royal-Junior-School-Kimilili/events/" style={{color:"white",fontWeight:700}}>Events</a>
        <a href="/Royal-Junior-School-Kimilili/portal/" style={{color:"white",fontWeight:700}}>Staff / Parent Portal</a>
      </nav>
      <iframe
        title="The Royal Junior School Kimilili website"
        src={schoolSite}
        style={{ display: "block", width: "100%", height: "calc(100vh - 136px)", minHeight: "calc(100vh - 136px)", border: 0 }}
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
