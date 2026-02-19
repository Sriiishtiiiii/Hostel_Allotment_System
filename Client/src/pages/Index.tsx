import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isSignedIn, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-900 font-bold text-sm">NIT</span>
          </div>
          <div>
            <p className="font-bold text-sm">NIT Hamirpur</p>
            <p className="text-xs text-blue-200">Hostel Allotment System</p>
          </div>
        </div>
        <div className="flex gap-3">
          {isSignedIn ? (
            <Link to={user?.is_admin ? "/admin/dashboard" : "/student/dashboard"}>
              <Button className="bg-white text-blue-900 hover:bg-blue-50">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-white text-blue-900 hover:bg-blue-50">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-8 py-20 text-center">
        <div className="inline-block px-4 py-1.5 bg-blue-700/50 rounded-full text-blue-200 text-sm mb-6 border border-blue-600/50">
          Academic Year 2024–25
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Hostel Allotment<br />
          <span className="text-blue-300">Made Digital</span>
        </h1>
        <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
          No more standing in queues. CGPA-based priority allotment with transparent
          room selection — built for NIT Hamirpur students.
        </p>
        {!isSignedIn && (
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-base px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-base px-8">
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-8 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10 text-blue-100">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Admin Uploads CSV",
              desc: "Admin imports student data from exam result sheet. Students are sorted by CGPA and added to the system automatically.",
            },
            {
              step: "02",
              title: "Batch Selection",
              desc: "Students are grouped into rounds of ~20 by CGPA order. Each batch gets an activation window to submit preferences.",
            },
            {
              step: "03",
              title: "Room Grid & Allotment",
              desc: "Students pick up to 3 room preferences from a live 2D hostel grid. Highest CGPA wins when conflicts arise.",
            },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="text-4xl font-bold text-blue-400 mb-3">{step}</div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-blue-200 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 text-center py-6 text-blue-300 text-sm">
        National Institute of Technology, Hamirpur — Hostel Management Cell
      </div>
    </div>
  );
};

export default Index;
