// ------------------------------------------------------
// RISK CLASSIFICATION
// ------------------------------------------------------
function classifyRisk(line) {
    const lower = line.toLowerCase();

    if (
        lower.includes("deadline") ||
        lower.includes("delay") ||
        lower.includes("risk") ||
        lower.includes("critical") ||
        lower.includes("urgent") ||
        lower.includes("miss")
    ) return "high";

    if (
        lower.includes("overwhelmed") ||
        lower.includes("burnout") ||
        lower.includes("stress") ||
        lower.includes("late night") ||
        lower.includes("too many tasks")
    ) return "medium";

    return "low";
}

function riskIcon(level) {
    if (level === "high") return "🟥 ";
    if (level === "medium") return "🟨 ";
    return "🟩 ";
}

// ------------------------------------------------------
// RENDER SECTIONS (EXEC SUMMARY, URGENT, BURNOUT, ETC.)
// ------------------------------------------------------
function renderSection(sectionId, items) {
    const container = document.getElementById(sectionId);
    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerText = "Not found";
        return;
    }

    items.forEach(line => {
        const level = classifyRisk(line);
        const div = document.createElement("div");

        div.innerText = riskIcon(level) + line;

        if (level === "high") div.classList.add("risk-high", "bg-high");
        if (level === "medium") div.classList.add("risk-medium", "bg-medium");
        if (level === "low") div.classList.add("risk-low", "bg-low");

        container.appendChild(div);
    });
}

// ------------------------------------------------------
// WORKLOAD EXTRACTION
// ------------------------------------------------------
function extractWorkload(teamData) {
    const lines = teamData.split("\n").map(l => l.trim());
    const workload = {};

    lines.forEach(line => {
        // Match: "Alice has 5 tasks"
        const match = line.match(/(\w+)\s.*?(\d+)\s+(tasks?|issues?|items?)/i);

        if (match) {
            const person = match[1];
            const count = parseInt(match[2]);

            if (!workload[person]) workload[person] = 0;
            workload[person] += count;
        }

        // Burnout signals add +1 workload
        const burnoutMatch = line.match(/(\w+)\s.*(midnight|overwhelmed|burnout|late)/i);
        if (burnoutMatch) {
            const person = burnoutMatch[1];
            if (!workload[person]) workload[person] = 0;
            workload[person] += 1;
        }
    });

    return workload;
}

// ------------------------------------------------------
// WORKLOAD CHART
// ------------------------------------------------------
let workloadChart = null;

function drawWorkloadChart(workload) {
    const ctx = document.getElementById("workloadChart").getContext("2d");

    if (workloadChart) workloadChart.destroy();

    const labels = Object.keys(workload);
    const values = Object.values(workload);

    workloadChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Workload Units",
                data: values,
                backgroundColor: "#2563eb"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ------------------------------------------------------
// MAIN GENERATE FUNCTION
// ------------------------------------------------------
async function generate() {
    const teamData = document.getElementById("teamInput").value;

    // Reset UI
    document.getElementById("summary").innerHTML = "<span class='loading'>Generating...</span>";
    document.getElementById("urgent").innerHTML = "";
    document.getElementById("burnout").innerHTML = "";
    document.getElementById("deadlines").innerHTML = "";
    document.getElementById("actions").innerHTML = "";
    document.getElementById("trends").innerHTML = "";
    document.getElementById("blindspots").innerHTML = "";
    document.getElementById("riskScoreText").innerHTML = "";
    document.getElementById("deadlinePressureText").innerHTML = "";

    // ------------------------------------------------------
    // EXECUTIVE BRIEFING
    // ------------------------------------------------------
    const res = await fetch("http://127.0.0.1:5000/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamData })
    });

    const data = await res.json();
    const text = data.briefing || "";

    const clean = text.replace(/\*\*/g, "");
    const lines = clean.split("\n").map(l => l.trim());

    let current = null;
    const sections = {
        "EXECUTIVE SUMMARY": [],
        "TOP 3 URGENT ISSUES": [],
        "BURNOUT SIGNALS": [],
        "DEADLINE RISKS": [],
        "RECOMMENDED ACTIONS": []
    };

    for (let line of lines) {
        const upper = line.toUpperCase();
        const key = upper.replace(":", "");

        if (sections.hasOwnProperty(key)) {
            current = key;
            continue;
        }

        if (current && line !== "") {
            sections[current].push(line);
        }
    }

    renderSection("summary", sections["EXECUTIVE SUMMARY"]);
    renderSection("urgent", sections["TOP 3 URGENT ISSUES"]);
    renderSection("burnout", sections["BURNOUT SIGNALS"]);
    renderSection("deadlines", sections["DEADLINE RISKS"]);
    renderSection("actions", sections["RECOMMENDED ACTIONS"]);

    // ------------------------------------------------------
    // TRENDS
    // ------------------------------------------------------
    const trendRes = await fetch("http://127.0.0.1:5000/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamData })
    });

    const trendData = await trendRes.json();
    document.getElementById("trends").innerText = trendData.trends || "No trends detected.";

    // ------------------------------------------------------
    // BLIND SPOTS
    // ------------------------------------------------------
    const blindRes = await fetch("http://127.0.0.1:5000/api/blindspots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamData })
    });

    const blindData = await blindRes.json();
    document.getElementById("blindspots").innerText = blindData.blindspots || "No blind spots detected.";

    // ------------------------------------------------------
    // RISK SCORE
    // ------------------------------------------------------
    const riskRes = await fetch("http://127.0.0.1:5000/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamData })
    });

    const riskData = await riskRes.json();
    let raw = (riskData.score || "").replace(/[^0-9]/g, "");
    let score = parseInt(raw);

    if (isNaN(score)) score = 0;

    document.getElementById("riskScoreText").innerText = score + "/100";

    const fill = document.getElementById("riskMeterFill");
    fill.style.width = score + "%";

    if (score >= 70) fill.style.background = "#d32f2f";
    else if (score >= 40) fill.style.background = "#f57c00";
    else fill.style.background = "#388e3c";

    // ------------------------------------------------------
    // DEADLINE PRESSURE
    // ------------------------------------------------------
    const pressureRes = await fetch("http://127.0.0.1:5000/api/deadline_pressure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamData })
    });

    const pressureData = await pressureRes.json();
    let rawPressure = (pressureData.pressure || "").replace(/[^0-9]/g, "");
    let pressure = parseInt(rawPressure);

    if (isNaN(pressure)) pressure = 50;
    pressure = Math.max(0, Math.min(100, pressure));

    document.getElementById("deadlinePressureText").innerText = pressure + "/100";

    const pressureFill = document.getElementById("deadlineMeterFill");
    pressureFill.style.width = pressure + "%";

    if (pressure >= 70) pressureFill.style.background = "#d32f2f";
    else if (pressure >= 40) pressureFill.style.background = "#f57c00";
    else pressureFill.style.background = "#388e3c";

    // ------------------------------------------------------
    // WORKLOAD GRAPH
    // ------------------------------------------------------
    const workload = extractWorkload(teamData);
    drawWorkloadChart(workload);
}
