import os

files_keep_theirs = [
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
]

files_keep_ours = [
    "frontend/src/pages/MatchingResults.tsx"
]

def resolve_file(filepath, keep="theirs"):
    full_path = os.path.join(r"c:\Users\Sakshi Pathare\MIT_INDIA_HACKATHON", filepath)
    if not os.path.exists(full_path):
        return
        
    with open(full_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    out_lines = []
    in_ours = False
    in_theirs = False
    
    for line in lines:
        if line.startswith("<<<<<<< HEAD"):
            in_ours = True
            continue
        if line.startswith("======="):
            in_ours = False
            in_theirs = True
            continue
        if line.startswith(">>>>>>>"):
            in_theirs = False
            continue
            
        if keep == "theirs":
            if in_ours:
                continue
            else:
                out_lines.append(line)
        elif keep == "ours":
            if in_theirs:
                continue
            else:
                out_lines.append(line)

    with open(full_path, "w", encoding="utf-8") as f:
        f.writelines(out_lines)

for f in files_keep_theirs:
    resolve_file(f, "theirs")
for f in files_keep_ours:
    resolve_file(f, "ours")
