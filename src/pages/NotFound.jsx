import { Home, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md">
        <div className="mb-8">
          <Search className="mx-auto h-24 w-24 text-slate-400" />
        </div>
        <h1 className="mb-4 font-display text-6xl font-bold text-slate-900">404</h1>
        <h2 className="mb-4 font-display text-2xl font-semibold text-slate-700">Page Not Found</h2>
        <p className="mb-8 text-slate-600">
          Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild className="inline-flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="inline-flex items-center gap-2">
            <Link to="/dashboard">
              <Search className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}