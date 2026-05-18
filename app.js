import { domains, examSets, baseQuestions, guideTopics, acronymRows, ports, pbqs, controls } from './data.js';
const { useEffect, useMemo, useState } = React;

const EXAM_DATE = new Date("2026-05-20T09:00:00");
const STORAGE_KEY = "sy701-react-progress-v1";
const LEGACY_PROGRESS_KEY = "sy701-progress";
const ALL_FILTER = "all";
const PORT_QUESTION_SECONDS = 10;
const EXAM_DURATION_SECONDS = 90 * 60;
const EXAM_DOMAIN_COUNTS = { "1": 11, "2": 20, "3": 16, "4": 25, "5": 18 };


function buildGuideQuestions(topics) {
  const templates = [
    {
      type: "definition",
      prompt: (topic, concept) => `Which statement BEST describes ${concept.term}?`,
      correct: (concept) => concept.summary,
      explanation: (topic, concept) => `${concept.term}: ${concept.summary} A l'examen, retiens surtout: ${concept.examUse}.`
    },
    {
      type: "scenario",
      prompt: (topic, concept) => `A security analyst is studying ${topic.title.toLowerCase()}. Which choice is MOST directly associated with ${concept.examUse}?`,
      correct: (concept) => concept.correct,
      explanation: (topic, concept) => `Le signal cle est ${concept.examUse}. La meilleure association est ${concept.correct}, car ${concept.summary.toLowerCase()}`
    },
    {
      type: "control",
      prompt: (topic, concept) => `Which option is the BEST exam answer when a scenario requires the concept of ${concept.term}?`,
      correct: (concept) => concept.correct,
      explanation: (topic, concept) => `${concept.correct} est le choix attendu pour ${concept.term}. ${concept.summary}`
    },
    {
      type: "compare",
      prompt: (topic, concept) => `In the context of ${topic.title}, which term should be selected over closely related distractors for ${concept.examUse}?`,
      correct: (concept) => concept.term,
      explanation: (topic, concept) => `Le contexte pointe vers ${concept.term}. Les distracteurs proches appartiennent au meme domaine mais ne correspondent pas aussi directement au scenario.`
    },
    {
      type: "mini-case",
      prompt: (topic, concept, index) => `Scenario ${topic.section}.${index + 1}: A company must ${concept.examUse}. What is the MOST appropriate answer?`,
      correct: (concept) => concept.correct,
      explanation: (topic, concept) => `Dans ce mini-cas, l'indice important est "${concept.examUse}". Cela correspond a ${concept.correct}.`
    }
  ];
  const questions = [];
  topics.forEach((topic) => {
    topic.concepts.forEach((concept, conceptIndex) => {
      templates.forEach((template, templateIndex) => {
        const correct = template.correct(concept);
        const distractors = getGuideDistractors(topics, topic, concept, correct, template.type, conceptIndex + templateIndex);
        const options = [correct, ...distractors].slice(0, 4);
        questions.push(q(
          `sg-s${topic.section}-${String(conceptIndex + 1).padStart(2, "0")}-${templateIndex + 1}`,
          topic.domain,
          topic.objective,
          template.prompt(topic, concept, conceptIndex),
          options,
          0,
          template.explanation(topic, concept),
          template.type !== "definition",
          { sourceSection: topic.section, sourceTitle: topic.title, questionType: template.type, difficulty: guideDifficulty(templateIndex, conceptIndex) }
        ));
      });
    });
  });
  return questions;
}

function guideDifficulty(templateIndex, conceptIndex) {
  if (templateIndex === 0) return "easy";
  if ((templateIndex + conceptIndex) % 3 === 0) return "hard";
  return "medium";
}

function getGuideDistractors(topics, topic, concept, correct, type, seed) {
  const sameTopic = topic.concepts.flatMap((item) => [item.term, item.correct]).filter(Boolean);
  const sameDomain = topics.filter((item) => item.domain === topic.domain).flatMap((item) => item.concepts.flatMap((concept) => [concept.term, concept.correct]));
  const definitionPool = topics.filter((item) => item.domain === topic.domain).flatMap((item) => item.concepts.map((concept) => concept.summary));
  const otherSecurityTerms = [
    "Confidentiality", "Integrity", "Availability", "Accounting", "Authorization", "Authentication",
    "Segmentation", "Encryption", "Tokenization", "Audit", "Incident response", "Risk transfer",
    "Patch management", "SIEM", "CASB", "Zero trust", "DLP", "MFA", "PKI", "WAF", "NAC", "SOC 2"
  ];
  const pool = type === "definition" ? definitionPool : [...sameDomain, ...sameTopic, ...otherSecurityTerms];
  return deterministicShuffle([...new Set(pool)].filter((item) => item && item !== correct && item !== concept.summary), seed + stableScore(`${topic.section}-${concept.term}`, seed)).slice(0, 3);
}

