const schoolSite = process.env.NODE_ENV === "production"
  ? "/Royal-Junior-School-Kimilili/legacy-school.html"
  : "/legacy-school.html";

export default function HomePage() {
  return (
    <main style={{ width: "100%", minHeight: "100vh", margin: 0 }}>
      <iframe
        title="The Royal Junior School Kimilili website"
        src={schoolSite}
        style={{ display: "block", width: "100%", height: "100vh", minHeight: "100vh", border: 0 }}
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
