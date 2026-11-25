const schoolSite = process.env.NODE_ENV === "production"
  ? "/Royal-Junior-School-Kimilili/legacy-school.html"
  : "/legacy-school.html";

const portalUrl = "/Royal-Junior-School-Kimilili/portal/";

const loginCards = [
  { title: "Admin Login", description: "School management and full administration access", icon: "🛡️" },
  { title: "Staff Login", description: "Office, accounts and authorised staff services", icon: "💼" },
  { title: "Teachers Login", description: "Classes, attendance and CBE assessments", icon: "📚" },
  { title: "Parents Login", description: "View your own child's school, fee and academic records", icon: "👨‍👩‍👧" },
];

export default function HomePage() {
  return (
    <main style={{ width: "100%", minHeight: "100vh", margin: 0, background: "#f7f5ef" }}>
      <nav aria-label="School quick links" style={{ minHeight: 52, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 22, padding: "10px 18px", background: "#102b4e", borderBottom: "3px solid #c9a34a" }}>
        <a href="/Royal-Junior-School-Kimilili/news/" style={{ color: "white", fontWeight: 700 }}>News & Blog</a>
        <a href="/Royal-Junior-School-Kimilili/gallery/" style={{ color: "white", fontWeight: 700 }}>Gallery</a>
        <a href="/Royal-Junior-School-Kimilili/events/" style={{ color: "white", fontWeight: 700 }}>Events</a>
        <a href={portalUrl} style={{ color: "#ffd36a", fontWeight: 900, textDecoration: "underline", textUnderlineOffset: 5 }}>PORTAL LOGIN</a>
      </nav>

      <section aria-labelledby="admissions-2027-heading" style={{ padding: "clamp(26px,5vw,52px) 18px", background: "linear-gradient(115deg,#f8e8bd 0%,#fffaf0 48%,#e8eef7 100%)", borderBottom: "1px solid #e4d7b9" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(220px,.6fr)", alignItems: "center", gap: 24 }}>
          <div>
            <p style={{ margin: "0 0 8px", color: "#8a5b00", fontSize: 13, fontWeight: 900, letterSpacing: 2 }}>ROYAL JUNIOR SCHOOL KIMILILI</p>
            <h2 id="admissions-2027-heading" style={{ margin: "0 0 10px", color: "#102b4e", fontSize: "clamp(34px,6vw,58px)", lineHeight: 1.02, fontWeight: 950 }}>2027 OPEN<br />ADMISSIONS</h2>
            <p style={{ margin: "0 0 14px", color: "#263b56", fontSize: "clamp(16px,2vw,20px)", fontWeight: 800 }}>Enrolment enquiries are welcome</p>
            <p style={{ margin: "0 0 20px", color: "#43536a", maxWidth: 620, lineHeight: 1.6 }}>Join our learning community. Enquire about admission from Playgroup to Grade 9.</p>
            <a href={portalUrl} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 46, padding: "0 24px", borderRadius: 999, background: "#102b4e", color: "#fff", fontWeight: 900, textDecoration: "none", boxShadow: "0 5px 14px rgba(16,43,78,.2)" }}>ADMISSIONS ENQUIRY →</a>
          </div>
          <div aria-label="2027 admissions information" style={{ minHeight: 190, display: "grid", alignContent: "center", justifyItems: "center", padding: 22, borderRadius: 22, background: "#102b4e", color: "#fff", border: "4px solid #c9a34a", boxShadow: "0 12px 28px rgba(16,43,78,.16)", textAlign: "center" }}>
            <span style={{ color: "#f5d58a", fontSize: 13, fontWeight: 900, letterSpacing: 2 }}>NOW RECEIVING ENQUIRIES</span>
            <strong style={{ margin: "8px 0", fontSize: "clamp(34px,5vw,48px)", lineHeight: 1 }}>2027</strong>
            <span style={{ fontSize: 16, fontWeight: 800 }}>PLAYGROUP – GRADE 9</span>
            <span style={{ marginTop: 12, color: "#e8eef7", fontSize: 12 }}>Kimilili, Kenya</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="portal-heading" style={{ padding: "24px 18px 28px", background: "linear-gradient(135deg,#102b4e,#1b3d68)", borderBottom: "5px solid #c9a34a" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <p style={{ margin: "0 0 6px", color: "#f5d58a", fontWeight: 800, letterSpacing: 2, textAlign: "center", fontSize: 13 }}>ROYAL JUNIOR SCHOOL KIMILILI</p>
          <h1 id="portal-heading" style={{ margin: "0 0 8px", color: "#fff", textAlign: "center", fontSize: "clamp(25px,4vw,36px)", fontWeight: 900 }}>School Portal – Choose Your Login</h1>
          <p style={{ margin: "0 0 20px", color: "#e8eef7", textAlign: "center", fontSize: 15 }}>Secure access for administrators, staff, teachers and parents</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 14 }}>
            {loginCards.map((card) => (
              <a key={card.title} href={portalUrl} style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 100, padding: "18px 20px", borderRadius: 16, background: "#fff", color: "#14294a", border: "2px solid #e8ac2a", boxShadow: "0 5px 16px rgba(0,0,0,.18)", textDecoration: "none" }}>
                <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 52, height: 52, flex: "0 0 52px", borderRadius: 14, background: "#f5edda", fontSize: 28 }}>{card.icon}</span>
                <span style={{ display: "grid", gap: 4 }}>
                  <strong style={{ fontSize: 19, lineHeight: 1.2 }}>{card.title} <span aria-hidden="true">→</span></strong>
                  <span style={{ fontSize: 13, lineHeight: 1.35, color: "#59677a" }}>{card.description}</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: "#8a5b00", letterSpacing: .5 }}>SIGN IN</span>
                </span>
              </a>
            ))}
          </div>
          <p style={{ margin: "15px 0 0", color: "#f7e9c6", textAlign: "center", fontSize: 12 }}>Parent accounts must be approved by the school and securely linked by the administrator to the correct learner(s).</p>
        </div>
      </section>

      <iframe
        title="The Royal Junior School Kimilili website"
        src={schoolSite}
        style={{ display: "block", width: "100%", height: "calc(100vh - 190px)", minHeight: 650, border: 0 }}
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