function buildQuestionBank(existing) {
  const targetPerDomain = 160;
  const targetPerObjective = 100;
  const bank = [...existing];
  const objectives = [...new Set(bank.map((item) => item.objective))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  objectives.forEach((objective) => {
    let count = bank.filter((item) => item.objective === objective).length;
    let index = 1;
    while (count < targetPerObjective) {
      bank.push(createObjectiveSupplementQuestion(objective, index));
      count += 1;
      index += 1;
    }
  });
  domains.forEach((domain) => {
    let count = bank.filter((item) => item.domain === domain.id).length;
    let index = 1;
    while (count < targetPerDomain) {
      bank.push(createSupplementQuestion(domain.id, index));
      count += 1;
      index += 1;
    }
  });
  return bank;
}

function createObjectiveSupplementQuestion(objective, index) {
  const domain = objective.split(".")[0];
  const relatedTopics = guideTopics.filter((topic) => topic.objective === objective);
  const concepts = relatedTopics.flatMap((topic) => topic.concepts.map((concept) => ({ topic, concept })));
  const fallbackConcepts = getObjectiveFallbackConcepts(domain, objective).map((term) => ({
    topic: { section: `obj-${objective}`, title: getObjectiveStudyArea(objective), domain, objective, concepts: [c(term, describeFallbackConcept(term), `solve a scenario involving ${term}`, term)] },
    concept: c(term, describeFallbackConcept(term), `solve a scenario involving ${term}`, term)
  }));
  const pool = concepts.length ? concepts : fallbackConcepts;
  const selected = pool[(index - 1) % pool.length];
  const cycle = Math.ceil(index / Math.max(1, pool.length));
  const variant = (index - 1) % 8;
  const term = selected.concept.term;
  const summary = selected.concept.summary;
  const examUse = selected.concept.examUse;
  const correct = selected.concept.correct || term;
  const title = selected.topic.title.toLowerCase();
  const describedTerm = /^[aeiou]/i.test(term) ? `an ${term}` : `the ${term}`;
  const prompts = [
    `Which statement BEST describes ${describedTerm}?`,
    `A security analyst is reviewing ${title}. Which option BEST supports the requirement to ${examUse}?`,
    `Which choice BEST matches a scenario involving ${term}?`,
    `A company needs to ${examUse}. Which response is MOST appropriate?`,
    `Which statement is MOST accurate about ${term}?`,
    `During a security review, which option is MOST directly associated with this requirement: ${summary}?`,
    `Which answer is the BEST differentiator for ${term} compared with related security concepts?`,
    `A security team is validating a control decision related to ${term}. Which item is the BEST fit?`
  ];
  const correctByVariant = [
    correct,
    correct,
    term,
    correct,
    summary,
    correct,
    term,
    correct
  ];
  const answerText = correctByVariant[variant];
  const distractors = getGuideDistractors(guideTopics, selected.topic, selected.concept, answerText, variant === 4 ? "definition" : "scenario", index)
    .concat(getPlausibleDistractors(domain, objective, answerText, index + 31))
    .filter((item) => item !== answerText);
  const options = [answerText, ...[...new Set(distractors)].slice(0, 3)];
  while (options.length < 4) options.push(`Related control ${options.length + 1}`);
  return q(
    `obj-${objective.replace(".", "-")}-${String(index).padStart(3, "0")}`,
    domain,
    objective,
    prompts[variant],
    options,
    0,
    `${term} est le signal attendu. ${summary} Dans ce type de question, l'indice principal est: ${examUse}.`,
    variant !== 0 && variant !== 4,
    {
      sourceSection: selected.topic.section,
      sourceTitle: selected.topic.title,
      questionType: ["definition", "scenario", "comparison", "mini-case", "definition", "analysis", "compare", "scenario"][variant],
      difficulty: variant === 0 || variant === 4 ? "easy" : (variant % 3 === 0 ? "hard" : "medium")
    }
  );
}

function getObjectiveStudyArea(objective) {
  const areas = {
    "1.1": "fundamental security concepts",
    "1.2": "identity and access management",
    "1.3": "authorization and access design",
    "1.4": "cryptographic solutions",
    "1.5": "data protection concepts",
    "2.1": "threat actors and attack vectors",
    "2.2": "vulnerability management",
    "2.3": "malware and malicious indicators",
    "2.4": "application vulnerabilities",
    "2.5": "password and web attacks",
    "2.6": "threat intelligence",
    "2.7": "threat hunting",
    "3.1": "enterprise network architecture",
    "3.2": "cloud and zero trust architecture",
    "3.3": "data security architecture",
    "3.4": "resiliency and recovery",
    "3.5": "network access and segmentation",
    "3.6": "cryptographic implementations",
    "3.9": "secure protocols",
    "4.1": "incident response",
    "4.2": "logging and monitoring",
    "4.3": "endpoint and mobile security",
    "4.4": "change and configuration management",
    "4.5": "network analysis and scanning",
    "4.6": "authentication and network operations",
    "4.8": "ports and protocols",
    "5.1": "risk management",
    "5.2": "data governance and privacy",
    "5.3": "audit and assurance",
    "5.4": "governance documentation",
    "5.5": "third-party risk management"
  };
  return areas[objective] || "security operations";
}

function describeFallbackConcept(term) {
  const descriptions = {
    "CIA triad": "The CIA triad balances confidentiality, integrity, and availability for information assets.",
    "DAD triad": "The DAD triad describes attacker goals: disclosure, alteration, and denial.",
    "control category": "Control categories describe whether safeguards are technical, operational, or managerial.",
    "control function": "Control functions describe whether safeguards prevent, detect, correct, deter, or compensate.",
    "defense in depth": "Defense in depth layers independent controls so one failure does not expose the whole environment.",
    "IAM": "IAM manages identification, authentication, authorization, and auditing of users and services.",
    "MFA": "MFA combines different authentication factors to reduce account takeover risk.",
    "SSO": "SSO lets a user authenticate once and access compatible services without repeated logins.",
    "RBAC": "RBAC grants permissions through job roles or groups rather than direct user assignment.",
    "PAM": "PAM protects privileged accounts using controls such as vaulting, JIT elevation, and monitoring.",
    "Kerberos": "Kerberos uses tickets and a KDC to provide single sign-on in many enterprise networks.",
    "least privilege": "Least privilege grants only the access needed for a role or task.",
    "separation of duties": "Separation of duties splits sensitive responsibilities across multiple people.",
    "job rotation": "Job rotation moves employees through duties to reduce fraud and expose process gaps.",
    "mandatory vacation": "Mandatory vacation can reveal fraud because another person performs the absent user's tasks.",
    "privilege creep": "Privilege creep occurs when users retain old access after role changes.",
    "hashing": "Hashing creates a fixed digest used to verify integrity and protect stored passwords.",
    "encryption": "Encryption converts plaintext to ciphertext so unauthorized parties cannot read it.",
    "digital signature": "A digital signature supports integrity, authentication, and non-repudiation.",
    "PKI": "PKI binds identities to public keys through certificates and certificate authorities.",
    "certificate lifecycle": "The certificate lifecycle includes request, validation, issuance, renewal, revocation, and expiration.",
    "data classification": "Data classification labels information so protection matches sensitivity.",
    "data at rest": "Data at rest is stored data, such as files on disks or cloud storage.",
    "data in transit": "Data in transit is data moving across a network.",
    "tokenization": "Tokenization replaces sensitive data with a token stored separately from the original value.",
    "data masking": "Data masking hides part or all of a sensitive value from unauthorized viewers.",
    "threat actor": "A threat actor is an entity with intent and capability to cause harm.",
    "attack vector": "An attack vector is the path or method used to exploit a target.",
    "social engineering": "Social engineering manipulates trust, fear, curiosity, or urgency to obtain access.",
    "phishing": "Phishing uses deceptive messages to steal credentials or deliver malicious links.",
    "insider threat": "An insider threat comes from someone with authorized access who misuses it intentionally or accidentally.",
    "vulnerability scan": "A vulnerability scan identifies known weaknesses and configuration issues.",
    "CVE": "CVE is a standardized identifier for publicly known vulnerabilities.",
    "CVSS": "CVSS communicates vulnerability severity and characteristics.",
    "patch management": "Patch management tests and deploys updates to reduce exposure.",
    "remediation": "Remediation fixes or mitigates a vulnerability based on risk and priority.",
    "malware indicator": "A malware indicator is evidence such as unusual files, processes, traffic, or registry changes.",
    "ransomware": "Ransomware encrypts or blocks access to data and demands payment.",
    "rootkit": "A rootkit hides malicious activity while maintaining privileged access.",
    "keylogger": "A keylogger records keystrokes to capture sensitive information.",
    "process analysis": "Process analysis reviews running processes, resource use, and behavior for suspicious activity.",
    "SQL injection": "SQL injection occurs when unsanitized input is interpreted as a database command.",
    "XSS": "XSS injects script into web pages viewed by other users.",
    "CSRF": "CSRF tricks an authenticated browser into submitting an unwanted request.",
    "directory traversal": "Directory traversal uses path manipulation to access files outside the intended web root.",
    "SSRF": "SSRF makes a server send attacker-controlled requests to internal or external services."
  };
  return descriptions[term] || `${term} is a practical Security+ concept that appears in scenario, comparison, or remediation questions.`;
}

function getObjectiveFallbackConcepts(domain, objective) {
  const objectivePools = {
    "1.1": ["CIA triad", "DAD triad", "control category", "control function", "defense in depth"],
    "1.2": ["IAM", "MFA", "SSO", "RBAC", "PAM", "Kerberos"],
    "1.3": ["least privilege", "separation of duties", "job rotation", "mandatory vacation", "privilege creep"],
    "1.4": ["hashing", "encryption", "digital signature", "PKI", "certificate lifecycle"],
    "1.5": ["data classification", "data at rest", "data in transit", "tokenization", "data masking"],
    "2.1": ["threat actor", "attack vector", "social engineering", "phishing", "insider threat"],
    "2.2": ["vulnerability scan", "CVE", "CVSS", "patch management", "remediation"],
    "2.3": ["malware indicator", "ransomware", "rootkit", "keylogger", "process analysis"],
    "2.4": ["SQL injection", "XSS", "CSRF", "directory traversal", "SSRF"],
    "2.5": ["password attack", "privilege escalation", "replay attack", "SSL stripping", "API abuse"],
    "2.6": ["threat intelligence", "STIX", "TAXII", "OSINT", "IoC"],
    "2.7": ["threat hunting", "hypothesis", "baseline", "anomaly", "behavior analytics"],
    "3.1": ["segmentation", "DMZ", "firewall", "NIDS", "microsegmentation"],
    "3.2": ["IaaS", "PaaS", "SaaS", "CASB", "shared responsibility"],
    "3.3": ["DLP", "encryption", "tokenization", "privacy control", "classification label"],
    "3.4": ["backup", "RAID", "hot site", "replication", "fault tolerance"],
    "3.5": ["VLAN", "NAC", "wireless security", "802.1X", "VPN"],
    "3.6": ["symmetric encryption", "asymmetric encryption", "hashing", "salting", "key stretching"],
    "3.9": ["TLS", "SSH", "IPsec", "SFTP", "LDAPS"],
    "4.1": ["preparation", "containment", "eradication", "recovery", "lessons learned"],
    "4.2": ["SIEM", "syslog", "NetFlow", "metadata", "correlation rule"],
    "4.3": ["endpoint hardening", "EDR", "sandboxing", "MDM", "remote wipe"],
    "4.4": ["change request", "rollback plan", "configuration baseline", "IaC", "approval"],
    "4.5": ["packet capture", "TAP", "SPAN", "vulnerability scanner", "protocol analyzer"],
    "4.6": ["RADIUS", "TACACS+", "Kerberos", "LDAP", "SAML"],
    "4.8": ["DNS", "SMTP", "HTTPS", "SMB", "RDP"],
    "5.1": ["risk register", "SLE", "ALE", "risk transfer", "BIA"],
    "5.2": ["data owner", "data steward", "data custodian", "DPO", "data processor"],
    "5.3": ["audit", "assessment", "evidence", "SOC 2", "gap analysis"],
    "5.4": ["policy", "standard", "procedure", "AUP", "SLA"],
    "5.5": ["vendor assessment", "MOU", "NDA", "right to audit", "third-party risk"]
  };
  return objectivePools[objective] || [`Domain ${domain} objective ${objective}`, "security control", "risk decision", "monitoring activity", "secure configuration"];
}

function createSupplementQuestion(domain, index) {
  const pools = {
    "1": [
      ["1.1", "A company is classifying controls. Which control is BEST described as preventing an event before it occurs?", ["Preventive control", "Detective control", "Corrective control", "Recovery point objective"], 0, "Un controle preventif agit avant l'evenement. Detective signale, corrective repare, et RPO concerne la perte de donnees acceptable."],
      ["1.1", "Which concept BEST preserves access to systems when users need them?", ["Availability", "Integrity", "Confidentiality", "Non-repudiation"], 0, "La disponibilite garantit que les systemes restent accessibles. L'integrite protege contre la modification. La confidentialite protege contre la divulgation."],
      ["1.2", "A security analyst requires a password, a smart card, and a fingerprint. Which concept is MOST represented?", ["MFA", "SSO", "Federation", "Accounting"], 0, "MFA combine plusieurs facteurs. SSO simplifie la connexion. Federation partage l'identite. Accounting journalise les actions."],
      ["1.2", "Which authentication factor is represented by a hardware token?", ["Something you have", "Something you know", "Something you are", "Somewhere you are"], 0, "Un token est quelque chose que l'utilisateur possede. Un mot de passe est connu, la biometrie est inherente, la localisation indique l'endroit."],
      ["1.3", "Which practice BEST reduces fraud by requiring two people to complete a sensitive task?", ["Separation of duties", "Job rotation", "Least functionality", "Data masking"], 0, "La separation des taches empeche une seule personne de controler tout le processus. Les autres choix traitent d'autres risques."],
      ["1.4", "Which data state describes information stored on a hard drive?", ["Data at rest", "Data in transit", "Data in use", "Data in motion"], 0, "Les donnees stockees sont at rest. En transit signifie sur le reseau. In use signifie traitees activement."],
      ["1.5", "Which mechanism BEST proves a sender cannot deny sending a signed message?", ["Digital signature", "Symmetric key", "NAT", "VLAN"], 0, "Une signature numerique soutient la non-repudiation. Les autres choix ne prouvent pas l'auteur du message."]
    ],
    "2": [
      ["2.1", "A company receives a text message asking users to verify payroll credentials. Which attack is MOST likely?", ["Smishing", "Vishing", "Pharming", "Tailgating"], 0, "Le smishing est du phishing par SMS. Vishing utilise la voix. Pharming redirige vers un faux site. Tailgating est physique."],
      ["2.1", "Which threat actor is MOST likely to be funded by a nation-state and maintain long-term access?", ["APT", "Script kiddie", "Insider user", "Competitor sales team"], 0, "Un APT est avance, persistant et souvent finance. Un script kiddie a peu de competences. Les autres choix ne correspondent pas aussi bien."],
      ["2.2", "A security analyst discovers a service running with default credentials. Which mitigation should be performed FIRST?", ["Change default passwords", "Disable all logging", "Open the service to the Internet", "Remove MFA"], 0, "Changer les identifiants par defaut retire une faiblesse immediate. Les autres choix reduisent la securite."],
      ["2.3", "Which indicator is MOST associated with data exfiltration through DNS?", ["Large encoded DNS queries", "Successful local print jobs", "Normal NTP sync", "Low disk fragmentation"], 0, "Des requetes DNS longues ou encodees peuvent indiquer un tunneling/exfiltration. Les autres evenements sont normaux."],
      ["2.4", "A web app fails to validate user input before database queries. Which attack is MOST likely?", ["SQL injection", "Evil twin", "Bluejacking", "RFID cloning"], 0, "L'injection SQL exploite une entree non validee utilisee dans une requete. Les autres attaques ne ciblent pas directement SQL."],
      ["2.5", "Which mitigation BEST reduces impact from credential stuffing?", ["MFA and password reuse monitoring", "Open guest Wi-Fi", "Disable account lockout", "Use shared passwords"], 0, "MFA et detection de reutilisation limitent le credential stuffing. Les autres choix augmentent le risque."],
      ["2.7", "Which source is BEST for learning attacker tactics, techniques, and procedures?", ["ATT&CK knowledge base", "Printer queue", "HVAC manual", "Asset disposal bin"], 0, "ATT&CK documente tactiques, techniques et procedures. Les autres sources ne donnent pas ce renseignement de menace."]
    ],
    "3": [
      ["3.1", "Which design BEST separates public web servers from internal databases?", ["DMZ with segmentation", "Flat network", "Shared admin account", "Disabled firewall"], 0, "Une DMZ segmente les services publics du reseau interne. Un reseau plat et les autres choix augmentent l'exposition."],
      ["3.1", "A company wants cloud access security for SaaS sharing and visibility. Which solution is BEST?", ["CASB", "RAID", "POTS", "PBX"], 0, "Un CASB fournit visibilite et controle sur les usages SaaS. Les autres choix ne sont pas destines a ce besoin cloud."],
      ["3.2", "Which model gives a provider responsibility for the application, platform, and infrastructure?", ["SaaS", "IaaS", "Private rack", "Bare metal"], 0, "SaaS fournit l'application complete geree par le fournisseur. IaaS laisse plus de responsabilites au client."],
      ["3.3", "Which control BEST protects data copied to removable media?", ["Encryption", "Telnet", "Open relay", "Default VLAN"], 0, "Le chiffrement protege les donnees sur support amovible. Les autres choix ne protegent pas le contenu."],
      ["3.4", "Which backup type saves all selected data every time?", ["Full backup", "Incremental backup", "Differential backup", "Snapshot metadata only"], 0, "Une sauvegarde complete copie tout. Incremental copie depuis la derniere sauvegarde. Differential copie depuis la derniere complete."],
      ["3.5", "Which technology creates logical segmentation on a switch?", ["VLAN", "NTP", "SMTP", "SNMP trap"], 0, "Un VLAN segmente logiquement un switch. NTP, SMTP et SNMP ne creent pas cette segmentation."],
      ["3.9", "Which protocol is commonly used to securely administer network devices from a command line?", ["SSH", "Telnet", "HTTP", "TFTP"], 0, "SSH fournit une administration chiffree. Telnet et HTTP ne sont pas adaptes pour une administration securisee. TFTP est simple et non chiffre."]
    ],
    "4": [
      ["4.1", "A security analyst confirms malware on a workstation. What should be done FIRST to limit spread?", ["Isolate the host", "Delete evidence", "Disable EDR", "Publish credentials"], 0, "L'isolation limite la propagation et preserve l'analyse. Les autres choix nuisent a la reponse."],
      ["4.2", "Which tool is BEST for centralized log correlation?", ["SIEM", "DHCP", "RAID", "WEP"], 0, "Un SIEM centralise et correle les journaux. Les autres choix ne remplissent pas ce role."],
      ["4.3", "Which activity BEST validates that a restored server is clean before production use?", ["Scan and test from known-good backup", "Disable logs", "Use the infected image", "Skip patches"], 0, "Scanner et tester une sauvegarde saine limite la reinfection. Les autres choix gardent ou augmentent le risque."],
      ["4.4", "Which item is MOST important before implementing a production change?", ["Approved rollback plan", "Shared root password", "No documentation", "Disabled monitoring"], 0, "Un plan de retour arriere approuve reduit le risque. Les autres choix affaiblissent le controle."],
      ["4.5", "Which tool captures packets for later analysis?", ["Protocol analyzer", "Password policy", "Risk register", "Data owner"], 0, "Un analyseur de protocole capture les paquets. Les autres choix ne capturent pas le trafic."],
      ["4.6", "Which service is commonly used for AAA with VPN and 802.1X?", ["RADIUS", "HTTP", "POP3", "IMAP"], 0, "RADIUS est utilise pour AAA avec VPN et 802.1X. HTTP/POP3/IMAP sont d'autres services applicatifs."],
      ["4.8", "Which protocol is MOST associated with TCP 445?", ["SMB", "RDP", "SSH", "Kerberos"], 0, "SMB utilise TCP 445. RDP utilise 3389, SSH 22, Kerberos 88."]
    ],
    "5": [
      ["5.1", "Which term describes risk remaining after controls are applied?", ["Residual risk", "Inherent risk only", "Zero risk", "Threat feed"], 0, "Le risque residuel reste apres les controles. Le risque zero n'existe pas en pratique."],
      ["5.1", "Which value is calculated as asset value multiplied by exposure factor?", ["SLE", "ALE", "ARO", "RTO"], 0, "SLE = valeur de l'actif x facteur d'exposition. ALE = SLE x ARO. RTO est le delai de reprise."],
      ["5.2", "Who is MOST responsible for classifying data and defining protection requirements?", ["Data owner", "Guest user", "External auditor only", "Help desk queue"], 0, "Le proprietaire des donnees definit classification et exigences. Les autres roles ne portent pas cette responsabilite principale."],
      ["5.3", "Which activity BEST verifies that controls meet regulatory requirements?", ["Audit", "War driving", "Packet flooding", "DNS tunneling"], 0, "Un audit verifie les controles et la conformite. Les autres choix sont des attaques ou activites techniques non equivalentes."],
      ["5.4", "Which document is broad and defines desired security outcomes?", ["Policy", "Procedure", "Packet capture", "Exploit"], 0, "Une policy est large et directionnelle. Une procedure est detaillee et etape par etape."],
      ["5.4", "Which agreement defines expected service uptime and response time?", ["SLA", "NDA", "MOU", "AUP"], 0, "Un SLA definit les niveaux de service. NDA couvre confidentialite. MOU est souvent non contraignant. AUP definit l'utilisation acceptable."],
      ["5.5", "Which process BEST addresses security risk from vendors?", ["Third-party risk management", "Disabling contracts", "Shared vendor passwords", "No monitoring"], 0, "La gestion des risques tiers evalue et controle les fournisseurs. Les autres choix augmentent l'exposition."]
    ]
  };
  const pool = pools[domain];
  const item = pool[(index - 1) % pool.length];
  const cycle = Math.ceil(index / pool.length);
  const [objective, prompt, options, answer, explanationFr] = item;
  const correct = options[answer];
  const hardenedOptions = [correct, ...getPlausibleDistractors(domain, objective, correct, index)];
  const scenario = prompt.startsWith("A company") || prompt.startsWith("A security analyst");
  const suffix = cycle > 1 ? ` Scenario set ${cycle}.` : "";
  return q(`d${domain}-extra-${index}`, domain, objective, `${prompt}${suffix}`, hardenedOptions, 0, explanationFr, scenario);
}

function getPlausibleDistractors(domain, objective, correct, seed) {
  const byObjective = {
    "1.1": ["Confidentiality", "Integrity", "Availability", "Non-repudiation", "Preventive control", "Detective control", "Corrective control", "Deterrent control"],
    "1.2": ["MFA", "SSO", "Federation", "Accounting", "Something you know", "Something you have", "Something you are", "Somewhere you are"],
    "1.3": ["Separation of duties", "Job rotation", "Least privilege", "Least functionality", "Privilege creep", "Mandatory vacation"],
    "1.4": ["Data at rest", "Data in transit", "Data in use", "Data classification", "Tokenization", "Data masking"],
    "1.5": ["Digital signature", "Hash digest", "Certificate", "Symmetric key", "Timestamp", "Audit log"],
    "2.1": ["Smishing", "Vishing", "Pharming", "Tailgating", "APT", "Script kiddie", "Ransomware", "Rootkit", "Worm", "Trojan", "RAT"],
    "2.2": ["Change default passwords", "Patch vulnerable services", "Disable unnecessary services", "Enable MFA", "Segment the network", "Quarantine the host"],
    "2.3": ["Large encoded DNS queries", "Beaconing", "Unexpected outbound traffic", "New admin account", "Encrypted file extensions", "High authentication failures"],
    "2.4": ["SQL injection", "Cross-site scripting", "CSRF", "Directory traversal", "Buffer overflow", "Command injection"],
    "2.5": ["MFA and password reuse monitoring", "Account lockout", "Conditional access", "User awareness training", "Email filtering", "Least privilege"],
    "2.7": ["ATT&CK knowledge base", "Threat intelligence feed", "IoC list", "OSINT report", "SIEM correlation", "Vulnerability advisory"],
    "3.1": ["DMZ with segmentation", "CASB", "SASE", "VLAN segmentation", "WAF", "Zero trust architecture", "Network ACL"],
    "3.2": ["SaaS", "IaaS", "PaaS", "Private cloud", "Hybrid cloud", "Community cloud", "SECaaS"],
    "3.3": ["Encryption", "DLP", "Tokenization", "Data masking", "FDE", "Access control list", "Classification label"],
    "3.4": ["Full backup", "Incremental backup", "Differential backup", "Snapshot", "Hot site", "Warm site", "Cold site", "RAID 10"],
    "3.5": ["VLAN", "Subnet", "ACL", "Firewall rule", "NAC", "802.1X", "Microsegmentation"],
    "3.9": ["SSH", "TLS", "IPSec", "PKI", "OCSP", "CRL", "RSA", "AES", "Digital signature"],
    "4.1": ["Isolate the host", "Containment", "Eradication", "Recovery", "Lessons learned", "Preserve evidence"],
    "4.2": ["SIEM", "Syslog", "EDR telemetry", "Firewall logs", "Identity provider logs", "DNS logs", "Anomaly-based detection", "Signature-based detection"],
    "4.3": ["Scan and test from known-good backup", "Reimage system", "Apply patches", "Validate restoration", "Monitor for reinfection", "Restore from backup"],
    "4.4": ["Approved rollback plan", "Change request", "Risk assessment", "Maintenance window", "Test plan", "Change approval board"],
    "4.5": ["Protocol analyzer", "Packet capture", "Network tap", "SPAN port", "NetFlow", "Vulnerability scanner"],
    "4.6": ["RADIUS", "TACACS+", "LDAP", "Kerberos", "SAML", "OAuth", "802.1X"],
    "4.8": ["SMB", "RDP", "SSH", "Kerberos", "LDAP", "HTTPS", "DNS", "SNMP", "Syslog"],
    "5.1": ["Residual risk", "Inherent risk", "SLE", "ALE", "ARO", "RTO", "RPO", "Risk transfer", "Risk acceptance"],
    "5.2": ["Data owner", "Data custodian", "Data processor", "Data steward", "Privacy officer", "System owner"],
    "5.3": ["Audit", "Assessment", "Evidence collection", "Compliance report", "Control testing", "Gap analysis"],
    "5.4": ["Policy", "Procedure", "Standard", "Guideline", "SLA", "NDA", "MOU", "AUP", "BCP"],
    "5.5": ["Third-party risk management", "Vendor assessment", "Security questionnaire", "Right-to-audit clause", "SLA review", "Contract requirements"]
  };
  const byDomain = {
    "1": ["Confidentiality", "Integrity", "Availability", "MFA", "Least privilege", "Separation of duties", "Non-repudiation"],
    "2": ["Phishing", "Ransomware", "SQL injection", "XSS", "Credential stuffing", "DNS tunneling", "Threat intelligence"],
    "3": ["DMZ", "VLAN", "SaaS", "IaaS", "Encryption", "WAF", "Hot site", "PKI"],
    "4": ["SIEM", "EDR", "RADIUS", "TACACS+", "Protocol analyzer", "Containment", "Change approval"],
    "5": ["Risk register", "SLA", "Policy", "Procedure", "Audit", "Data owner", "Residual risk", "NDA"]
  };
  const pool = [...(byObjective[objective] || []), ...(byDomain[domain] || [])].filter((item) => item !== correct);
  return deterministicShuffle([...new Set(pool)], seed + stableScore(correct, seed)).slice(0, 3);
}

function card(term, fullName, definitionFr, example, objective) {
  const enriched = enrichFlashcard(term, fullName, definitionFr, example, objective);
  return { id: `${term}|${fullName}`, term, fullName, objective, domain: objective.split(".")[0], ...enriched };
}

function acronymCard(term, fullName, index) {
  const objective = inferAcronymObjective(term, fullName, index);
  return card(
    term,
    fullName,
    `${term} signifie ${fullName}. C'est un terme a reconnaitre rapidement pour associer un protocole, un controle, un role, un document ou une attaque au bon contexte.`,
    `If a question uses ${term}, first expand it as ${fullName}, then identify whether it is a tool, protocol, control, metric, role, or attack.`,
    objective
  );
}

function enrichFlashcard(term, fullName, definitionFr, example, objective) {
  const profile = flashcardProfile(term, fullName, objective);
  const baseDefinition = profile.definition || definitionFr;
  const baseExample = profile.example || example;
  return {
    definitionFr: baseDefinition,
    example: baseExample,
    examTip: profile.examTip || flashcardObjectiveTip(objective, term),
    trap: profile.trap || flashcardObjectiveTrap(objective, term),
    memoryHook: profile.memoryHook || flashcardMemoryHook(term, fullName)
  };
}

function flashcardProfile(term, fullName, objective) {
  const key = term.toUpperCase();
  const profiles = {
    CIA: {
      definition: "Modele de base de la securite: Confidentiality limite l'acces, Integrity empeche les modifications non autorisees, Availability garde les services accessibles.",
      example: "Encryption protege surtout la confidentialite, hashing aide l'integrite, clustering et backups soutiennent la disponibilite.",
      examTip: "Quand une question demande quel pilier est touche, repere le verbe: read/leak = confidentiality, change/tamper = integrity, outage/unavailable = availability.",
      trap: "Ne confonds pas integrity avec non-repudiation: integrity prouve que la donnee n'a pas change; non-repudiation lie une action a son auteur."
    },
    DAD: {
      definition: "Triade opposee aux objectifs defensifs: Disclosure expose les donnees, Alteration modifie les donnees, Denial rend les ressources indisponibles.",
      example: "Une fuite de base clients est disclosure, une modification de transactions est alteration, un DDoS cause denial.",
      examTip: "DAD decrit ce que l'attaquant veut provoquer; CIA decrit ce que le defenseur veut proteger.",
      trap: "Denial n'est pas toujours suppression de donnees: c'est d'abord l'indisponibilite du service."
    },
    MFA: {
      definition: "Authentification qui combine au moins deux categories differentes: quelque chose que l'on sait, possede, est, fait, ou un contexte d'acces.",
      example: "Mot de passe + application TOTP est MFA; mot de passe + question secrete reste surtout de la connaissance.",
      examTip: "Pour etre multifactor, les facteurs doivent etre de categories differentes.",
      trap: "Deux mots de passe ou mot de passe + PIN ne font pas une MFA forte: ce sont deux facteurs de connaissance."
    },
    RBAC: {
      definition: "Modele d'autorisation ou les permissions sont attachees a des roles ou groupes, puis les utilisateurs heritent de ces droits.",
      example: "Le groupe Help Desk peut reinitialiser les mots de passe sans recevoir les droits Global Admin.",
      examTip: "Choisis RBAC quand le scenario parle de fonctions metier, groupes, job roles ou administration centralisee.",
      trap: "RBAC n'est pas ABAC: ABAC prend aussi en compte attributs comme appareil, heure, lieu ou sensibilite de la ressource."
    },
    ABAC: {
      definition: "Modele d'acces fin qui evalue des attributs du sujet, de l'objet, de l'action et de l'environnement.",
      example: "Autoriser un rapport financier seulement aux managers, sur appareil gere, depuis le pays attendu, pendant les heures ouvrables.",
      examTip: "ABAC est souvent le meilleur choix quand la decision depend de plusieurs conditions dynamiques.",
      trap: "Si l'enonce parle seulement de role ou groupe, RBAC est probablement plus direct."
    },
    PAM: {
      definition: "Ensemble de controles pour proteger les comptes privilegies: coffre de mots de passe, approbation, JIT, journalisation, session recording.",
      example: "Un admin demande une elevation temporaire, utilise un compte audite, puis perd les droits automatiquement.",
      examTip: "Associe PAM aux comptes admin, root, domain admin, break-glass, vaulting, JIT ou zero standing privilege.",
      trap: "PAM ne veut pas dire partager un compte admin: cela detruit l'accountability."
    },
    PKI: {
      definition: "Infrastructure qui gere certificats, autorites de certification, cles publiques/privees et chaines de confiance.",
      example: "Un navigateur valide le certificat TLS d'un site en remontant jusqu'a une CA racine de confiance.",
      examTip: "PKI apparait quand il faut lier une identite a une cle publique ou verifier une chaine de certificats.",
      trap: "Un certificat ne chiffre pas tout seul les donnees: il contient surtout une cle publique et des informations d'identite."
    },
    CA: {
      definition: "Autorite qui emet et signe des certificats afin de confirmer l'identite du sujet associe a une cle publique.",
      example: "Une CA intermediaire signe le certificat d'un serveur web, et le client fait confiance a la racine.",
      examTip: "Choisis CA quand la question parle d'emission, signature, validation ou chaine de confiance de certificats.",
      trap: "Une CA compromise met en danger toute la confiance dependante de cette CA."
    },
    CSR: {
      definition: "Demande de signature de certificat contenant la cle publique du sujet et les informations a valider par la CA.",
      example: "Un administrateur genere une CSR pour obtenir un certificat HTTPS pour portal.example.com.",
      examTip: "CSR intervient avant l'emission du certificat, pas apres son installation.",
      trap: "La cle privee ne doit pas etre envoyee dans la CSR."
    },
    CRL: {
      definition: "Liste publiee par une CA indiquant les certificats revoques avant leur date d'expiration.",
      example: "Un client consulte une CRL ou OCSP pour verifier qu'un certificat n'a pas ete revoque.",
      examTip: "CRL et OCSP servent au statut de revocation; OCSP est plus temps reel.",
      trap: "Expiration et revocation sont differents: un certificat peut etre revoque avant sa date de fin."
    },
    OCSP: {
      definition: "Protocole de verification en ligne du statut d'un certificat, souvent plus rapide et actuel qu'une CRL complete.",
      example: "Le navigateur demande au responder OCSP si le certificat TLS est encore valide.",
      examTip: "Associe OCSP a la verification de revocation en temps quasi reel.",
      trap: "OCSP ne remplace pas la CA; il repond seulement sur le statut du certificat."
    },
    SIEM: {
      definition: "Plateforme qui centralise les logs, correle les evenements, declenche des alertes et produit des rapports de securite.",
      example: "Plusieurs echecs de connexion suivis d'un succes depuis la meme IP declenchent une alerte SIEM.",
      examTip: "SIEM = collecte + correlation + alerting. SOAR = automatisation de la reponse.",
      trap: "Un SIEM ne bloque pas forcement l'attaque; il detecte et aide l'analyse."
    },
    SOAR: {
      definition: "Outil qui orchestre et automatise des actions de reponse a partir d'alertes de securite.",
      example: "A la reception d'une alerte phishing, SOAR isole un endpoint, ouvre un ticket et bloque un domaine.",
      examTip: "Choisis SOAR quand l'enonce insiste sur playbooks automatises et remediation coordonnee.",
      trap: "SOAR depend de bonnes integrations et de playbooks valides; il ne remplace pas l'analyse humaine dans tous les cas."
    },
    EDR: {
      definition: "Solution endpoint qui collecte la telemetrie, detecte les comportements suspects et aide a repondre sur les postes.",
      example: "EDR detecte PowerShell anormal, isole le laptop et conserve la timeline du processus.",
      examTip: "EDR concerne les endpoints; NDR/NIDS concerne davantage le reseau.",
      trap: "Un antivirus signature-only est plus limite qu'un EDR comportemental."
    },
    DLP: {
      definition: "Controle qui detecte et empeche les sorties non autorisees de donnees sensibles.",
      example: "DLP bloque l'envoi d'un fichier contenant des numeros de carte bancaire vers une adresse externe.",
      examTip: "Associe DLP a exfiltration, classification, inspection email/web/endpoint et actions block/quarantine/alert.",
      trap: "DLP n'est pas une sauvegarde; il empeche surtout la fuite ou l'usage non autorise."
    },
    WAF: {
      definition: "Pare-feu applicatif qui inspecte les requetes HTTP/S pour bloquer des attaques web comme SQL injection ou XSS.",
      example: "Un WAF bloque une requete contenant UNION SELECT envoyee vers une application publique.",
      examTip: "WAF protege la couche application; un firewall reseau filtre surtout IP, ports et protocoles.",
      trap: "Un WAF ne corrige pas le code vulnerable; il reduit l'exposition."
    },
    NAC: {
      definition: "Controle d'acces reseau qui authentifie et verifie l'etat de securite d'un appareil avant de lui donner acces.",
      example: "Un poste sans EDR est place dans un VLAN de remediation au lieu du LAN interne.",
      examTip: "NAC apparait avec 802.1X, posture check, quarantine VLAN, device health ou onboarding.",
      trap: "NAC n'est pas seulement Wi-Fi; il peut aussi s'appliquer aux ports filaires."
    },
    CASB: {
      definition: "Courtier de securite cloud qui donne visibilite et controle sur les usages SaaS et cloud.",
      example: "Un CASB detecte un partage public de fichiers sensibles dans une application SaaS.",
      examTip: "Choisis CASB pour shadow IT, controle SaaS, DLP cloud et politiques entre utilisateurs et services cloud.",
      trap: "CASB n'est pas identique a CSPM: CSPM verifie surtout la posture de configuration cloud."
    },
    VPN: {
      definition: "Tunnel chiffre permettant d'acceder a un reseau prive via un reseau non fiable.",
      example: "Un utilisateur distant se connecte au reseau de l'entreprise avec IPsec ou SSL VPN.",
      examTip: "Full tunnel force tout le trafic via l'entreprise; split tunnel laisse l'Internet sortir localement.",
      trap: "Un VPN ne rend pas automatiquement l'appareil sain; il doit etre combine a MFA, posture check et monitoring."
    },
    VLAN: {
      definition: "Segmentation logique de couche 2 permettant de separer des groupes de machines sur une meme infrastructure de commutation.",
      example: "Les invites Wi-Fi sont places dans un VLAN separe du VLAN des serveurs internes.",
      examTip: "VLAN = segmentation logique; firewall/ACL = controle des flux entre segments.",
      trap: "Un VLAN seul ne suffit pas si le routage inter-VLAN autorise tout."
    },
    DMZ: {
      definition: "Zone reseau intermediaire pour exposer des services publics sans ouvrir directement le LAN interne.",
      example: "Un serveur web public est place en DMZ, tandis que la base de donnees reste sur un segment interne.",
      examTip: "DMZ apparait avec web server public, reverse proxy, WAF, bastion ou screened subnet.",
      trap: "La DMZ n'est pas une zone de confiance totale; elle est semi-exposee."
    },
    RTO: {
      definition: "Duree cible pour restaurer un service apres interruption.",
      example: "Si RTO = 4 heures, le plan doit permettre une reprise en moins de 4 heures.",
      examTip: "RTO parle de temps d'arret acceptable; RPO parle de quantite de donnees perdues acceptable.",
      trap: "Ne confonds pas RTO avec MTTR: MTTR mesure le temps moyen de reparation observe."
    },
    RPO: {
      definition: "Point de reprise indiquant la perte maximale de donnees acceptable.",
      example: "RPO = 15 minutes signifie que les sauvegardes ou replicas doivent limiter la perte a 15 minutes de donnees.",
      examTip: "RPO influence la frequence de sauvegarde ou replication.",
      trap: "Un RPO tres faible coute souvent plus cher car il exige replication frequente ou synchrone."
    },
    BIA: {
      definition: "Analyse qui determine l'impact metier d'une interruption et aide a fixer RTO, RPO et priorites de reprise.",
      example: "Une BIA montre que le systeme de paiement doit revenir avant l'intranet RH.",
      examTip: "BIA vient avant le choix detaille des strategies de continuite.",
      trap: "BIA n'est pas un pentest: elle mesure l'impact business, pas seulement la faille technique."
    },
    SLA: {
      definition: "Accord contractuel definissant les niveaux de service attendus, comme disponibilite, support ou delai de reponse.",
      example: "Un fournisseur garantit 99.9% de disponibilite et une reponse critique en 1 heure.",
      examTip: "SLA = metriques de service mesurables; NDA = confidentialite; MOU = intention de collaboration.",
      trap: "Un SLA ne transfere pas toute la responsabilite legale du client."
    },
    AUP: {
      definition: "Politique qui definit l'usage acceptable des systemes, donnees et ressources de l'organisation.",
      example: "L'AUP interdit d'installer des outils non autorises ou d'utiliser les systemes pour activites personnelles risquees.",
      examTip: "Choisis AUP pour comportement utilisateur autorise/interdit.",
      trap: "Une AUP doit etre compréhensible pour les utilisateurs, pas seulement pour l'equipe securite."
    },
    MOU: {
      definition: "Accord preliminaire exprimant l'intention de collaborer, souvent moins formel qu'un contrat complet.",
      example: "Deux organisations signent un MOU avant de definir les details contractuels d'un projet commun.",
      examTip: "MOU = intention et cadre general; SLA = niveaux de service; NDA = confidentialite.",
      trap: "Un MOU n'est pas toujours juridiquement contraignant."
    },
    NDA: {
      definition: "Accord de confidentialite qui limite la divulgation d'informations partagees.",
      example: "Un consultant signe un NDA avant d'acceder a des diagrammes reseau internes.",
      examTip: "NDA apparait quand la question parle de proteger des informations partagees avec employes, partenaires ou fournisseurs.",
      trap: "NDA ne definit pas les niveaux de disponibilite du service; cela releve du SLA."
    },
    XSS: {
      definition: "Attaque ou du script malveillant est injecte dans une page web et execute dans le navigateur d'une victime.",
      example: "Un commentaire utilisateur contenant JavaScript s'affiche aux autres visiteurs.",
      examTip: "Mitigations typiques: validation d'entree, encodage de sortie, CSP et cookies HttpOnly/SameSite selon le cas.",
      trap: "XSS vise le navigateur; SQL injection vise la base de donnees."
    },
    XSRF: {
      definition: "Aussi appele CSRF: attaque qui force le navigateur authentifie d'une victime a envoyer une requete non voulue.",
      example: "Un lien piege modifie l'adresse email d'un compte parce que la session de la victime est active.",
      examTip: "Mitigations: tokens anti-CSRF, SameSite cookies et verification d'origine.",
      trap: "CSRF n'a pas besoin de voler le mot de passe; il abuse d'une session deja authentifiee."
    },
    CSRF: {
      definition: "Attaque qui abuse de la session active d'un utilisateur pour executer une action sans son intention.",
      example: "Une page externe soumet une requete de changement de mot de passe vers une application ou l'utilisateur est connecte.",
      examTip: "Cherche les indices: session cookie, requete forcee, action effectuee par le navigateur de la victime.",
      trap: "CSRF est different de clickjacking: clickjacking trompe le clic via une interface superposee."
    }
  };
  return profiles[key] || {};
}

function flashcardObjectiveTip(objective, term) {
  const tips = {
    "1": `Classe ${term} selon le besoin: identite, acces, crypto, controle ou protection des donnees.`,
    "2": `Repere si ${term} decrit une menace, une vulnerabilite, un indicateur ou une mitigation.`,
    "3": `Relie ${term} a l'architecture: emplacement, flux, segmentation, cloud, resilience ou chiffrement.`,
    "4": `Associe ${term} a une action operationnelle: detecter, journaliser, repondre, durcir, analyser ou authentifier.`,
    "5": `Relie ${term} a la gouvernance: risque, conformite, responsabilite, document, contrat ou mesure business.`
  };
  return tips[objective.split(".")[0]] || `Retenir le contexte pratique ou ${term} est le meilleur choix.`;
}

function flashcardObjectiveTrap(objective, term) {
  const traps = {
    "1": `Piege frequent: choisir ${term} pour un mot-cle proche sans verifier le facteur, le role ou la propriete de securite demandee.`,
    "2": `Piege frequent: confondre le type d'attaque avec son indicateur ou sa remediation.`,
    "3": `Piege frequent: choisir un equipement correct mais au mauvais emplacement dans le flux reseau.`,
    "4": `Piege frequent: melanger detection, prevention, reponse et preuve forensique.`,
    "5": `Piege frequent: confondre document de gouvernance, accord contractuel, metrique de risque et exigence de conformite.`
  };
  return traps[objective.split(".")[0]] || `Verifie toujours ce que le scenario demande vraiment avant de choisir ${term}.`;
}

function flashcardMemoryHook(term, fullName) {
  if (term === fullName) return `Memo: associe ce terme a son action principale et a son meilleur scenario d'utilisation.`;
  return `Memo: ${term} = ${fullName}. Lis d'abord l'acronyme complet, puis rattache-le a son role dans l'architecture ou l'operation.`;
}

function inferAcronymObjective(term, fullName, index) {
  const value = `${term} ${fullName}`.toLowerCase();
  if (/(attack|threat|vulnerability|cve|cvss|apt|ddos|dos|ioc|osint|att&ck|sqli|xss|xsrf|csrf|rat|pup)/.test(value)) return "2.1";
  if (/(encrypt|cipher|hash|certificate|pki|tls|ssl|rsa|aes|des|sha|md5|hmac|ocsp|crl|ca|csr|ecc|ecdsa|gcm|cbc|pgp|gpg|s\/mime|pbkdf2|psk|iv|kek)/.test(value)) return "3.9";
  if (/(policy|agreement|risk|impact|continuity|recovery|sla|sow|mou|moa|nda|gdpr|pci|rto|rpo|mttr|mtbf|mttf|ale|aro|sle|aup|bia|bcp|drp|coop|dpo)/.test(value)) return "5.1";
  if (/(siem|soc|soar|incident|response|log|edr|xdr|ids|ips|hids|hips|nids|nips|pcap|snmp|syslog|tacacs|radius|ssh|rdp|ftp|sftp|smtp|imap|pop|dns|dhcp|ntp|ldap|kerberos)/.test(value)) return "4.8";
  if (/(cloud|network|firewall|vpn|vlan|lan|wan|wireless|access point|router|nat|waf|sase|casb|iaas|paas|saas|sd-wan|sdn|vpc|wpa|wep|wips|wids|ngfw|utm)/.test(value)) return "3.1";
  if (/(access|identity|authentication|authorization|accounting|mfa|iam|sso|saml|oauth|rbac|dac|mac|pam|nac|idp|pap|chap|eap|peap|totp|hotp)/.test(value)) return "1.2";
  return domains[index % domains.length].id + ".1";
}

function flashcardKey(card) {
  return card.id || `${card.term}|${card.fullName}`;
}

const guideQuestions = buildGuideQuestions(guideTopics);
const questions = buildQuestionBank([...baseQuestions, ...guideQuestions]);
const conceptCards = guideTopics.flatMap((topic) => topic.concepts.map((concept, index) => card(
  concept.term,
  topic.title,
  `${concept.summary} A retenir: ${concept.examUse}.`,
  `When a scenario mentions "${concept.examUse}", connect it to ${concept.correct}.`,
  `${topic.domain}.${topic.objective.split(".")[1]}`
))).map((item, index) => ({ ...item, id: `concept-${String(index + 1).padStart(3, "0")}-${item.term}`, source: "guide" }));
const flashcards = [...acronymRows.map(([term, fullName], index) => acronymCard(term, fullName, index)), ...conceptCards];

function loadProgress() {
  const base = {
    answers: {},
    flagged: {},
    flashcards: {},
    quizAttempts: [],
    ports: { attempts: [] },
    pbq: {},
    resources: [],
    exams: []
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) return normalizeProgress({ ...base, ...saved });
    const legacy = JSON.parse(localStorage.getItem(LEGACY_PROGRESS_KEY) || "{}");
    return { ...base, legacyImportedCount: Object.keys(legacy).length };
  } catch {
    return base;
  }
}

