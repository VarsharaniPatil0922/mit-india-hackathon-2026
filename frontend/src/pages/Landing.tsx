import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Briefcase, Sparkles, ArrowRight, Camera, 
  Music, Shield, CheckCircle, MapPin, Calendar, 
  Wallet, ShieldCheck, XCircle, LayoutDashboard,
  Clock, Activity, Navigation, Star
} from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Copy & CTAs */}
        <div className="flex-1 w-full text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-widest mb-6 border border-indigo-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED EVENT STAFFING</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Build your perfect <br />
            event crew. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Automatically.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Find the right people for your event based on skills, availability, proximity, budget and reliability — all at once.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link 
              to="/login?type=organizer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
            >
              I'm an Organizer
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link 
              to="/login?type=worker"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200 transition-all shadow-sm text-center flex items-center justify-center gap-2"
            >
              I'm a Worker
            </Link>
          </div>
          
          <div className="mt-8 text-sm font-medium text-slate-500 flex items-center justify-center lg:justify-start gap-2">
            <span>Less manual coordination</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Fewer no-shows</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Better crew fit</span>
          </div>
        </div>

        {/* Right Side: Visual - Dashboard Representation */}
        <div className="flex-1 w-full max-w-lg mx-auto relative lg:mt-0">
          {/* Main Visual Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.07)] border border-slate-100 relative z-10 overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-600" /> AI Crew Match
              </h3>
              <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                Wedding • 24 Aug • Pune
              </div>
            </div>

            {/* Worker Mini Cards */}
            <div className="space-y-3 relative z-10">
              {/* Card 1 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Sarah <span className="text-slate-400 font-normal">Photographer</span></h4>
                    <span className="text-xs font-bold text-amber-500 flex items-center"><Star className="w-3 h-3 fill-current mr-0.5" /> 4.9</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>2.1 km • ₹4,500</span>
                    <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 rounded">Available</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Rahul <span className="text-slate-400 font-normal">Sound Eng.</span></h4>
                    <span className="text-xs font-bold text-amber-500 flex items-center"><Star className="w-3 h-3 fill-current mr-0.5" /> 4.8</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>3.4 km • ₹3,000</span>
                    <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 rounded">Available</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Priya <span className="text-slate-400 font-normal">Security</span></h4>
                    <span className="text-xs font-bold text-amber-500 flex items-center"><Star className="w-3 h-3 fill-current mr-0.5" /> 4.7</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1.8 km • ₹2,000</span>
                    <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 rounded">Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Optimization Visual */}
            <div className="mt-8 bg-indigo-50/50 p-4 rounded-xl border border-indigo-50 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 animate-pulse" /> OPTIMIZING CREW
                </span>
                <div className="w-24 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-indigo-600 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-indigo-700">
                <span className="bg-white px-2 py-1 rounded flex items-center gap-1 shadow-sm"><CheckCircle className="w-3 h-3 text-emerald-500" /> Skill fit</span>
                <span className="bg-white px-2 py-1 rounded flex items-center gap-1 shadow-sm"><CheckCircle className="w-3 h-3 text-emerald-500" /> Availability</span>
                <span className="bg-white px-2 py-1 rounded flex items-center gap-1 shadow-sm"><CheckCircle className="w-3 h-3 text-emerald-500" /> Distance</span>
                <span className="bg-white px-2 py-1 rounded flex items-center gap-1 shadow-sm"><CheckCircle className="w-3 h-3 text-emerald-500" /> Budget</span>
                <span className="bg-white px-2 py-1 rounded flex items-center gap-1 shadow-sm"><CheckCircle className="w-3 h-3 text-emerald-500" /> Reliability</span>
              </div>
            </div>

            {/* Final Match Output */}
            <div className="mt-4 flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div>
                <h4 className="text-sm font-bold text-emerald-900">OPTIMAL CREW</h4>
                <p className="text-xs text-emerald-700 mt-0.5">5 people • ₹18,500 / ₹20,000</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm">
                MATCHED
              </div>
            </div>

          </div>

          {/* Decorative background blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[400px] max-h-[400px] bg-gradient-to-tr from-indigo-200 to-purple-200 blur-3xl opacity-40 -z-10 rounded-full"></div>
        </div>
      </section>

      {/* 2. VALUE STRIP */}
      <section className="border-y border-slate-100 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold tracking-widest text-slate-400 uppercase mb-6">5 factors considered simultaneously</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-slate-600 font-medium">
            <div className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-500" /> Skills</div>
            <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> Availability</div>
            <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-500" /> Distance</div>
            <div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-indigo-500" /> Budget</div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-500" /> Reliability</div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">From event requirement to ready crew</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Our AI engine handles the complex logistics of staffing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[52px] left-12 right-12 h-0.5 bg-slate-100 -z-10"></div>

          {/* STEP 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-indigo-600 mb-6 relative z-10">
              1
            </div>
            <h3 className="font-bold text-slate-900 mb-2">CREATE EVENT</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full">
              <p className="text-xs text-slate-500 font-medium mb-2 text-left">Organizer enters:</p>
              <ul className="text-sm text-slate-700 text-left space-y-1">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-slate-400" /> Event & Date</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-slate-400" /> Location</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-slate-400" /> Budget</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-slate-400" /> Required roles</li>
              </ul>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-indigo-600 mb-6 relative z-10">
              2
            </div>
            <h3 className="font-bold text-slate-900 mb-2">SMART MATCHING</h3>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 w-full">
              <p className="text-xs text-indigo-600 font-bold mb-2 text-left">System filters by:</p>
              <ul className="text-sm text-indigo-900 text-left space-y-1">
                <li className="flex items-center gap-1.5"><Navigation className="w-3 h-3 text-indigo-400" /> Skills</li>
                <li className="flex items-center gap-1.5"><Navigation className="w-3 h-3 text-indigo-400" /> Availability</li>
                <li className="flex items-center gap-1.5"><Navigation className="w-3 h-3 text-indigo-400" /> Distance</li>
              </ul>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-md shadow-indigo-200 flex items-center justify-center font-bold text-white mb-6 relative z-10">
              3
            </div>
            <h3 className="font-bold text-slate-900 mb-2">CREW OPTIMIZATION</h3>
            <div className="bg-indigo-600 p-4 rounded-xl border border-indigo-500 w-full shadow-lg">
              <p className="text-xs text-indigo-200 font-medium mb-2 text-left">Candidates scored on:</p>
              <ul className="text-sm text-white text-left space-y-1">
                <li className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-indigo-300" /> Skill fit</li>
                <li className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-indigo-300" /> Price fit</li>
                <li className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-indigo-300" /> Reliability</li>
                <li className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-indigo-300" /> Proximity</li>
              </ul>
            </div>
          </div>

          {/* STEP 4 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-center font-bold text-emerald-600 mb-6 relative z-10">
              4
            </div>
            <h3 className="font-bold text-slate-900 mb-2">CONFIRM CREW</h3>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 w-full">
              <p className="text-xs text-emerald-700 font-medium mb-2 text-left">Organizer gets:</p>
              <ul className="text-sm text-emerald-900 text-left space-y-1">
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Optimal crew</li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Ranked backups</li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Notifications</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 4. PROBLEM/SOLUTION */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Not just matching people. <br/> We assemble the team.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">This is one of our strongest differentiators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Traditional */}
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-300 mb-6">Traditional event staffing</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-400">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <span>Manual searching</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <span>Spreadsheet coordination</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <span>Last-minute replacements</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <span>Skill mismatch</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <span>No systematic backup</span>
                </li>
              </ul>
            </div>

            {/* CrewConnect */}
            <div className="bg-gradient-to-b from-indigo-900/40 to-slate-800/50 p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.15)]">
              <div className="inline-flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">CrewConnect</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-200">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="font-medium">Multi-factor matching</span>
                </li>
                <li className="flex items-start gap-3 text-slate-200">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="font-medium">Optimized crew</span>
                </li>
                <li className="flex items-start gap-3 text-slate-200">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="font-medium">Ranked backups</span>
                </li>
                <li className="flex items-start gap-3 text-slate-200">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="font-medium">Availability-aware</span>
                </li>
                <li className="flex items-start gap-3 text-slate-200">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="font-medium">Reliability-aware</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTAs SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Organizer CTA */}
        <div id="organizers" className="bg-slate-900 rounded-3xl p-10 flex flex-col justify-between items-start border border-slate-800 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white mb-4">Your event deserves <br/> the right crew.</h2>
            <p className="text-slate-400 mb-8 max-w-sm">
              Tell us what you need. CrewConnect finds the best combination.
            </p>
          </div>
          <Link 
            to="/login?type=organizer"
            className="relative z-10 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
          >
            Create Your Event <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Briefcase className="absolute -bottom-6 -right-6 w-48 h-48 text-white opacity-5 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Worker CTA */}
        <div id="workers" className="bg-indigo-50 rounded-3xl p-10 flex flex-col justify-between items-start border border-indigo-100 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-indigo-900 mb-4">Turn your skills into <br/> opportunities.</h2>
            <p className="text-indigo-700/70 mb-8 max-w-sm font-medium">
              Students, freelancers and local workers can discover event opportunities based on their skills and availability.
            </p>
          </div>
          <Link 
            to="/login?type=worker"
            className="relative z-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-indigo-200"
          >
            Join as a Worker <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Users className="absolute -bottom-6 -right-6 w-48 h-48 text-indigo-600 opacity-5 group-hover:scale-110 transition-transform duration-500" />
        </div>

      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-1">
              <Users className="w-6 h-6 text-indigo-600" />
              <span>CrewConnect</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">AI-powered event staffing</p>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#organizers" className="hover:text-indigo-600 transition-colors">Organizers</a>
            <a href="#workers" className="hover:text-indigo-600 transition-colors">Workers</a>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Login</Link>
          </div>

        </div>
      </footer>

    </div>
  );
};
