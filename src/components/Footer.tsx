import { Link } from 'react-router-dom';
import { Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-primary" />
          <span className="font-semibold">CodeCoach</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Empowering the next generation of programmers through innovative assessment technology.
        </p>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
          <Link to="/leaderboard" className="hover:text-primary">Leaderboard</Link>
          <Link to="/analysis" className="hover:text-primary">Analysis</Link>
          <Link to="/developers" className="hover:text-primary">Developers</Link>
          <Link to="/exam" className="hover:text-primary">Examination</Link>
        </div>
        <div className="text-xs text-muted-foreground/70 mt-4">© {new Date().getFullYear()} CodeLab. All rights reserved.</div>
      </div>
    </footer>
  );
}