function normalizeProgress(progress) {
  return {
    ...progress,
    answers: progress.answers || {},
    flagged: progress.flagged || {},
    flashcards: progress.flashcards || {},
    quizAttempts: Array.isArray(progress.quizAttempts) ? progress.quizAttempts : [],
    ports: { attempts: Array.isArray(progress.ports?.attempts) ? progress.ports.attempts : [] },
    pbq: progress.pbq || {},
    resources: Array.isArray(progress.resources) ? progress.resources : [],
    exams: Array.isArray(progress.exams) ? progress.exams : []
  };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {}
}

function pct(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function filterQuestions(source, domainFilter, objectiveFilter) {
  return source.filter((item) =>
    (domainFilter === ALL_FILTER || item.domain === domainFilter) &&
    (objectiveFilter === ALL_FILTER || item.objective === objectiveFilter)
  );
}

function mixQuestionOptions(question, seed) {
  if (!question) return null;
  const optionMap = question.options.map((option, optionIndex) => ({ option, optionIndex }));
  const mixed = deterministicShuffle(optionMap, seed + stableScore(question.id, seed));
  return {
    ...question,
    options: mixed.map((entry) => entry.option),
    answer: mixed.findIndex((entry) => entry.optionIndex === question.answer),
    sourceAnswer: question.answer
  };
}

function getCircularItem(items, index) {
  if (!items.length) return null;
  return items[index % items.length];
}

function buildFlashcardDeck(cards, statusMap, domainFilter, query = "") {
  const search = query.trim().toLowerCase();
  const filtered = cards.filter((card) =>
    (domainFilter === ALL_FILTER || card.domain === domainFilter) &&
    (!search || `${card.term} ${card.fullName}`.toLowerCase().includes(search))
  );
  const studyAgain = filtered.filter((card) => statusMap[flashcardKey(card)] === "again");
  const unseen = filtered.filter((card) => !statusMap[flashcardKey(card)]);
  const known = filtered.filter((card) => statusMap[flashcardKey(card)] === "know");
  return [...studyAgain, ...studyAgain, ...unseen, ...known];
}

function flashcardStats(cards, statusMap, domainFilter, query = "") {
  const search = query.trim().toLowerCase();
  const filtered = cards.filter((card) =>
    (domainFilter === ALL_FILTER || card.domain === domainFilter) &&
    (!search || `${card.term} ${card.fullName}`.toLowerCase().includes(search))
  );
  const again = filtered.filter((card) => statusMap[flashcardKey(card)] === "again").length;
  const known = filtered.filter((card) => statusMap[flashcardKey(card)] === "know").length;
  return { total: filtered.length, again, known, unseen: filtered.length - again - known };
}

function portWeaknesses(attempts) {
  const misses = {};
  attempts.filter((attempt) => !attempt.correct).forEach((attempt) => {
    const key = `${attempt.port} ${attempt.protocol}`;
    misses[key] = (misses[key] || 0) + 1;
  });
  return Object.entries(misses).map(([label, missed]) => ({ label, missed })).sort((a, b) => b.missed - a.missed).slice(0, 5);
}

function buildPortQuestion(currentPort, allPorts, mode, seed) {
  const answer = mode === "port" ? currentPort.protocol : currentPort.port;
  const prompt = mode === "port"
    ? `Which protocol MOST commonly uses port ${currentPort.port}?`
    : `Which port is MOST commonly used by ${currentPort.protocol}?`;
  const details = mode === "port"
    ? `Transport: ${currentPort.transport}`
    : `Protocol: ${currentPort.protocol} · Transport: ${currentPort.transport}`;
  const start = allPorts.findIndex((item) => item.port === currentPort.port && item.protocol === currentPort.protocol);
  const distractors = [];
  for (let offset = 1; distractors.length < 3 && offset < allPorts.length * 2; offset += 1) {
    const candidate = allPorts[(Math.max(0, start) + offset + seed) % allPorts.length];
    const value = mode === "port" ? candidate.protocol : candidate.port;
    if (value !== answer && !distractors.includes(value)) distractors.push(value);
  }
  return { prompt, details, answer, options: deterministicShuffle([answer, ...distractors], seed + 11) };
}

function deterministicShuffle(items, seed) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = stableScore(`${copy[i]}-${i}`, seed) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function stableScore(value, seed) {
  return Math.abs(String(value).split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3 + seed), seed * 17));
}

