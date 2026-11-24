export default function HomePage() {
  return (
    <main className="page">
      <header className="site-header">
        <div className="brand">
          <span className="crest" aria-hidden="true">RJS</span>
          <div>
            <p className="eyebrow">KIMILILI</p>
            <h1>Royal Junior School</h1>
          </div>
        </div>
        <a className="header-link" href="#portal">School Portal</a>
      </header>

      <section className="hero">
        <p className="eyebrow">WELCOME TO</p>
        <h2>Royal Junior School Kimilili</h2>
        <p className="intro">A foundation for confident, curious and capable learners.</p>
        <a className="primary-link" href="#portal">Portal access</a>
      </section>

      <section className="portal" id="portal">
        <p className="eyebrow">SCHOOL MANAGEMENT</p>
        <h2>School Portal</h2>
        <p>The secure parent, teacher and administration portal is being prepared.</p>
        <p className="notice">Portal access will be enabled after Supabase Auth, account approval and database Row Level Security are configured.</p>
      </section>

      <footer>© {new Date().getFullYear()} Royal Junior School Kimilili</footer>
    </main>
  );
}
