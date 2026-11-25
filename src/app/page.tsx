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