function portFeedbackFr(feedback) {
  const expectedLabel = feedback.mode === "port" ? feedback.protocol : feedback.port;
  const asked = feedback.mode === "port" ? `le port ${feedback.port}` : `le protocole ${feedback.protocol}`;
  return `Pour ${asked}, la bonne reponse est ${expectedLabel}. ${feedback.protocol} utilise le port ${feedback.port} en ${feedback.transport}. Ta reponse: ${feedback.answer}.`;
}

function pbqChoices(items, seed) {
  return deterministicShuffle(items, seed);
}

function createExamState(examSet) {
  return { examSet, started: Date.now(), questions: buildExamQuestions(examSet), index: 0, answers: {}, submitted: false, paused: false, pausedAt: null, totalPausedMs: 0 };
}

function getExamSecondsLeft(started, now, totalPausedMs = 0, pausedAt = null) {
  const effectiveNow = pausedAt || now;
  return Math.max(0, EXAM_DURATION_SECONDS - Math.floor((effectiveNow - started - totalPausedMs) / 1000));
}

function getPortSecondsLeft(started, now, pausedAt = null) {
  const effectiveNow = pausedAt || now;
  return Math.max(0, PORT_QUESTION_SECONDS - Math.floor((effectiveNow - started) / 1000));
}

function gradeExam(exam) {
  const earned = exam.questions.reduce((sum, item) => sum + gradeExamItem(item, exam.answers[item.id]), 0);
  return { correct: earned, total: exam.questions.length, percent: pct(earned, exam.questions.length), scaled: Math.round((earned / exam.questions.length) * 900) };
}

function examDomainBreakdown(exam) {
  return domains.map((d) => {
    const items = exam.questions.filter((item) => item.domain === d.id);
    const correct = items.reduce((sum, item) => sum + gradeExamItem(item, exam.answers[item.id]), 0);
    return { ...d, correct, total: items.length, percent: pct(correct, items.length) };
  });
}

function gradeExamItem(item, answer) {
  if (!item) return 0;
  if (item.examType === "pbq") return gradePbqAnswer(item.pbq, answer || {});
  return answer === item.answer ? 1 : 0;
}

function gradePbqAnswer(pbq, answers = {}) {
  if (!pbq) return 0;
  if (pbq.type === "matching") return pbq.pairs.filter(([left, right]) => answers[`${pbq.id}-${left}`] === right).length / pbq.pairs.length;
  if (pbq.type === "ordering") return pbq.order.filter((step, i) => answers[`${pbq.id}-${i}`] === step).length / pbq.order.length;
  if (pbq.type === "firewall") return pbq.required.filter((rule, i) => ["action", "protocol", "src", "dst", "port"].every((k) => answers[`${pbq.id}-${i}-${k}`] === rule[k])).length / pbq.required.length;
  if (pbq.type === "log") return pbq.fields.filter((field) => answers[`${pbq.id}-${field.label}`] === field.answer).length / pbq.fields.length;
  if (pbq.type === "topology") return pbq.placements.filter((placement) => answers[`${pbq.id}-${placement.slot}`] === placement.answer).length / pbq.placements.length;
  if (pbq.type === "iam") {
    const total = pbq.identities.length * 2;
    const correct = pbq.identities.reduce((sum, identity) => {
      return sum + (answers[`${pbq.id}-${identity.subject}-role`] === identity.role ? 1 : 0) + (answers[`${pbq.id}-${identity.subject}-control`] === identity.control ? 1 : 0);
    }, 0);
    return correct / total;
  }
  return 0;
}

