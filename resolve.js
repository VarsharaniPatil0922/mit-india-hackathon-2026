const fs = require('fs');
const path = require('path');

const files_keep_theirs = [
    "frontend/index.html",
    "frontend/package-lock.json",
    "frontend/src/context/AuthContext.tsx",
    "frontend/src/pages/Landing.tsx",
    "frontend/src/pages/Login.tsx",
    "frontend/src/pages/OrganizerDashboard.tsx",
    "frontend/src/pages/WorkerDashboard.tsx",
    "frontend/src/pages/CrewSummary.tsx",
    "frontend/src/index.css",
    "frontend/src/App.tsx",
    "frontend/src/components/Navbar.tsx",
    "frontend/package.json"
];

const files_keep_ours = [
    "frontend/src/pages/MatchingResults.tsx"
];

function resolve_file(filepath, keep) {
    const full_path = path.join("c:\\Users\\Sakshi Pathare\\MIT_INDIA_HACKATHON", filepath);
    if (!fs.existsSync(full_path)) return;
        
    const lines = fs.readFileSync(full_path, 'utf8').split('\n');
    const out_lines = [];
    
    let in_ours = false;
    let in_theirs = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("<<<<<<< HEAD")) {
            in_ours = true;
            continue;
        }
        if (line.startsWith("=======")) {
            in_ours = false;
            in_theirs = true;
            continue;
        }
        if (line.startsWith(">>>>>>>")) {
            in_theirs = false;
            continue;
        }
            
        if (keep === "theirs") {
            if (in_ours) continue;
            else out_lines.push(line);
        } else if (keep === "ours") {
            if (in_theirs) continue;
            else out_lines.push(line);
        }
    }

    fs.writeFileSync(full_path, out_lines.join('\n'), 'utf8');
}

files_keep_theirs.forEach(f => resolve_file(f, "theirs"));
files_keep_ours.forEach(f => resolve_file(f, "ours"));
console.log("Done");
