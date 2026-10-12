// All of the profile content lives here. Edit this file to update the site.
// Things added from the page itself (new skills, learning entries, personal
// details) are saved in the browser and can be exported from the Personal section.

window.PROFILE_DATA = {
  person: {
    name: "Shraddha Biswas",
    headline: "Compliance & Risk professional moving into AI Governance",
    location: "Hyderabad, Telangana, India",
    email: "shraddhabiswas2723@gmail.com",
    phone: "+91 8639627073",
    linkedin: "https://www.linkedin.com/in/shraddha-biswas-20b2a324a",
    summary:
      "Compliance and operations professional with 3+ years of experience auditing high-volume transactions, " +
      "mitigating operational risk, and enforcing strict policy standards at Amazon. I run root-cause analyses, " +
      "resolve complex seller escalations within tight SLAs, and drive cross-functional process fixes. I'm now " +
      "applying that audit discipline to AI Governance, Responsible AI and Prompt Engineering, including hands-on " +
      "work with Claude and Claude Code.",
  },

  highlights: [
    { value: "150+", label: "transactions and enforcement decisions audited every week" },
    { value: "98%", label: "audit-ready outcome rate on high-risk investigations" },
    { value: "20%", label: "drop in repeat compliance risk from corrective actions" },
    { value: "90%", label: "first-contact resolution as a Technical Support Engineer" },
  ],

  experience: [
    {
      company: "Amazon Development Centre (India)",
      place: "Hyderabad",
      role: "AIT Auditor",
      start: "Jul 2025",
      end: "Mar 2026",
      points: [
        "Audited 150+ high-volume operational transactions and enforcement decisions weekly against SOP compliance standards, finding 5+ critical control gaps.",
        "Investigated high-risk compliance exceptions and account-level risk signals, documenting defensible evidence for a 98% audit-ready outcome rate.",
        "Ran risk-based reviews to detect defect trends and turned compliance metrics into reports for operations leadership.",
        "Led root cause analysis on recurring audit failures with cross-functional teams to close high-risk vulnerabilities.",
      ],
    },
    {
      company: "Amazon Development Centre (India)",
      place: "Hyderabad",
      role: "Account Health Specialist",
      start: "Aug 2024",
      end: "Jun 2025",
      points: [
        "Evaluated complex global account health cases and policy enforcement actions using evidence-based frameworks to decide seller reinstatement.",
        "Investigated high-severity policy violations and recommended corrective and preventive actions that cut repeat compliance risk by 20%.",
        "Resolved critical seller escalations within 24-hour SLAs; decisions were used to update regional SOPs and the knowledge base.",
      ],
    },
    {
      company: "CGS India Pvt. Ltd.",
      place: "Hyderabad",
      role: "Technical Support Engineer",
      start: "Jul 2023",
      end: "Jul 2024",
      points: [
        "Diagnosed and resolved complex technical infrastructure issues with structured troubleshooting, reaching 90% first-contact resolution.",
        "Documented recurring faults in the internal knowledge base, reducing repeat escalations by 15%.",
      ],
    },
    {
      company: "Amazon Development Centre (India)",
      place: "Hyderabad",
      role: "SDS CAP Associate (L2)",
      start: "Sep 2022",
      end: "Dec 2022",
      points: [
        "Supported high-volume logistics and operational compliance workflows against standardised process metrics.",
      ],
    },
  ],

  education: [
    { title: "Bachelor of Computer Applications (BCA)", place: "Jaipur National University", year: "2021" },
    { title: "Intermediate (MPC)", place: "Narayana Junior College", year: "2015" },
    { title: "High School", place: "Sri Vyshnavi Concept School", year: "2013" },
  ],

  project: {
    title: "Analyzing Students' Mental Health",
    tag: "SQL & Data Analysis",
    points: [
      "Wrote SQL with joins, aggregations and filters to clean and validate a large survey dataset, leaving zero incomplete records.",
      "Evaluated correlations across demographic and wellbeing variables and turned the output into evidence-based recommendations.",
    ],
  },

  // Skill catalog. `have: true` means it is on your profile today.
  // Skills with `have: false` are gaps the role matcher knows about.
  skillGroups: [
    { id: "compliance", label: "Compliance & Risk" },
    { id: "data", label: "Data & Reporting" },
    { id: "ai", label: "AI & Automation" },
    { id: "ops", label: "Operations & Support" },
  ],

  skills: [
    { id: "qa", label: "Quality Assurance & Auditing", group: "compliance", have: true, aliases: ["quality assurance", "auditing", "audit", "qa"] },
    { id: "sop", label: "SOP Enforcement", group: "compliance", have: true, aliases: ["sop", "process compliance"] },
    { id: "risk", label: "Risk Assessment", group: "compliance", have: true, aliases: ["risk assessment", "risk analysis"] },
    { id: "regaudit", label: "Regulatory Auditing", group: "compliance", have: true, aliases: ["regulatory audit", "regulatory auditing"] },
    { id: "rca", label: "Root Cause Analysis", group: "compliance", have: true, aliases: ["rca", "root cause"] },
    { id: "amlkyc", label: "AML / KYC Operations", group: "compliance", have: true, aliases: ["aml", "kyc", "anti money laundering"] },
    { id: "policy", label: "Policy Enforcement", group: "compliance", have: true, aliases: ["policy enforcement", "enforcement"] },
    { id: "investigations", label: "Risk Investigations", group: "compliance", have: true, aliases: ["investigation", "investigations"] },
    { id: "sixsigma", label: "Six Sigma (White Belt)", group: "compliance", have: true, aliases: ["six sigma white belt", "white belt"] },
    { id: "regs", label: "DPDP Act & EU AI Act", group: "compliance", have: true, aliases: ["dpdp", "eu ai act", "digital regulations"] },
    { id: "cams", label: "CAMS certification", group: "compliance", have: false, aliases: ["cams", "acams"] },
    { id: "sanctions", label: "Sanctions screening & transaction monitoring", group: "compliance", have: false, aliases: ["sanctions", "transaction monitoring", "actimize", "screening"] },
    { id: "controls", label: "Controls frameworks (SOX, COSO, ISO 27001)", group: "compliance", have: false, aliases: ["sox", "coso", "iso 27001", "internal controls"] },
    { id: "grc", label: "GRC tools (ServiceNow GRC, Archer)", group: "compliance", have: false, aliases: ["grc", "archer", "servicenow grc"] },
    { id: "fraud", label: "Fraud detection patterns", group: "compliance", have: false, aliases: ["fraud", "fraud analytics", "fraud detection"] },
    { id: "moderation", label: "Content moderation & policy writing", group: "compliance", have: false, aliases: ["content moderation", "content policy", "trust and safety"] },
    { id: "greenbelt", label: "Lean Six Sigma Green Belt", group: "compliance", have: false, aliases: ["green belt", "lean six sigma", "lean"] },

    { id: "sql", label: "SQL (joins, aggregations)", group: "data", have: true, aliases: ["sql", "mysql", "postgres"] },
    { id: "excel", label: "Advanced Excel", group: "data", have: true, aliases: ["excel", "vlookup", "pivot tables"] },
    { id: "powerbi", label: "Power BI", group: "data", have: true, aliases: ["power bi", "powerbi"] },
    { id: "analysis", label: "Data Analysis & Reporting", group: "data", have: true, aliases: ["data analysis", "reporting", "data literacy", "business analytics"] },
    { id: "python", label: "Python (pandas)", group: "data", have: false, aliases: ["python", "pandas"] },
    { id: "tableau", label: "Tableau", group: "data", have: false, aliases: ["tableau"] },
    { id: "stats", label: "Statistics basics", group: "data", have: false, aliases: ["statistics", "stats", "a/b testing"] },

    { id: "prompt", label: "Prompt Engineering", group: "ai", have: true, aliases: ["prompt engineering", "prompting", "prompts"] },
    { id: "aigov", label: "AI Governance Frameworks", group: "ai", have: true, aliases: ["ai governance", "governance"] },
    { id: "rai", label: "Responsible AI & AI Safety", group: "ai", have: true, aliases: ["responsible ai", "ai safety", "ai ethics"] },
    { id: "claude", label: "Claude & Claude Code (no-code)", group: "ai", have: true, aliases: ["claude", "claude code", "anthropic"] },
    { id: "automation", label: "AI agents, skills & automations", group: "ai", have: true, aliases: ["ai automation", "automation", "agents", "sub-agents", "skills"] },
    { id: "llmeval", label: "LLM evaluation & red-teaming", group: "ai", have: false, aliases: ["llm evaluation", "red teaming", "red-teaming", "model evaluation", "rlhf"] },
    { id: "nist", label: "NIST AI RMF & ISO 42001", group: "ai", have: false, aliases: ["nist", "ai rmf", "iso 42001", "42001"] },
    { id: "workflow", label: "n8n / Zapier workflows", group: "ai", have: false, aliases: ["n8n", "zapier", "make.com", "power automate"] },

    { id: "escalations", label: "Escalation handling within SLA", group: "ops", have: true, aliases: ["escalations", "sla", "escalation management"] },
    { id: "docs", label: "SOP & knowledge-base writing", group: "ops", have: true, aliases: ["documentation", "knowledge base", "technical writing"] },
    { id: "stakeholders", label: "Cross-functional collaboration", group: "ops", have: true, aliases: ["stakeholder management", "collaboration", "cross functional"] },
    { id: "troubleshooting", label: "Technical troubleshooting", group: "ops", have: true, aliases: ["troubleshooting", "technical support", "it support"] },
  ],

  // Role matcher.
  // exp    = how directly your work history maps to the role (0-100)
  // demand = how many openings Hyderabad typically has for it (0-100)
  // skills = { skillId: weight } where weight 3 = core, 2 = important, 1 = nice to have
  roles: [
    {
      id: "qa-auditor",
      title: "Quality Analyst / Process Auditor",
      exp: 92,
      demand: 85,
      skills: { qa: 3, sop: 3, rca: 2, analysis: 2, excel: 2, docs: 1, sixsigma: 1, greenbelt: 1, stakeholders: 1 },
      why: "Your AIT Auditor role is this job. Weekly SOP audits, control-gap findings and RCA are exactly what ops QA teams hire for.",
      employers: ["Amazon", "Genpact", "Accenture", "Concentrix", "Teleperformance"],
      search: ["Quality Analyst", "Process Auditor", "QA Specialist Operations", "Quality Auditor"],
    },
    {
      id: "trust-safety",
      title: "Trust & Safety / Policy Enforcement Analyst",
      exp: 88,
      demand: 80,
      skills: { policy: 3, investigations: 3, qa: 2, moderation: 2, rca: 1, escalations: 1, sql: 1, rai: 1, analysis: 1 },
      why: "Account Health work is policy enforcement on real cases. Trust & Safety teams value that judgement and the audit trail you kept.",
      employers: ["Amazon", "Accenture (Trust & Safety)", "Genpact", "TaskUs", "Microsoft", "Uber"],
      search: ["Trust and Safety Analyst", "Policy Enforcement Specialist", "Content Policy Analyst", "Integrity Analyst"],
    },
    {
      id: "seller-risk",
      title: "Seller / Account Risk Investigator",
      exp: 90,
      demand: 60,
      skills: { investigations: 3, risk: 3, policy: 2, fraud: 2, sql: 2, rca: 1, docs: 1 },
      why: "You've already investigated account-level risk signals at Amazon. Marketplaces and ride-hailing platforms hire for the same pattern-spotting.",
      employers: ["Amazon", "Uber", "Flipkart", "Genpact"],
      search: ["Risk Investigator", "Seller Risk Analyst", "Account Risk Specialist", "Risk Operations Analyst"],
    },
    {
      id: "compliance-ops",
      title: "Compliance Operations Analyst",
      exp: 80,
      demand: 75,
      skills: { sop: 3, regaudit: 3, risk: 2, docs: 2, qa: 2, excel: 1, grc: 1, regs: 1 },
      why: "SOP enforcement, audit evidence and regulatory awareness (DPDP, EU AI Act) carry straight over to compliance ops desks at GCCs.",
      employers: ["Deloitte", "EY GDS", "Amazon", "Wells Fargo", "HSBC", "Genpact"],
      search: ["Compliance Analyst", "Compliance Operations Associate", "Regulatory Compliance Analyst"],
    },
    {
      id: "aml-kyc",
      title: "AML / KYC Analyst",
      exp: 62,
      demand: 90,
      skills: { amlkyc: 3, investigations: 3, risk: 2, docs: 2, sanctions: 2, cams: 1, excel: 1, sop: 1 },
      why: "Hyderabad is one of India's biggest hubs for bank operations, so openings are plentiful. Your AML certificate and investigation record open the door; banking domain experience is the gap.",
      employers: ["HSBC", "Wells Fargo", "JPMorgan Chase", "Bank of America", "Genpact", "Cognizant", "Deloitte"],
      search: ["KYC Analyst", "AML Analyst", "Financial Crime Analyst", "CDD / EDD Analyst", "Transaction Monitoring Analyst"],
    },
    {
      id: "ai-data-quality",
      title: "AI Data Quality / LLM Evaluation Specialist",
      exp: 65,
      demand: 65,
      skills: { prompt: 3, qa: 3, llmeval: 3, claude: 2, rai: 2, policy: 1, docs: 1 },
      why: "Grading AI outputs against a rubric is auditing. Your QA habits plus prompt engineering and daily Claude use make this the fastest route into AI work.",
      employers: ["Amazon", "Uber (AI Solutions)", "Accenture", "Microsoft", "Genpact"],
      search: ["AI Data Specialist", "LLM Evaluator", "AI Quality Analyst", "Prompt Evaluation Specialist", "AI Trainer"],
    },
    {
      id: "grc",
      title: "Risk & Controls / GRC Analyst",
      exp: 58,
      demand: 70,
      skills: { risk: 3, regaudit: 3, rca: 2, grc: 2, controls: 2, docs: 1, excel: 1, stakeholders: 1 },
      why: "Big 4 and bank GCCs want audit-minded people. Formal controls frameworks (SOX/COSO) and GRC tools are the missing pieces.",
      employers: ["Deloitte", "EY", "KPMG", "PwC", "HSBC", "State Street"],
      search: ["GRC Analyst", "Risk and Controls Analyst", "Operational Risk Analyst", "Internal Audit Associate"],
    },
    {
      id: "ops-analyst",
      title: "Operations / Business Data Analyst",
      exp: 50,
      demand: 80,
      skills: { sql: 3, excel: 3, powerbi: 3, analysis: 3, python: 2, tableau: 1, stats: 1, stakeholders: 1 },
      why: "You already turn compliance metrics into leadership reports. Python and a portfolio of 2 or 3 dashboards would make this a strong option.",
      employers: ["Amazon", "Deloitte", "Genpact", "Accenture", "Novartis", "Microsoft"],
      search: ["Operations Analyst", "MIS Analyst", "Business Analyst", "Reporting Analyst"],
    },
    {
      id: "tech-support",
      title: "Technical Support Engineer",
      fallback: true,
      exp: 82,
      demand: 70,
      skills: { troubleshooting: 3, escalations: 2, docs: 2, rca: 1, stakeholders: 1 },
      why: "You've done this role with strong numbers, so it's a reliable safety net. It moves you away from the compliance and AI direction, so treat it as a backup.",
      employers: ["Microsoft", "Amazon", "Concentrix", "Teleperformance"],
      search: ["Technical Support Engineer", "Technical Support Specialist", "Service Desk Analyst"],
    },
    {
      id: "ai-automation",
      title: "AI Operations / Automation Associate",
      exp: 38,
      demand: 45,
      skills: { claude: 3, automation: 3, prompt: 2, workflow: 2, python: 1, docs: 1, stakeholders: 1, analysis: 1 },
      why: "The Claude Code course gave you agents, skills and automations. Building 2 or 3 real automations you can demo is what turns this into interviews.",
      employers: ["Accenture", "Deloitte", "Genpact", "T-Hub startups"],
      search: ["AI Automation Specialist", "AI Operations Associate", "Automation Analyst", "Generative AI Associate"],
    },
    {
      id: "ai-governance",
      title: "AI Governance / Responsible AI Analyst",
      exp: 42,
      demand: 25,
      skills: { aigov: 3, rai: 3, regs: 3, nist: 3, risk: 2, regaudit: 2, prompt: 1, llmeval: 1, docs: 1 },
      why: "This is your target direction, but Hyderabad has few openings and they usually ask for prior governance or legal experience. Get there via Trust & Safety, AI data quality or compliance first.",
      employers: ["Deloitte", "EY", "KPMG", "PwC", "Microsoft", "Accenture"],
      search: ["AI Governance Analyst", "Responsible AI Analyst", "AI Risk Analyst", "AI Compliance Associate"],
    },
  ],

  learning: [
    {
      title: "Claude Code for Non-Coders (6-hour course)",
      source: "Nate Herk, YouTube",
      date: "2026",
      url: "https://www.youtube.com/watch?v=jdbOVepEtUE",
      note: "From first prompt to building skills, sub-agents, a second brain and automations that run in the cloud, with no coding background.",
      skills: ["claude", "automation", "prompt"],
    },
    {
      title: "AI Governance Frameworks & Safety Compliance",
      source: "Self-study, in progress",
      date: "Mar 2026 – present",
      note: "AI Safety, Responsible AI deployment and emerging regulation, including India's DPDP Act and the EU AI Act.",
      skills: ["aigov", "rai", "regs"],
    },
    { title: "Prompt Engineering Certification", source: "Udemy", date: "", note: "", skills: ["prompt"] },
    { title: "Anti-Money Laundering (AML) & Compliance", source: "Udemy", date: "", note: "", skills: ["amlkyc"] },
    { title: "Data Literacy Professional", source: "DataCamp", date: "", note: "", skills: ["analysis"] },
    { title: "Business Analytics Fundamentals", source: "Udemy", date: "", note: "", skills: ["analysis", "excel"] },
    { title: "Six Sigma White Belt", source: "Certification", date: "", note: "", skills: ["sixsigma"] },
  ],

  // Fields for the Personal section. Values typed on the page are saved in the browser.
  personalFields: [
    { id: "fullName", label: "Full name", value: "Shraddha Biswas" },
    { id: "city", label: "Current city", value: "Hyderabad, Telangana" },
    { id: "email", label: "Email", value: "shraddhabiswas2723@gmail.com" },
    { id: "phone", label: "Phone", value: "+91 8639627073" },
    { id: "linkedin", label: "LinkedIn", value: "https://www.linkedin.com/in/shraddha-biswas-20b2a324a" },
    { id: "dob", label: "Date of birth", value: "" },
    { id: "languages", label: "Languages", value: "" },
    { id: "notice", label: "Notice period", value: "" },
    { id: "currentCtc", label: "Last drawn CTC", value: "" },
    { id: "expectedCtc", label: "Expected CTC", value: "" },
    { id: "workMode", label: "Preferred work mode", value: "" },
    { id: "notes", label: "Notes", value: "", long: true },
  ],
};
