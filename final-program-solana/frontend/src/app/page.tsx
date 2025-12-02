import TopNavbar from "@/components/TopNavbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import CapsuleGrid from "@/components/CapsuleGrid";
import CreateWizard from "@/components/CreateWizard";
import { Icon } from "@iconify/react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <TopNavbar />

      <main className="relative z-10 pt-20">
        <div id="hero"><Hero /></div>
        <div id="stats"><Stats /></div>
        <div id="capsules"><CapsuleGrid /></div>
        <div id="create"><CreateWizard /></div>

        {/* Footer */}
        <footer className="w-full border-t border-slate-800 bg-slate-950 py-12 px-6 md:px-16">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500">
              <Icon
                icon="solar:hourglass-bold-duotone"
                className="text-cyan-800"
              />
              <span className="font-mono text-xs">
                © 2026 ROTOR PROTOCOL | Built with ❤️ by _OX1D3
              </span>
            </div>
            <div className="flex gap-6 text-slate-500">
              <a href="https://x.com/_OX1D3" className="hover:text-cyan-400 transition-colors">
                <Icon icon="lucide:twitter" width="18" />
              </a>
              <a href="https://github.com/Luc1d1ty" className="hover:text-cyan-400 transition-colors">
                <Icon icon="lucide:github" width="18" />
              </a>
              <a href="https://linkedin.com/in/mahsn" className="hover:text-cyan-400 transition-colors">
                <Icon icon="lucide:linkedin" width="18" />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