function daysUntilExam(now = Date.now()) {
  const diff = EXAM_DATE.getTime() - now;
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const seconds = Math.max(0, Math.floor((diff % 60000) / 1000));
  return { days, hours, minutes, seconds };
}

function App() {
  const [tab, setTab] = useState("dashboard");
  const [progress, setProgress] = useState(loadProgress);
  const [domainFilter, setDomainFilter] = useState(ALL_FILTER);
  const [objectiveFilter, setObjectiveFilter] = useState(ALL_FILTER);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [session, setSession] = useState({ started: Date.now(), total: 0, correct: 0, done: false });
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashDomainFilter, setFlashDomainFilter] = useState(ALL_FILTER);
  const [flashSearch, setFlashSearch] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [portIndex, setPortIndex] = useState(0);
  const [portMode, setPortMode] = useState("port");
  const [portStartedAt, setPortStartedAt] = useState(Date.now());
  const [portTimerPausedAt, setPortTimerPausedAt] = useState(null);
  const [portFeedback, setPortFeedback] = useState(null);
  const [exam, setExam] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredQuestions = useMemo(() => filterQuestions(questions, domainFilter, objectiveFilter), [domainFilter, objectiveFilter]);

  const stats = useMemo(() => buildStats(progress), [progress]);
  const currentQuestion = mixQuestionOptions(getCircularItem(filteredQuestions, quizIndex), quizIndex + 101);
  const weak = weakestObjectives(progress);
  const dueCards = useMemo(() => buildFlashcardDeck(flashcards, progress.flashcards, flashDomainFilter, flashSearch), [progress.flashcards, flashDomainFilter, flashSearch]);
  const currentCard = dueCards[flashIndex % dueCards.length];
  const currentPort = ports[portIndex % ports.length];
  const portTimerPaused = Boolean(portTimerPausedAt) && !portFeedback;
  const portSeconds = tab === "ports" ? (portFeedback ? portFeedback.secondsLeft : getPortSecondsLeft(portStartedAt, now, portTimerPausedAt)) : PORT_QUESTION_SECONDS;
  const examSecondsLeft = exam ? getExamSecondsLeft(exam.started, now, exam.totalPausedMs || 0, exam.pausedAt) : EXAM_DURATION_SECONDS;
  useEffect(() => {
    if (exam && !exam.submitted && !exam.paused && examSecondsLeft === 0) finishExam();
  }, [examSecondsLeft, exam?.paused]);
  useEffect(() => {
    if (tab === "ports" && !portFeedback && !portTimerPaused && portSeconds === 0) answerPort(null);
  }, [tab, portSeconds, portFeedback, portTimerPaused]);

  function answerQuiz(answer) {
    if (selected !== null || !currentQuestion) return;
    const correct = answer === currentQuestion.answer;
    setSelected(answer);
    setSession((s) => ({ ...s, total: s.total + 1, correct: s.correct + (correct ? 1 : 0) }));
    setProgress((p) => ({
      ...p,
      quizAttempts: [...(p.quizAttempts || []), { questionId: currentQuestion.id, answer, correct, domain: currentQuestion.domain, objective: currentQuestion.objective, at: Date.now() }],
      answers: {
        ...p.answers,
        [currentQuestion.id]: { answer, correct, domain: currentQuestion.domain, objective: currentQuestion.objective, at: Date.now() }
      }
    }));
  }

  function nextQuiz() {
    if (!filteredQuestions.length || quizIndex + 1 >= filteredQuestions.length) {
      setSession((s) => ({ ...s, done: true }));
    } else {
      setQuizIndex((i) => i + 1);
      setSelected(null);
    }
  }

  function changeDomainFilter(value) {
    setDomainFilter(value);
    if (value !== ALL_FILTER && objectiveFilter !== ALL_FILTER && !objectiveFilter.startsWith(`${value}.`)) {
      setObjectiveFilter(ALL_FILTER);
    }
    resetQuizPosition();
  }

  function changeObjectiveFilter(value) {
    setObjectiveFilter(value);
    if (value !== ALL_FILTER) setDomainFilter(value.split(".")[0]);
    resetQuizPosition();
  }

  function resetQuizPosition() {
    setQuizIndex(0);
    setSelected(null);
    setSession({ started: Date.now(), total: 0, correct: 0, done: false });
  }

  function restartQuiz() {
    setQuizIndex(0);
    setSelected(null);
    setSession({ started: Date.now(), total: 0, correct: 0, done: false });
  }

  function startWeakPractice(objective) {
    setObjectiveFilter(objective);
    setDomainFilter(objective.split(".")[0]);
    setQuizIndex(0);
    setSelected(null);
    setSession({ started: Date.now(), total: 0, correct: 0, done: false });
    setTab("quiz");
  }

  function answerPort(choice) {
    if (portFeedback) return;
    const expected = portMode === "port" ? currentPort.protocol : currentPort.port;
    const correct = choice === expected;
    const result = { port: currentPort.port, protocol: currentPort.protocol, transport: currentPort.transport, mode: portMode, answer: choice || "TIMEOUT", expected, correct, secondsLeft: Math.max(0, portSeconds), at: Date.now() };
    setPortTimerPausedAt(null);
    setPortFeedback(result);
    setProgress((p) => ({
      ...p,
      ports: {
        attempts: [...p.ports.attempts, result]
      }
    }));
  }

  function nextPort() {
    setPortFeedback(null);
    setPortStartedAt(Date.now());
    setPortTimerPausedAt(null);
    setPortIndex((i) => i + 1);
  }

  function changePortMode(value) {
    setPortFeedback(null);
    setPortStartedAt(Date.now());
    setPortTimerPausedAt(null);
    setPortMode(value);
  }

  function togglePortTimer() {
    if (portFeedback) return;
    const timestamp = Date.now();
    if (portTimerPausedAt) {
      setPortStartedAt((started) => started + (timestamp - portTimerPausedAt));
      setPortTimerPausedAt(null);
      setNow(timestamp);
    } else {
      setPortTimerPausedAt(timestamp);
      setNow(timestamp);
    }
  }

  function changeFlashDomainFilter(value) {
    setFlashDomainFilter(value);
    setFlashIndex(0);
    setFlipped(false);
  }

  function startExam(examSet = "A") {
    setExam(createExamState(examSet));
    setNow(Date.now());
    setTab("exam");
  }

  function clearExam() {
    setExam(null);
    setNow(Date.now());
    setTab("exam");
  }

  function toggleExamTimer() {
    if (!exam || exam.submitted) return;
    const timestamp = Date.now();
    if (exam.paused) {
      setExam({ ...exam, paused: false, totalPausedMs: (exam.totalPausedMs || 0) + (timestamp - exam.pausedAt), pausedAt: null });
    } else {
      setExam({ ...exam, paused: true, pausedAt: timestamp });
    }
    setNow(timestamp);
  }

  function submitExamAnswer(questionId, answer) {
    if (!exam || exam.submitted) return;
    setExam({ ...exam, answers: { ...exam.answers, [questionId]: answer } });
  }

function finishExam() {
    if (!exam || exam.submitted) return;
    const score = gradeExam(exam).correct;
    const finalExam = { ...exam, submitted: true, finished: Date.now(), score };
    setExam(finalExam);
    setProgress((p) => ({ ...p, exams: [...p.exams, finalExam] }));
  }

  function moveExamIndex(delta) {
    if (!exam) return;
    setExam({ ...exam, index: Math.min(exam.questions.length - 1, Math.max(0, exam.index + delta)) });
  }

  return e("div", { className: "app" },
    e(Sidebar, { tab, setTab, readiness: stats.readiness }),
    e("main", { className: "workspace" },
      e(Header, { tab, setTab, startExam }),
      tab === "dashboard" && e(Dashboard, { stats, setTab, startExam, now }),
      tab === "quiz" && e(Quiz, { currentQuestion, selected, answerQuiz, nextQuiz, restartQuiz, session, filteredQuestions, quizIndex, progress, setProgress, domainFilter, setDomainFilter: changeDomainFilter, objectiveFilter, setObjectiveFilter: changeObjectiveFilter }),
      tab === "pbq" && e(PBQ, { progress, setProgress }),
      tab === "flashcards" && e(Flashcards, { currentCard, dueCards, flashDomainFilter, setFlashDomainFilter: changeFlashDomainFilter, flashSearch, setFlashSearch, flipped, setFlipped, setFlashIndex, progress, setProgress }),
      tab === "ports" && e(Ports, { currentPort, portIndex, ports, portMode, setPortMode: changePortMode, portSeconds, answerPort, nextPort, portFeedback, progress, timerPaused: portTimerPaused, toggleTimer: togglePortTimer }),
      tab === "weak" && e(WeakAreas, { weak, startWeakPractice }),
      tab === "exam" && e(Exam, { exam, startExam, clearExam, submitExamAnswer, finishExam, moveExamIndex, examSecondsLeft, toggleTimer: toggleExamTimer })
    )
  );
}

function Sidebar({ tab, setTab, readiness }) {
  const items = [["dashboard", "Dashboard"], ["quiz", "Quiz"], ["pbq", "PBQ"], ["flashcards", "Flashcards"], ["ports", "Ports"], ["weak", "Weak Areas"], ["exam", "Exam Sim"]];
  return e("aside", { className: "sidebar" },
    e("div", { className: "brand" }, e("div", { className: "brand-mark" }, "701"), e("div", null, e("h1", null, "Security+"), e("p", null, "SY0-701 prep"))),
    e("nav", { className: "nav" }, items.map(([id, label]) => e("button", { key: id, className: tab === id ? "active" : "", onClick: () => setTab(id) }, e("span", null, label)))),
    e("div", { className: "readiness" }, e("span", null, "Overall readiness"), e("strong", null, `${readiness}%`), e("div", { className: "bar" }, e("i", { style: { width: `${readiness}%` } })))
  );
}

function Header({ tab, setTab, startExam }) {
  const labels = { dashboard: "Main Dashboard", quiz: "Quiz Engine", pbq: "PBQ Simulator", flashcards: "Flashcards", ports: "Ports & Protocols Drill", weak: "Weak Areas Review", exam: "Exam Simulation" };
  return e("header", { className: "topbar" },
    e("div", null, e("p", { className: "eyebrow" }, "CompTIA-style English questions · French explanations"), e("h2", null, labels[tab])),
    e("div", { className: "top-actions" }, e("button", { onClick: () => setTab("quiz"), className: "ghost" }, "Practice"), e("button", { onClick: () => startExam("A"), className: "primary" }, "Start Exam"))
  );
}

function Dashboard({ stats, setTab, startExam, now }) {
  const countdown = daysUntilExam(now);
  return e("section", null,
    e("div", { className: "metrics" },
      e(Metric, { label: "Readiness", value: `${stats.readiness}%` }),
      e(Metric, { label: "Answered", value: `${stats.answered}/${questions.length}` }),
      e(Metric, { label: "Accuracy", value: `${stats.accuracy}%` }),
      e(Metric, { label: "Exam Countdown", value: `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${String(countdown.seconds).padStart(2, "0")}s` })
    ),
    e("div", { className: "panel" },
      e("div", { className: "section-title" }, e("h3", null, "Domain Progress"), e("span", null, "Official SY0-701 weights")),
      domains.map((d) => e("div", { className: "domain-row", key: d.id },
        e("div", null, e("strong", null, `D${d.id}. ${d.name}`), e("small", null, `${d.weight}% exam weight`)),
        e("div", { className: "bar" }, e("i", { style: { width: `${stats.domains[d.id].completion}%` } })),
        e("b", null, `${stats.domains[d.id].completion}%`)
      ))
    ),
    e("div", { className: "quick-grid" },
      ["quiz", "pbq", "flashcards", "ports", "weak"].map((id) => e("button", { key: id, onClick: () => setTab(id), className: "mode-card" }, e("strong", null, id === "pbq" ? "PBQ Simulator" : id === "weak" ? "Weak Areas" : title(id)), e("span", null, modeHint(id)))),
      e("button", { onClick: () => startExam("A"), className: "mode-card highlight" }, e("strong", null, "90-Min Exam"), e("span", null, "Timed readiness check"))
    )
  );
}

function modeHint(id) {
  const hints = { quiz: "Targeted QCM practice", pbq: "Hands-on scenarios", flashcards: "Acronyms and concepts", ports: "Fast protocol drill", weak: "Review missed objectives" };
  return hints[id] || "Study mode";
}

function Metric({ label, value }) {
  return e("article", { className: "metric" }, e("span", null, label), e("strong", null, value));
}

function Badge({ label, tone = "neutral" }) {
  return e("span", { className: `badge ${tone}` }, label);
}

function Quiz(props) {
  const { currentQuestion, selected, answerQuiz, nextQuiz, restartQuiz, session, filteredQuestions, quizIndex, progress, setProgress, domainFilter, setDomainFilter, objectiveFilter, setObjectiveFilter } = props;
  const objectives = [...new Set(questions.map((item) => item.objective))];
  if (session.done) return e(Summary, { session, progress, restartQuiz });
  if (!currentQuestion) {
    return e("section", { className: "panel" },
      e("h3", null, "No questions match this filter"),
      e("p", null, "Choose another domain or sub-objective to continue practicing."),
      e("div", { className: "filters" },
        e("select", { value: domainFilter, onChange: (ev) => setDomainFilter(ev.target.value) }, e("option", { value: "all" }, "All domains"), domains.map((d) => e("option", { key: d.id, value: d.id }, `D${d.id} - ${d.name}`))),
        e("select", { value: objectiveFilter, onChange: (ev) => setObjectiveFilter(ev.target.value) }, e("option", { value: "all" }, "All objectives"), objectives.map((o) => e("option", { key: o, value: o }, o)))
      )
    );
  }
  return e("section", { className: "two-col" },
    e("div", { className: "panel" },
      e("div", { className: "filters" },
        e("select", { value: domainFilter, onChange: (ev) => setDomainFilter(ev.target.value) }, e("option", { value: "all" }, "All domains"), domains.map((d) => e("option", { key: d.id, value: d.id }, `D${d.id} - ${d.name}`))),
        e("select", { value: objectiveFilter, onChange: (ev) => setObjectiveFilter(ev.target.value) }, e("option", { value: "all" }, "All objectives"), objectives.map((o) => e("option", { key: o, value: o }, o)))
      ),
      e("div", { className: "status-strip" },
        e(Badge, { label: `D${currentQuestion.domain}` }),
        e(Badge, { label: `Objective ${currentQuestion.objective}` }),
        e(Badge, { label: `${quizIndex + 1}/${filteredQuestions.length}` }),
        progress.flagged[currentQuestion.id] && e(Badge, { label: "Flagged", tone: "warn" })
      ),
      e("h3", null, currentQuestion.prompt),
      e("div", { className: "answers" }, currentQuestion.options.map((option, i) => e("button", {
        key: option,
        onClick: () => answerQuiz(i),
        className: selected === null ? "" : i === currentQuestion.answer ? "correct" : selected === i ? "wrong" : "",
        disabled: selected !== null
      }, `${String.fromCharCode(65 + i)}. ${option}`))),
      selected !== null && e("div", { className: "explanation" }, e("strong", null, selected === currentQuestion.answer ? "Correct" : "Incorrect"), e("p", null, currentQuestion.explanationFr)),
      e("div", { className: "row-actions" },
        e("button", { className: "ghost", onClick: () => setProgress((p) => ({ ...p, flagged: { ...p.flagged, [currentQuestion.id]: !p.flagged[currentQuestion.id] } })) }, progress.flagged[currentQuestion.id] ? "Unflag" : "Flag for review"),
        e("button", { className: "primary", onClick: nextQuiz }, "Next")
      )
    ),
    e("aside", { className: "panel compact" },
      e("h3", null, "Session"),
      e("div", { className: "mini-stat" }, e("span", null, "Correct"), e("strong", null, `${session.correct}/${session.total}`)),
      e("div", { className: "mini-stat" }, e("span", null, "Accuracy"), e("strong", null, `${pct(session.correct, session.total)}%`)),
      e("div", { className: "mini-stat" }, e("span", null, "Filter size"), e("strong", null, filteredQuestions.length)),
      e("p", { className: "muted" }, "Feedback appears only after answering. Exam mode hides feedback until the end.")
    )
  );
}

