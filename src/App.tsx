import { useState } from "react";
import { Ambient, ArticleModal, Footer, Header } from "./components/Chrome";
import { Hero, Pricing, Services, StatsBand } from "./components/Home1";
import { Articles, Contact, Documents, News, Policies, Team } from "./components/Home2";
import type { DocItem } from "./data";

export default function App() {
  const [doc, setDoc] = useState<DocItem | null>(null);

  return (
    <div className="noise relative min-h-screen">
      <Ambient />
      <Header />
      <main className="relative">
        <Hero />
        <StatsBand />
        <Services />
        <Pricing />
        <News onOpen={setDoc} />
        <Articles onOpen={setDoc} />
        <Documents />
        <Team />
        <Policies />
        <Contact />
      </main>
      <Footer />
      <ArticleModal item={doc} onClose={() => setDoc(null)} />
    </div>
  );
}