function Summary({ session, progress, restartQuiz }) {
  const seconds = Math.round((Date.now() - session.started) / 1000);
  const weak = weakestObjectives(progress).slice(0, 5);
  return e("section", { className: "panel" },
    e("div", { className: "exam-status" },
      e("div", null, e("p", { className: "eyebrow" }, "Quiz complete"), e("h3", null, "Session Summary")),
      e("button", { className: "primary", onClick: restartQuiz }, "Restart quiz")
    ),
    e("div", { className: "summary-grid" }, e(Metric, { label: "Score", value: `${session.correct}/${session.total}` }), e(Metric, { label: "Accuracy", value: `${pct(session.correct, session.total)}%` }), e(Metric, { label: "Time Spent", value: `${Math.floor(seconds / 60)}m ${seconds % 60}s` })),
    e("h4", null, "Weak areas"),
    weak.length ? weak.map((w) => e("p", { key: w.objective }, `${w.objective}: ${w.missed} missed`)) : e("p", { className: "muted" }, "No weak areas yet.")
  );
}

function PBQ({ progress, setProgress }) {
  const [answers, setAnswers] = useState({});
  const [activePbq, setActivePbq] = useState(0);
  const [graded, setGraded] = useState({});

  function grade(pbq) {
    const score = gradePbqAnswer(pbq, answers);
    setGraded((g) => ({ ...g, [pbq.id]: true }));
    setProgress((p) => ({ ...p, pbq: { ...p.pbq, [pbq.id]: Math.round(score * 100) } }));
  }

  function reset(pbq) {
    setGraded((g) => { const n = { ...g }; delete n[pbq.id]; return n; });
    setProgress((p) => { const n = { ...p.pbq }; delete n[pbq.id]; return { ...p, pbq: n }; });
    setAnswers((a) => { const n = {}; Object.keys(a).forEach((k) => { if (!k.startsWith(pbq.id + "-")) n[k] = a[k]; }); return n; });
  }

  const pbq = pbqs[activePbq];
  const score = progress.pbq[pbq.id];
  const isGraded = !!graded[pbq.id];
  const scoreClass = score === undefined ? "" : score >= 80 ? "pass" : score >= 50 ? "partial" : "fail";
  const completedCount = pbqs.filter((p) => progress.pbq[p.id] !== undefined).length;
  const avgScore = completedCount > 0 ? Math.round(pbqs.reduce((s, p) => s + (progress.pbq[p.id] || 0), 0) / completedCount) : null;

  return e("section", { className: "stack" },
    e("div", { className: "panel" },
      e("div", { className: "pbq-chooser-header" },
        e("strong", null, "Choisir un PBQ"),
        e("span", { className: "muted" }, `${completedCount}/${pbqs.length} complétés`),
        avgScore !== null && e("span", { className: `pbq-avg pbq-avg-${avgScore >= 80 ? "pass" : avgScore >= 50 ? "partial" : "fail"}` }, `Moy. ${avgScore}%`)
      ),
      e("div", { className: "pbq-card-grid" }, pbqs.map((p, i) => {
        const s = progress.pbq[p.id];
        const stateClass = s === undefined ? "" : s >= 80 ? "pbq-card-pass" : s >= 50 ? "pbq-card-partial" : "pbq-card-fail";
        return e("button", { key: p.id, className: `pbq-card ${stateClass} ${i === activePbq ? "pbq-card-active" : ""}`, onClick: () => setActivePbq(i) },
          e("span", { className: `pbq-type-dot pbq-type-${p.type}` }),
          e("span", { className: "pbq-card-title" }, p.title),
          s !== undefined && e("span", { className: "pbq-card-score" }, `${s}%`)
        );
      }))
    ),
    e("div", { className: "panel" },
      e("div", { className: "pbq-toprow" },
        e("div", { className: "pbq-toprow-left" },
          e("span", { className: `pbq-type-badge pbq-type-${pbq.type}` }, pbq.type),
          e("span", { className: "muted", style: { fontSize: ".85rem" } }, `${activePbq + 1} / ${pbqs.length}`)
        ),
        e("div", { className: "pbq-nav" },
          e("button", { onClick: () => setActivePbq(Math.max(0, activePbq - 1)), disabled: activePbq === 0 }, "←"),
          e("button", { onClick: () => setActivePbq(Math.min(pbqs.length - 1, activePbq + 1)), disabled: activePbq === pbqs.length - 1 }, "→")
        )
      ),
      e("h3", null, pbq.title),
      e("p", null, pbq.instructions),
      pbq.type === "matching" && e("div", { className: "pbq-grid" },
        pbqChoices(pbq.pairs, activePbq + 17).map(([left, correctRight]) => {
          const key = `${pbq.id}-${left}`;
          const userVal = answers[key];
          const isCorrect = isGraded && userVal === correctRight;
          const isWrong = isGraded && userVal && userVal !== correctRight;
          return e("label", { key: left, className: `pbq-field ${isCorrect ? "field-correct" : isWrong ? "field-wrong" : ""}` },
            left,
            e("select", { value: userVal || "", disabled: isGraded, onChange: (ev) => setAnswers({ ...answers, [key]: ev.target.value }) },
              e("option", { value: "" }, "Choose"),
              pbqChoices(pbq.pairs.map(([, r]) => r), activePbq + 31).map((r) => e("option", { key: r, value: r }, r))
            ),
            isGraded && e("span", { className: `field-verdict ${isCorrect ? "verdict-ok" : "verdict-x"}` }, isCorrect ? "✓" : `✗ ${correctRight}`)
          );
        })
      ),
      pbq.type === "ordering" && e("div", { className: "pbq-grid" },
        pbq.order.map((correctStep, i) => {
          const key = `${pbq.id}-${i}`;
          const userVal = answers[key];
          const isCorrect = isGraded && userVal === correctStep;
          const isWrong = isGraded && userVal && userVal !== correctStep;
          return e("label", { key: i, className: `pbq-field ${isCorrect ? "field-correct" : isWrong ? "field-wrong" : ""}` },
            `Position ${i + 1}`,
            e("select", { value: userVal || "", disabled: isGraded, onChange: (ev) => setAnswers({ ...answers, [key]: ev.target.value }) },
              e("option", { value: "" }, "Choose"),
              pbqChoices(pbq.order, activePbq + 53).map((step) => e("option", { key: step, value: step }, step))
            ),
            isGraded && e("span", { className: `field-verdict ${isCorrect ? "verdict-ok" : "verdict-x"}` }, isCorrect ? "✓" : `✗ ${correctStep}`)
          );
        })
      ),
      pbq.type === "firewall" && e(Firewall, { pbq, answers, setAnswers, isGraded }),
      pbq.type === "log" && e(LogPBQ, { pbq, answers, setAnswers, isGraded }),
      pbq.type === "topology" && e(TopologyPBQ, { pbq, answers, setAnswers, isGraded }),
      pbq.type === "iam" && e(IAMPBQ, { pbq, answers, setAnswers, isGraded }),
      e("div", { className: "row-actions" },
        !isGraded && e("button", { className: "primary", onClick: () => grade(pbq) }, "Grade PBQ"),
        isGraded && e("button", { onClick: () => reset(pbq) }, "Reset"),
        isGraded && e("span", { className: `pbq-score pbq-score-${scoreClass}` }, `${score}%`)
      ),
      isGraded && e("p", { className: "explanation" }, pbq.explanation)
    ),
    e("div", { className: "panel" }, e("h3", null, "Security Controls Matrix"), controls.map(([type, example]) => e("p", { key: type }, e("strong", null, `${type}: `), example)))
  );
}

function Firewall({ pbq, answers, setAnswers, isGraded }) {
  return e("div", { className: "firewall" },
    e("div", { className: "rule rule-header" },
      ["ACTION", "PROTOCOL", "SRC", "DST", "PORT"].map((h) => e("span", { key: h, className: "rule-head" }, h))
    ),
    pbq.required.map((req, i) => {
      const allCorrect = isGraded && ["action", "protocol", "src", "dst", "port"].every((k) => answers[`${pbq.id}-${i}-${k}`] === req[k]);
      return e("div", { className: `rule ${isGraded ? (allCorrect ? "rule-correct" : "rule-wrong") : ""}`, key: i },
        ["action", "protocol", "src", "dst", "port"].map((k) => {
          const fieldCorrect = isGraded && answers[`${pbq.id}-${i}-${k}`] === req[k];
          return e("input", { key: k, placeholder: k, value: answers[`${pbq.id}-${i}-${k}`] || "", disabled: isGraded, className: isGraded ? (fieldCorrect ? "input-correct" : "input-wrong") : "", onChange: (ev) => setAnswers({ ...answers, [`${pbq.id}-${i}-${k}`]: ev.target.value }) });
        })
      );
    }),
    e("div", { className: "rule implicit" }, "Implicit deny · Any · Any · Any · Any")
  );
}

function SelectField({ label, value, options, onChange }) {
  return e("label", null, label, e("select", { value: value || "", onChange: (ev) => onChange(ev.target.value) }, e("option", { value: "" }, "Choose"), options.map((option) => e("option", { key: option, value: option }, option))));
}

function LogPBQ({ pbq, answers, setAnswers, isGraded }) {
  return e("div", { className: "log-pbq" },
    e("pre", { className: "log-window" }, pbq.logs.join("\n")),
    e("div", { className: "pbq-grid" }, pbq.fields.map((field) => {
      const key = `${pbq.id}-${field.label}`;
      const isCorrect = isGraded && answers[key] === field.answer;
      const isWrong = isGraded && answers[key] && answers[key] !== field.answer;
      return e("label", { key, className: `pbq-field ${isCorrect ? "field-correct" : isWrong ? "field-wrong" : ""}` },
        field.label,
        e("select", { value: answers[key] || "", disabled: isGraded, onChange: (ev) => setAnswers({ ...answers, [key]: ev.target.value }) },
          e("option", { value: "" }, "Choose"),
          field.options.map((option) => e("option", { key: option, value: option }, option))
        ),
        isGraded && e("span", { className: `field-verdict ${isCorrect ? "verdict-ok" : "verdict-x"}` }, isCorrect ? "✓" : `✗ ${field.answer}`)
      );
    }))
  );
}

function TopologyPBQ({ pbq, answers, setAnswers, isGraded }) {
  return e("div", null,
    e("div", { className: "topology-map" }, pbq.topology.map((zone) => e("span", { key: zone }, zone))),
    e("div", { className: "pbq-grid" }, pbq.placements.map((placement) => {
      const key = `${pbq.id}-${placement.slot}`;
      const isCorrect = isGraded && answers[key] === placement.answer;
      const isWrong = isGraded && answers[key] && answers[key] !== placement.answer;
      return e("label", { key, className: `pbq-field ${isCorrect ? "field-correct" : isWrong ? "field-wrong" : ""}` },
        placement.slot,
        e("select", { value: answers[key] || "", disabled: isGraded, onChange: (ev) => setAnswers({ ...answers, [key]: ev.target.value }) },
          e("option", { value: "" }, "Choose"),
          placement.options.map((option) => e("option", { key: option, value: option }, option))
        ),
        isGraded && e("span", { className: `field-verdict ${isCorrect ? "verdict-ok" : "verdict-x"}` }, isCorrect ? "✓" : `✗ ${placement.answer}`)
      );
    }))
  );
}

function IAMPBQ({ pbq, answers, setAnswers, isGraded }) {
  return e("div", { className: "iam-grid" },
    pbq.identities.map((identity) => {
      const roleKey = `${pbq.id}-${identity.subject}-role`;
      const controlKey = `${pbq.id}-${identity.subject}-control`;
      const roleCorrect = isGraded && answers[roleKey] === identity.role;
      const controlCorrect = isGraded && answers[controlKey] === identity.control;
      return e("div", { className: `iam-row ${isGraded ? (roleCorrect && controlCorrect ? "row-correct" : "row-wrong") : ""}`, key: identity.subject },
        e("strong", null, identity.subject),
        e("div", { className: "iam-field" },
          e("select", { value: answers[roleKey] || "", disabled: isGraded, onChange: (ev) => setAnswers({ ...answers, [roleKey]: ev.target.value }) },
            e("option", { value: "" }, "Choose role"),
            identity.roleOptions.map((option) => e("option", { key: option, value: option }, option))
          ),
          isGraded && e("span", { className: `field-verdict ${roleCorrect ? "verdict-ok" : "verdict-x"}` }, roleCorrect ? "✓" : `✗ ${identity.role}`)
        ),
        e("div", { className: "iam-field" },
          e("select", { value: answers[controlKey] || "", disabled: isGraded, onChange: (ev) => setAnswers({ ...answers, [controlKey]: ev.target.value }) },
            e("option", { value: "" }, "Choose control"),
            identity.controlOptions.map((option) => e("option", { key: option, value: option }, option))
          ),
          isGraded && e("span", { className: `field-verdict ${controlCorrect ? "verdict-ok" : "verdict-x"}` }, controlCorrect ? "✓" : `✗ ${identity.control}`)
        )
      );
    })
  );
}

function Flashcards({ currentCard, dueCards, flashDomainFilter, setFlashDomainFilter, flashSearch, setFlashSearch, flipped, setFlipped, setFlashIndex, progress, setProgress }) {
  const stats = flashcardStats(flashcards, progress.flashcards, flashDomainFilter, flashSearch);
  if (!currentCard) return e("section", { className: "panel" }, e("h3", null, "No flashcards in this filter"));
  function mark(status) {
    setProgress((p) => ({ ...p, flashcards: { ...p.flashcards, [flashcardKey(currentCard)]: status } }));
    setFlashIndex((i) => i + 1);
    setFlipped(false);
  }
  function skip(delta = 1) {
    setFlashIndex((i) => Math.max(0, i + delta));
    setFlipped(false);
  }
  useEffect(() => {
    function onKeyDown(ev) {
      const tag = ev.target?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if ([" ", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(ev.key)) ev.preventDefault();
      if (ev.key === " ") setFlipped((value) => !value);
      if (ev.key === "Enter") flipped ? mark("know") : setFlipped(true);
      if (ev.key === "ArrowRight") flipped ? mark("know") : skip(1);
      if (ev.key === "ArrowLeft") flipped ? mark("again") : skip(-1);
      if (ev.key === "ArrowUp") setFlipped(true);
      if (ev.key === "ArrowDown") flipped ? setFlipped(false) : skip(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flipped, currentCard?.id]);
  return e("section", { className: "two-col" },
    e("div", { className: "study" },
      e("div", { className: "filters" },
        e("select", { value: flashDomainFilter, onChange: (ev) => setFlashDomainFilter(ev.target.value) },
          e("option", { value: ALL_FILTER }, "All domains"),
          domains.map((d) => e("option", { key: d.id, value: d.id }, `D${d.id} - ${d.name}`))
        ),
        e("input", { className: "search-input", value: flashSearch, placeholder: "Search acronym or full name", onInput: (ev) => { setFlashSearch(ev.target.value); setFlashIndex(0); setFlipped(false); } }),
        e("button", { className: "ghost", onClick: () => skip(1) }, "Skip")
      ),
      e("button", { className: `flashcard ${flipped ? "flipped" : "front"}`, onClick: () => setFlipped(!flipped) }, flipped ? e("div", null,
        e("p", { className: "eyebrow" }, `Objective ${currentCard.objective} · Domain ${currentCard.domain}`),
        e("h3", null, currentCard.fullName),
        e("p", { className: "flash-definition" }, currentCard.definitionFr),
        e("div", { className: "flash-detail" },
          e("strong", null, "Example"),
          e("p", null, currentCard.example)
        ),
        currentCard.examTip && e("div", { className: "flash-detail good" },
          e("strong", null, "A retenir"),
          e("p", null, currentCard.examTip)
        ),
        currentCard.trap && e("div", { className: "flash-detail warn" },
          e("strong", null, "Piege examen"),
          e("p", null, currentCard.trap)
        ),
        currentCard.memoryHook && e("p", { className: "flash-hook" }, currentCard.memoryHook)
      ) : e("div", null,
        e("p", { className: "eyebrow" }, progress.flashcards[flashcardKey(currentCard)] === "again" ? "Due again" : "Term / Acronym"),
        e("h3", null, currentCard.term),
        e("p", null, "Tap to reveal the definition, example, exam tip, common trap, and memory hook.")
      )),
      e("div", { className: "row-actions center" },
        e("button", { className: "ghost danger", onClick: () => mark("again") }, "Study again"),
        e("button", { className: "primary", onClick: () => mark("know") }, "Know it")
      ),
      e("p", { className: "keyboard-hint" }, "Keyboard: Space flip · Enter know/reveal · ← again/previous · → know/next · ↑ reveal · ↓ hide/next")
    ),
    e("aside", { className: "panel compact" },
      e("h3", null, "Flashcard Review"),
      e("p", null, `${dueCards.length} cards in current deck`),
      e("div", { className: "mini-stat" }, e("span", null, "Study again"), e("strong", null, stats.again)),
      e("div", { className: "mini-stat" }, e("span", null, "Unseen"), e("strong", null, stats.unseen)),
      e("div", { className: "mini-stat" }, e("span", null, "Known"), e("strong", null, stats.known)),
      e("p", { className: "muted" }, "Cards marked Study again are shown more often. Known cards stay in rotation, but less frequently.")
    )
  );
}

function Ports({ currentPort, portIndex, ports, portMode, setPortMode, portSeconds, answerPort, nextPort, portFeedback, progress, timerPaused, toggleTimer }) {
  const question = buildPortQuestion(currentPort, ports, portMode, portIndex + (portMode === "port" ? 0 : 100));
  const attempts = progress.ports.attempts;
  const correct = attempts.filter((a) => a.correct).length;
  const avgSpeed = attempts.length ? Math.round(attempts.reduce((sum, a) => sum + (PORT_QUESTION_SECONDS - a.secondsLeft), 0) / attempts.length) : 0;
  const weakPorts = portWeaknesses(attempts);
  return e("section", { className: "two-col" },
    e("div", { className: "panel drill" },
      e("div", { className: "row-actions" },
        e("button", { className: portMode === "port" ? "primary" : "ghost", onClick: () => setPortMode("port") }, "Port -> Protocol"),
        e("button", { className: portMode === "protocol" ? "primary" : "ghost", onClick: () => setPortMode("protocol") }, "Protocol -> Port")
      ),
      e("div", { className: `timer ${portSeconds <= 3 ? "urgent" : ""} ${timerPaused ? "paused" : ""}` }, `${Math.floor(portSeconds / 60)}:${String(portSeconds % 60).padStart(2, "0")}`),
      e("button", { className: `timer-control ${timerPaused ? "paused" : ""}`, onClick: toggleTimer, disabled: Boolean(portFeedback) }, timerPaused ? "Resume timer" : "Pause timer"),
      timerPaused && e("p", { className: "timer-paused-label" }, "Paused"),
      e("p", { className: "eyebrow" }, "Ports & Protocols QCM"),
      e("h3", { className: "port-question" }, question.prompt),
      e("p", { className: "muted" }, question.details),
      e("div", { className: "answers" }, question.options.map((option, index) => e("button", { key: option, disabled: Boolean(portFeedback), className: portFeedback ? option === portFeedback.expected ? "correct" : option === portFeedback.answer ? "wrong" : "" : "", onClick: () => answerPort(option) }, `${String.fromCharCode(65 + index)}. ${option}`))),
      portFeedback && e("div", { className: portFeedback.correct ? "explanation" : "explanation port-miss" },
        e("strong", null, portFeedback.correct ? "Correct" : "A revoir"),
        e("p", null, portFeedbackFr(portFeedback)),
        e("button", { className: "primary", onClick: nextPort }, "Next port")
      )
    ),
    e("aside", { className: "panel compact" },
      e("h3", null, "Speed & Accuracy"),
      e("p", null, `${correct}/${attempts.length} correct`),
      e("p", null, `${pct(correct, attempts.length)}% accuracy`),
      e("p", null, `${avgSpeed}s average answer time`),
      e("h3", null, "Weak Ports"),
      weakPorts.length ? weakPorts.map((item) => e("div", { className: "mini-stat", key: item.label }, e("span", null, item.label), e("strong", null, item.missed))) : e("p", { className: "muted" }, "No missed ports yet.")
    )
  );
}

function WeakAreas({ weak, startWeakPractice }) {
  return e("section", { className: "panel" }, e("h3", null, "Weakest 5 Sub-objectives"), weak.length ? weak.slice(0, 5).map((item) => e("div", { className: "weak-row", key: item.objective }, e("div", null, e("strong", null, item.objective), e("p", null, `${item.missed} missed question(s)`)), e("button", { className: "ghost", onClick: () => alert(explainObjective(item.objective)) }, "Explain this concept"), e("button", { className: "primary", onClick: () => startWeakPractice(item.objective) }, "Target practice"))) : e("p", null, "No weak areas yet. Answer quiz questions to build your review list."));
}

function Exam({ exam, startExam, clearExam, submitExamAnswer, finishExam, moveExamIndex, examSecondsLeft, toggleTimer }) {
  const [reviewIndex, setReviewIndex] = useState(0);
  if (!exam) return e("section", { className: "panel exam-hero" },
    e("h3", null, "Exam A, B, C, D, E, and F"),
    e("p", null, "Each exam has 90 items, a 90-minute timer, official SY0-701 domain proportions, and no feedback until final review. Exams D, E, and F include PBQs."),
    e("div", { className: "exam-set-grid" }, examSets.map((set) => e("button", { key: set.id, className: "mode-card", onClick: () => startExam(set.id) },
      e("strong", null, set.title),
      e("span", null, set.description)
    )))
  );
  const result = gradeExam(exam);
  if (exam.submitted) {
    const byDomain = examDomainBreakdown(exam);
    const selectedIndex = Math.min(reviewIndex, exam.questions.length - 1);
    const selectedItem = exam.questions[selectedIndex];
    const correctCount = exam.questions.filter((item) => isExamItemCorrect(item, exam.answers[item.id])).length;
    return e("section", { className: "panel exam-review-page" },
      e("div", { className: "exam-status" },
        e("div", null,
          e("p", { className: "eyebrow" }, `Exam ${exam.examSet} review`),
          e("h3", null, `Final score: ${result.scaled}/900`),
          e("p", null, `${result.percent >= 83 ? "PASS" : "FAIL"} - ${formatScore(result.correct)}/${result.total} points`)
        ),
        e("div", { className: "status-strip" },
          e(Badge, { label: `${correctCount} correct`, tone: "ok" }),
          e(Badge, { label: `${exam.questions.length - correctCount} missed`, tone: "danger" }),
          e("button", { className: "ghost", onClick: clearExam }, "Choose another exam")
        )
      ),
      e("div", { className: "summary-grid" }, byDomain.map((d) => e(Metric, { key: d.id, label: `D${d.id}`, value: `${d.percent}%` }))),
      e("div", { className: "exam-progress review-grid" }, exam.questions.map((item, i) => {
        const correct = isExamItemCorrect(item, exam.answers[item.id]);
        const answered = isExamItemAnswered(item, exam.answers[item.id]);
        return e("button", {
          key: item.id,
          className: `${i === selectedIndex ? "current" : ""} ${correct ? "correct-review" : "missed-review"} ${!answered ? "unanswered-review" : ""} ${item.examType === "pbq" ? "pbq-dot" : ""}`,
          onClick: () => setReviewIndex(i),
          title: `${item.examType === "pbq" ? "PBQ" : "QCM"} ${correct ? "correct" : answered ? "missed" : "not answered"}`
        }, i + 1);
      })),
      e(ExamReviewDetail, { item: selectedItem, answer: exam.answers[selectedItem.id], index: selectedIndex })
    );
  }
  const current = exam.questions[exam.index];
  const answeredCount = exam.questions.filter((item) => isExamItemAnswered(item, exam.answers[item.id])).length;
  const pbqCount = exam.questions.filter((item) => item.examType === "pbq").length;
  return e("section", { className: "panel" },
    e("div", { className: "exam-status" },
      e("div", { className: "status-strip" },
        e(Badge, { label: `Exam ${exam.examSet}` }),
        e(Badge, { label: current.examType === "pbq" ? "PBQ" : "QCM", tone: current.examType === "pbq" ? "warn" : "neutral" }),
        e(Badge, { label: `Question ${exam.index + 1}/${exam.questions.length}` }),
        e(Badge, { label: `${answeredCount} answered` }),
        pbqCount > 0 && e(Badge, { label: `${pbqCount} PBQ`, tone: "ok" })
      ),
      e("div", { className: "timer-cluster" },
        e("div", { className: `exam-timer ${exam.paused ? "paused" : ""}` }, `Time left: ${Math.floor(examSecondsLeft / 60)}m ${String(examSecondsLeft % 60).padStart(2, "0")}s`),
        e("button", { className: `timer-control ${exam.paused ? "paused" : ""}`, onClick: toggleTimer }, exam.paused ? "Resume timer" : "Pause timer"),
        exam.paused && e(Badge, { label: "Paused", tone: "warn" })
      )
    ),
    e("div", { className: "exam-progress" }, exam.questions.map((item, i) => e("button", { key: item.id, className: `${i === exam.index ? "current" : ""} ${isExamItemAnswered(item, exam.answers[item.id]) ? "answered" : ""} ${item.examType === "pbq" ? "pbq-dot" : ""}`, onClick: () => moveExamIndex(i - exam.index), title: item.examType === "pbq" ? "PBQ" : "QCM" }, i + 1))),
    current.examType === "pbq"
      ? e(ExamPBQ, { item: current, answer: exam.answers[current.id] || {}, submitExamAnswer })
      : e(ExamMCQ, { current, answer: exam.answers[current.id], submitExamAnswer }),
    e("div", { className: "row-actions" }, e("button", { className: "ghost", onClick: () => moveExamIndex(-1) }, "Previous"), e("button", { className: "ghost", onClick: () => moveExamIndex(1) }, "Next"), e("button", { className: "primary", onClick: finishExam }, "Finish Exam"))
  );
}

function isExamItemAnswered(item, answer) {
  if (item.examType !== "pbq") return answer !== undefined;
  return answer && Object.keys(answer).length > 0;
}

function isExamItemCorrect(item, answer) {
  return gradeExamItem(item, answer) === 1;
}

function ExamReviewDetail({ item, answer, index }) {
  const score = gradeExamItem(item, answer);
  const answered = isExamItemAnswered(item, answer);
  const correct = score === 1;
  return e("div", { className: "review-detail" },
    e("div", { className: "status-strip" },
      e(Badge, { label: `Question ${index + 1}` }),
      e(Badge, { label: item.examType === "pbq" ? "PBQ" : "QCM", tone: item.examType === "pbq" ? "warn" : "neutral" }),
      e(Badge, { label: correct ? "Correct" : answered ? "Missed" : "Not answered", tone: correct ? "ok" : "danger" }),
      e(Badge, { label: `Objective ${item.objective}` })
    ),
    e("h3", null, examItemPrompt(item)),
    item.examType === "pbq"
      ? e(PBQReviewDetail, { item, answer, score })
      : e(MCQReviewDetail, { item, answer }),
    e("div", { className: correct ? "explanation" : "explanation port-miss" },
      e("strong", null, "Explanation"),
      e("p", null, item.examType === "pbq" ? `PBQ score: ${Math.round(score * 100)}%. ${item.explanationFr}` : item.explanationFr)
    )
  );
}

function MCQReviewDetail({ item, answer }) {
  return e("div", { className: "review-answer-list" },
    item.options.map((option, i) => e("div", {
      key: option,
      className: `review-answer ${i === item.answer ? "expected" : ""} ${answer === i && answer !== item.answer ? "chosen-wrong" : ""} ${answer === i && answer === item.answer ? "chosen-correct" : ""}`
    },
      e("strong", null, `${String.fromCharCode(65 + i)}.`),
      e("span", null, option),
      i === item.answer && e(Badge, { label: "Correct answer", tone: "ok" }),
      answer === i && e(Badge, { label: "Your answer", tone: i === item.answer ? "ok" : "danger" })
    )),
    answer === undefined && e("p", { className: "muted" }, "No answer was selected for this question.")
  );
}

function PBQReviewDetail({ item, answer = {}, score }) {
  const pbq = item.pbq;
  return e("div", { className: "review-answer-list" },
    e("p", null, pbq.instructions),
    e("div", { className: "mini-stat" }, e("span", null, "Partial credit"), e("strong", null, `${Math.round(score * 100)}%`)),
    pbq.type === "matching" && pbq.pairs.map(([left, right]) => e("div", { className: answer[`${pbq.id}-${left}`] === right ? "review-answer chosen-correct" : "review-answer chosen-wrong", key: left },
      e("strong", null, left),
      e("span", null, `Your answer: ${answer[`${pbq.id}-${left}`] || "Not answered"}`),
      e(Badge, { label: `Expected: ${right}`, tone: "ok" })
    )),
    pbq.type === "ordering" && pbq.order.map((step, i) => e("div", { className: answer[`${pbq.id}-${i}`] === step ? "review-answer chosen-correct" : "review-answer chosen-wrong", key: `${step}-${i}` },
      e("strong", null, `Position ${i + 1}`),
      e("span", null, `Your answer: ${answer[`${pbq.id}-${i}`] || "Not answered"}`),
      e(Badge, { label: `Expected: ${step}`, tone: "ok" })
    )),
    pbq.type === "firewall" && pbq.required.map((rule, i) => {
      const expected = ["action", "protocol", "src", "dst", "port"].map((k) => `${k}: ${rule[k]}`).join(" | ");
      const actual = ["action", "protocol", "src", "dst", "port"].map((k) => `${k}: ${answer[`${pbq.id}-${i}-${k}`] || "Not answered"}`).join(" | ");
      const correct = ["action", "protocol", "src", "dst", "port"].every((k) => answer[`${pbq.id}-${i}-${k}`] === rule[k]);
      return e("div", { className: correct ? "review-answer chosen-correct" : "review-answer chosen-wrong", key: i },
        e("strong", null, `Rule ${i + 1}`),
        e("span", null, `Your answer: ${actual}`),
        e(Badge, { label: `Expected: ${expected}`, tone: "ok" })
      );
    }),
    pbq.type === "log" && e("pre", { className: "log-window" }, pbq.logs.join("\n")),
    pbq.type === "log" && pbq.fields.map((field) => {
      const actual = answer[`${pbq.id}-${field.label}`];
      return e("div", { className: actual === field.answer ? "review-answer chosen-correct" : "review-answer chosen-wrong", key: field.label },
        e("strong", null, field.label),
        e("span", null, `Your answer: ${actual || "Not answered"}`),
        e(Badge, { label: `Expected: ${field.answer}`, tone: "ok" })
      );
    }),
    pbq.type === "topology" && pbq.placements.map((placement) => {
      const actual = answer[`${pbq.id}-${placement.slot}`];
      return e("div", { className: actual === placement.answer ? "review-answer chosen-correct" : "review-answer chosen-wrong", key: placement.slot },
        e("strong", null, placement.slot),
        e("span", null, `Your answer: ${actual || "Not answered"}`),
        e(Badge, { label: `Expected: ${placement.answer}`, tone: "ok" })
      );
    }),
    pbq.type === "iam" && pbq.identities.map((identity) => {
      const roleKey = `${pbq.id}-${identity.subject}-role`;
      const controlKey = `${pbq.id}-${identity.subject}-control`;
      const roleOk = answer[roleKey] === identity.role;
      const controlOk = answer[controlKey] === identity.control;
      return e("div", { className: roleOk && controlOk ? "review-answer chosen-correct" : "review-answer chosen-wrong", key: identity.subject },
        e("strong", null, identity.subject),
        e("span", null, `Role: ${answer[roleKey] || "Not answered"} | Control: ${answer[controlKey] || "Not answered"}`),
        e(Badge, { label: `Expected: ${identity.role} + ${identity.control}`, tone: "ok" })
      );
    })
  );
}

function ExamMCQ({ current, answer, submitExamAnswer }) {
  return e("div", null,
    e("h3", null, current.prompt),
    e("div", { className: "answers" }, current.options.map((option, i) => e("button", { key: option, className: answer === i ? "selected" : "", onClick: () => submitExamAnswer(current.id, i) }, `${String.fromCharCode(65 + i)}. ${option}`)))
  );
}

function ExamPBQ({ item, answer, submitExamAnswer }) {
  const pbq = item.pbq;
  function update(key, value) {
    submitExamAnswer(item.id, { ...answer, [key]: value });
  }
  return e("div", null,
    e("p", { className: "eyebrow" }, `PBQ · ${pbq.type}`),
    e("h3", null, pbq.title),
    e("p", null, pbq.instructions),
    pbq.type === "matching" && e("div", { className: "pbq-grid" }, pbqChoices(pbq.pairs, item.seed + 17).map(([left]) => {
      const key = `${pbq.id}-${left}`;
      return e("label", { key: left }, left, e("select", { value: answer[key] || "", onChange: (ev) => update(key, ev.target.value) }, e("option", { value: "" }, "Choose"), pbqChoices(pbq.pairs.map(([, right]) => right), item.seed + 31).map((right) => e("option", { key: right, value: right }, right))));
    })),
    pbq.type === "ordering" && e("div", { className: "pbq-grid" }, pbq.order.map((_, i) => {
      const key = `${pbq.id}-${i}`;
      return e("label", { key: i }, `Position ${i + 1}`, e("select", { value: answer[key] || "", onChange: (ev) => update(key, ev.target.value) }, e("option", { value: "" }, "Choose"), pbqChoices(pbq.order, item.seed + 53).map((step) => e("option", { key: step, value: step }, step))));
    })),
    pbq.type === "firewall" && e("div", { className: "firewall" },
      pbq.required.map((_, i) => e("div", { className: "rule", key: i }, ["action", "protocol", "src", "dst", "port"].map((k) => {
        const key = `${pbq.id}-${i}-${k}`;
        return e("input", { key: k, placeholder: k, value: answer[key] || "", onChange: (ev) => update(key, ev.target.value) });
      }))),
      e("div", { className: "rule implicit" }, "Implicit deny · Any · Any · Any · Any")
    ),
    pbq.type === "log" && e("div", { className: "log-pbq" },
      e("pre", { className: "log-window" }, pbq.logs.join("\n")),
      e("div", { className: "pbq-grid" }, pbq.fields.map((field) => {
        const key = `${pbq.id}-${field.label}`;
        return e(SelectField, { key, label: field.label, value: answer[key], options: field.options, onChange: (value) => update(key, value) });
      }))
    ),
    pbq.type === "topology" && e("div", null,
      e("div", { className: "topology-map" }, pbq.topology.map((zone) => e("span", { key: zone }, zone))),
      e("div", { className: "pbq-grid" }, pbq.placements.map((placement) => {
        const key = `${pbq.id}-${placement.slot}`;
        return e(SelectField, { key, label: placement.slot, value: answer[key], options: placement.options, onChange: (value) => update(key, value) });
      }))
    ),
    pbq.type === "iam" && e("div", { className: "iam-grid" },
      pbq.identities.map((identity) => {
        const roleKey = `${pbq.id}-${identity.subject}-role`;
        const controlKey = `${pbq.id}-${identity.subject}-control`;
        return e("div", { className: "iam-row", key: identity.subject },
          e("strong", null, identity.subject),
          e("select", { value: answer[roleKey] || "", onChange: (ev) => update(roleKey, ev.target.value) }, e("option", { value: "" }, "Choose role"), identity.roleOptions.map((option) => e("option", { key: option, value: option }, option))),
          e("select", { value: answer[controlKey] || "", onChange: (ev) => update(controlKey, ev.target.value) }, e("option", { value: "" }, "Choose control"), identity.controlOptions.map((option) => e("option", { key: option, value: option }, option)))
        );
      })
    )
  );
}

function examItemPrompt(item) {
  return item.examType === "pbq" ? item.pbq.title : item.prompt;
}

function formatScore(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function buildStats(progress) {
  const entries = Object.values(progress.answers);
  const correct = entries.filter((a) => a.correct).length;
  const byDomain = {};
  domains.forEach((d) => {
    const total = questions.filter((q) => q.domain === d.id).length;
    const answered = entries.filter((a) => a.domain === d.id).length;
    byDomain[d.id] = { completion: pct(answered, total) };
  });
  return { answered: entries.length, accuracy: pct(correct, entries.length), readiness: Math.round((pct(correct, questions.length) + pct(entries.length, questions.length)) / 2), domains: byDomain };
}

function weakestObjectives(progress) {
  const misses = {};
  Object.values(progress.answers).forEach((a) => {
    if (!a.correct) misses[a.objective] = (misses[a.objective] || 0) + 1;
  });
  return Object.entries(misses).map(([objective, missed]) => ({ objective, missed })).sort((a, b) => b.missed - a.missed);
}

function buildExamQuestions(examSet = "A") {
  const offsets = { A: 0, B: 7, C: 14, D: 21, E: 35, F: 49 };
  const pbqPlans = {
    D: ["pbq26", "pbq27", "pbq29", "pbq14", "pbq15"],
    E: ["pbq30", "pbq31", "pbq32", "pbq20", "pbq21"],
    F: ["pbq28", "pbq33", "pbq12", "pbq17", "pbq25"]
  };
  const selectedPbqs = pbqPlans[examSet] ? buildExamPbqs(pbqPlans[examSet], examSet) : [];
  const mcqCounts = buildExamMcqCounts(selectedPbqs);
  const picked = [...selectedPbqs];
  domains.forEach((d) => {
    const count = mcqCounts[d.id];
    const pool = rotate(questions.filter((q) => q.domain === d.id), offsets[examSet] || 0);
    if (!pool.length) return;
    for (let i = 0; i < count; i += 1) picked.push(pool[(i + (offsets[examSet] || 0)) % pool.length]);
  });
  return rotate(picked, offsets[examSet] || 0).slice(0, 90).map((item, i) => item.examType === "pbq" ? item : makeExamVariant(item, examSet, i));
}

function buildExamMcqCounts(selectedPbqs) {
  const counts = { ...EXAM_DOMAIN_COUNTS };
  selectedPbqs.forEach((item) => {
    counts[item.domain] = Math.max(0, counts[item.domain] - 1);
  });
  return counts;
}

function buildExamPbqs(ids, examSet) {
  return ids.map((id, index) => {
    const pbq = pbqs.find((item) => item.id === id);
    const meta = pbqExamMeta(id);
    return {
      id: `${id}-exam-${examSet}`,
      examType: "pbq",
      pbq,
      domain: meta.domain,
      objective: meta.objective,
      explanationFr: pbq.explanation,
      seed: stableScore(`${examSet}-${id}`, index)
    };
  }).filter((item) => item.pbq);
}

function pbqExamMeta(id) {
  const map = {
    pbq3: ["3", "3.1"],
    pbq9: ["3", "3.2"],
    pbq11: ["1", "1.2"],
    pbq12: ["4", "4.1"],
    pbq13: ["3", "3.2"],
    pbq14: ["3", "3.1"],
    pbq15: ["4", "4.6"],
    pbq16: ["5", "5.1"],
    pbq17: ["5", "5.2"],
    pbq18: ["5", "5.4"],
    pbq20: ["2", "2.4"],
    pbq21: ["4", "4.1"],
    pbq22: ["5", "5.2"],
    pbq24: ["3", "3.4"],
    pbq25: ["5", "5.1"],
    pbq26: ["3", "3.2"],
    pbq27: ["4", "4.1"],
    pbq28: ["2", "2.4"],
    pbq29: ["3", "3.1"],
    pbq30: ["1", "1.2"],
    pbq31: ["1", "1.2"],
    pbq32: ["4", "4.3"],
    pbq33: ["3", "3.1"]
  };
  const [domain, objective] = map[id] || ["4", "4.1"];
  return { domain, objective };
}

function rotate(items, offset) {
  if (!items.length) return [];
  return items.map((_, index) => items[(index + offset) % items.length]);
}

function makeExamVariant(item, examSet, index) {
  const setLead = {
    A: "",
    B: item.scenario ? "" : "A security analyst is reviewing a control decision. ",
    C: item.scenario ? "" : "A company is preparing for a SY0-701 audit. "
  }[examSet] || "";
  const variant = {
    ...item,
    id: `${item.id}-exam-${examSet}-${index}`,
    prompt: `${setLead}${item.prompt}`
  };
  return mixQuestionOptions(variant, index + stableScore(examSet, index));
}

function explainObjective(objective) {
  const text = {
    "1.1": "Concepts de securite: savoir classer les controles et comprendre leur role.",
    "1.2": "IAM et authentification: facteurs, attributs, federation, PAM, SSO, Kerberos et controle d'acces.",
    "1.4": "Cryptographie et protection des donnees: hachage, chiffrement, PKI, signatures, certificats et non-repudiation.",
    "2.1": "Menaces et vecteurs: acteurs, motivation, surface d'attaque, social engineering et risques tiers.",
    "2.2": "Gestion des vulnerabilites: CVE, CVSS, configurations faibles, patching, renseignement de menace et remediation.",
    "2.4": "Vulnerabilites applicatives: reconnaitre injection, XSS et mauvaises validations.",
    "2.5": "Activite malveillante: malware, attaques de mots de passe, IOC/IOA, privilege escalation, URL et attaques web.",
    "3.1": "Architecture reseau: segmentation, DMZ, firewalls, switching/routing, SPAN/TAP et protocoles securises.",
    "3.2": "Cloud et zero trust: modeles cloud, responsabilite partagee, VPC, CASB, IaC, serverless et edge.",
    "3.4": "Resilience: sauvegardes, redondance, RAID, replication, HA, restauration, honeypots et securite physique.",
    "4.1": "Incident response: preparation, identification, containment, eradication, recovery, lessons learned et playbooks.",
    "4.3": "Endpoint/mobile: hardening, patching, EPP, sandboxing, segmentation, MDM/MAM et connexions mobiles.",
    "4.6": "Operations reseau: hardening, Wi-Fi, 802.1X, NAC, IDS/IPS, NGFW, UTM, WAF et web filtering.",
    "4.8": "Ports et protocoles: associer services, ports et transport TCP/UDP.",
    "5.1": "Risque et assurance: calculs SLE/ALE/ARO, traitement du risque, BIA, audit, tiers et pentest.",
    "5.2": "Donnees et conformite: roles data, classification, souverainete, DLP, et technologies privacy.",
    "5.4": "Gouvernance: regulations, ISO/CSA/SOC, roles, politiques, standards, change management et orchestration."
  };
  const related = guideTopics.filter((topic) => topic.objective === objective).map((topic) => `Section ${topic.section}: ${topic.title}`);
  const coverage = related.length ? ` Couverture guide: ${related.join("; ")}.` : "";
  return `${text[objective] || `Objectif ${objective}: revois les termes cles, les scenarios et les controles associes.`}${coverage}`;
}

function title(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function e(type, props, ...children) {
  return React.createElement(type, props, ...children);
}

ReactDOM.createRoot(document.getElementById("root")).render(e(App));
