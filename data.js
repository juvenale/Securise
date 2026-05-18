function q(id, domain, objective, prompt, options, answer, explanationFr, scenario, meta = {}) {
  return { id, domain, objective, prompt, options, answer, explanationFr, scenario, ...meta };
}

function guideTopic(section, title, domain, objective, concepts) {
  return { section, title, domain, objective, concepts };
}

function c(term, summary, examUse, correct) {
  return { term, summary, examUse, correct };
}

const domains = [
  { id: "1", name: "General Security Concepts", weight: 12 },
  { id: "2", name: "Threats, Vulnerabilities, and Mitigations", weight: 22 },
  { id: "3", name: "Security Architecture", weight: 18 },
  { id: "4", name: "Security Operations", weight: 28 },
  { id: "5", name: "Security Program Management and Oversight", weight: 20 }
];

const examSets = [
  { id: "A", title: "Exam A", description: "Foundation readiness exam with broad objective coverage." },
  { id: "B", title: "Exam B", description: "Scenario-heavy exam emphasizing operations and architecture." },
  { id: "C", title: "Exam C", description: "Final readiness exam with more governance and mitigation review." },
  { id: "D", title: "Exam D", description: "Full exam with PBQs mixed into network, cloud, and operations scenarios." },
  { id: "E", title: "Exam E", description: "Full exam with PBQs focused on IAM, incident response, and governance." },
  { id: "F", title: "Exam F", description: "Full exam with PBQs covering forensics, risk, privacy, and resilience." }
];

const baseQuestions = [
  q("q1", "1", "1.1", "Which control type is BEST described as discouraging an attacker from attempting a break-in?", ["Detective", "Deterrent", "Corrective", "Compensating"], 1, "Un controle dissuasif reduit la probabilite d'une attaque en rendant l'action moins attractive. Detective signale apres ou pendant l'evenement. Corrective restaure l'etat normal. Compensating remplace un controle impossible a appliquer.", false, { optionExplanations: ["Détectif. Ce contrôle identifie une attaque après qu'elle ait commencé ou eu lieu, il ne dissuade pas l'attaquant en amont.","Dissuasif. Ce type de contrôle rend l'attaque moins attractive ou plus difficile, décourageant ainsi l'attaquant avant même la tentative d'intrusion.","Correctif. Ce contrôle vise à restaurer un système à son état normal après un incident, il n'a pas pour but de dissuader une attaque initiale.","Compensatoire. Ce contrôle est une alternative mise en place quand un contrôle primaire ne peut être appliqué, il ne dissuade pas directement les attaquants."] }),
  q("q2", "1", "1.2", "A company wants to verify user identity, device health, and location before granting access. Which model is MOST appropriate?", ["Implicit trust", "Zero trust", "Open authorization", "Security through obscurity"], 1, "Zero trust verifie explicitement chaque demande avec le contexte complet. Implicit trust fait confiance au reseau interne. OAuth n'est qu'un cadre d'autorisation. L'obscurite ne constitue pas un modele d'acces robuste.", true, { optionExplanations: ["Confiance implicite : Fait confiance par défaut aux entités internes, sans vérification explicite de l'identité, de la santé de l'appareil ou de la localisation, contrairement au besoin.","Zero trust : Vérifie explicitement et continuellement l'identité, la santé de l'appareil et la localisation avant chaque accès, répondant parfaitement au scénario.","Open authorization (OAuth) : Cadre d'autorisation pour déléguer l'accès aux ressources, mais ne vérifie pas la santé de l'appareil ou la localisation pour l'accès initial.","Sécurité par l'obscurité : Repose sur le secret des détails du système, non sur une vérification active de l'identité, de la santé de l'appareil ou de la localisation."] }),
  q("q3", "1", "1.4", "Which concept PRIMARILY ensures a user receives only the permissions required for a role?", ["Least privilege", "Non-repudiation", "Hashing", "Availability"], 0, "Le moindre privilege limite les droits au strict necessaire. La non-repudiation prouve l'origine. Le hachage controle l'integrite. La disponibilite garantit l'acces aux services.", false, { optionExplanations: ["Moindre privilège limite les droits d'un utilisateur au strict nécessaire pour sa fonction, empêchant l'accès non autorisé aux ressources superflues.","Non-répudiation assure la preuve de l'origine d'une action ou d'un message, mais ne gère pas l'attribution ou la restriction des permissions.","Hachage garantit l'intégrité des données en détectant les modifications, mais n'a aucun rôle dans la définition des permissions d'un utilisateur.","Disponibilité assure que les systèmes et services sont accessibles aux utilisateurs autorisés, sans réguler la portée de leurs permissions."] }),
  q("q4", "1", "1.5", "Which of the following is the BEST example of non-repudiation?", ["A signed email", "A locked server room", "A redundant firewall", "A privacy notice"], 0, "Une signature numerique lie l'expediteur a l'action. Le verrou physique protege l'acces. La redondance ameliore la disponibilite. L'avis de confidentialite informe mais ne prouve pas l'auteur.", false, { optionExplanations: ["Email signé: La signature numérique lie cryptographiquement l'expéditeur au contenu, prouvant l'origine et l'intégrité, empêchant toute contestation d'envoi.","Salle serveur verrouillée: Assure la sécurité physique et le contrôle d'accès aux équipements, mais ne prouve pas l'auteur d'une action numérique ou son non-déni.","Pare-feu redondant: Améliore la disponibilité et la résilience du réseau en cas de défaillance, mais n'apporte aucune preuve d'origine ou de non-répudiation d'une action.","Avis de confidentialité: Informe les utilisateurs sur la collecte et l'utilisation des données, mais ne fournit aucune preuve d'identité ou de non-répudiation d'une action spécifique."] }),
  q("q5", "2", "2.1", "A security analyst receives an alert that a user entered credentials into a fake login page. What attack is MOST likely?", ["Phishing", "DNS poisoning", "Birthday attack", "Pass-the-hash"], 0, "Le phishing trompe l'utilisateur pour obtenir des identifiants. DNS poisoning redirige la resolution de noms. Birthday attack cible les collisions de hachage. Pass-the-hash reutilise un hash vole.", true, { optionExplanations: ["Phishing trompe l'utilisateur avec une fausse page de connexion pour voler ses identifiants, ce qui correspond parfaitement au scénario décrit.","DNS poisoning redirige le trafic vers un site malveillant en corrompant la résolution de noms, mais ne décrit pas l'acte de la fausse page de connexion elle-même.","Birthday attack vise à trouver des collisions dans les fonctions de hachage, ce qui est sans lien avec le vol d'identifiants via une page de connexion falsifiée.","Pass-the-hash réutilise un hachage de mot de passe volé pour l'authentification, mais ne concerne pas la saisie d'identifiants sur une fausse page."] }),
  q("q6", "2", "2.2", "A company finds that an attacker exploited an unpatched web component. What should be done FIRST to reduce recurrence?", ["Disable backups", "Prioritize patch management", "Increase password length only", "Remove network monitoring"], 1, "La gestion des correctifs traite directement la cause. Desactiver les sauvegardes augmente le risque. Le mot de passe ne corrige pas le composant vulnerable. Supprimer la surveillance diminue la visibilite.", true, { optionExplanations: ["Sauvegardes. Les désactiver n'empêche pas l'exploitation d'une vulnérabilité logicielle et compromet la récupération des données.","Gestion des correctifs. Elle corrige directement la vulnérabilité du composant web non patché, éliminant la cause racine de l'exploitation.","Longueur du mot de passe. Augmenter la longueur des mots de passe ne corrige pas la vulnérabilité logicielle du composant web exploité.","Surveillance réseau. La supprimer réduit la visibilité sur les activités malveillantes et n'empêche pas l'exploitation des vulnérabilités logicielles."] }),
  q("q7", "2", "2.4", "Which vulnerability is MOST associated with unsanitized input being interpreted as database commands?", ["SQL injection", "On-path attack", "Typosquatting", "Bluejacking"], 0, "L'injection SQL se produit quand l'entree utilisateur devient une commande SQL. On-path intercepte le trafic. Typosquatting imite un nom de domaine. Bluejacking cible Bluetooth.", false, { optionExplanations: ["SQL injection permet à une entrée non validée d'être exécutée comme une commande de base de données, exploitant directement le scénario décrit.","On-path attack intercepte le trafic réseau entre deux parties, mais n'implique pas l'interprétation d'entrées comme des commandes SQL.","Typosquatting consiste à enregistrer des noms de domaine similaires pour tromper les utilisateurs, sans lien avec les commandes de base de données.","Bluejacking envoie des messages non sollicités via Bluetooth, une technologie sans fil, sans rapport avec les vulnérabilités SQL."] }),
  q("q8", "2", "2.5", "A security analyst notices repeated failed logins followed by a success from a foreign IP. Which mitigation is BEST?", ["Enable MFA and account lockout", "Disable audit logs", "Permit all VPN sources", "Use shared administrator accounts"], 0, "MFA et verrouillage reduisent le risque de compromission par force brute. Desactiver les logs cache l'incident. Autoriser toutes les sources et partager les comptes augmentent l'exposition.", true, { optionExplanations: ["MFA et verrouillage de compte. L'MFA ajoute une couche de sécurité essentielle, rendant l'accès difficile même avec un mot de passe compromis. Le verrouillage stoppe les tentatives de force brute.","Désactiver les logs d'audit. Cela masquerait l'attaque en cours et empêcherait toute investigation ou détection future des activités suspectes.","Autoriser toutes les sources VPN. Cela augmenterait la surface d'attaque en permettant des connexions depuis n'importe quelle source, y compris des sources potentiellement malveillantes.","Utiliser des comptes administrateur partagés. Cela rendrait la traçabilité impossible et augmenterait le risque de compromission sans attribution claire des responsabilités."] }),
  q("q9", "2", "2.7", "Which activity is LEAST likely to be part of threat hunting?", ["Searching logs for unusual patterns", "Testing hypotheses about attacker behavior", "Waiting only for automated alerts", "Reviewing endpoint telemetry"], 2, "La chasse aux menaces est proactive. Attendre uniquement les alertes est reactif. Chercher des motifs, tester des hypotheses et analyser la telemetrie font partie du processus.", false, { optionExplanations: ["Recherche de logs: C'est une activité proactive essentielle pour identifier des anomalies et des indicateurs de compromission non détectés par les systèmes automatiques.","Test d'hypothèses: Les chasseurs de menaces élaborent des scénarios d'attaque pour guider leurs recherches et valider la présence d'activités malveillantes.","Attente d'alertes: La chasse aux menaces est proactive. Attendre uniquement les alertes est une approche réactive, non une activité de recherche active de menaces.","Analyse de télémétrie: L'examen des données des endpoints (processus, connexions) est crucial pour détecter des comportements suspects et des menaces avancées."] }),
  q("q10", "3", "3.1", "Which architecture choice BEST limits lateral movement after a workstation compromise?", ["Flat network", "Network segmentation", "Single shared admin account", "Public IPs for all hosts"], 1, "La segmentation isole les zones et limite les deplacements lateraux. Un reseau plat facilite la propagation. Les comptes partages et IP publiques augmentent le risque.", false, { optionExplanations: ["Réseau plat: Facilite la propagation des menaces car toutes les machines sont sur le même segment, permettant un mouvement latéral sans entrave.","Segmentation réseau: Isole les zones, confinant les attaquants à un segment compromis et rendant le mouvement latéral vers d'autres zones beaucoup plus difficile.","Compte admin partagé unique: Si compromis, il offre un accès privilégié étendu, facilitant grandement le mouvement latéral à travers de multiples systèmes.","IP publiques pour tous les hôtes: Expose chaque machine directement à Internet, augmentant drastiquement la surface d'attaque et le risque de compromission initiale."] }),
  q("q11", "3", "3.2", "A company needs encrypted web traffic for an online portal. Which protocol is MOST appropriate?", ["HTTP", "HTTPS", "Telnet", "SNMPv1"], 1, "HTTPS chiffre HTTP avec TLS. HTTP et Telnet sont non chiffres. SNMPv1 n'est pas adapte a un portail web securise.", true, { optionExplanations: ["HTTP transmet les données en clair, sans chiffrement, ce qui est incompatible avec le besoin de trafic web chiffré pour un portail.","HTTPS chiffre le trafic web via TLS/SSL, assurant la confidentialité et l'intégrité des données, essentiel pour un portail en ligne sécurisé.","Telnet est un protocole de connexion à distance non chiffré et n'est pas conçu pour le trafic web d'un portail en ligne.","SNMPv1 est un protocole de gestion de réseau, non adapté au trafic web d'un portail et ne fournit pas le chiffrement requis."] }),
  q("q12", "3", "3.3", "Which cryptographic control BEST protects password storage?", ["Salted hashing", "Symmetric encryption only", "Plaintext backup", "Base64 encoding"], 0, "Le hachage sale protege les mots de passe et rend les attaques par tables pre-calculées plus difficiles. Le chiffrement reversible seul expose la cle. Le texte clair et Base64 ne protegent pas correctement.", false, { optionExplanations: ["Le hachage salé ajoute un sel unique à chaque mot de passe avant hachage, rendant les attaques par tables arc-en-ciel inefficaces et protégeant le stockage.","Le chiffrement symétrique seul nécessite de stocker la clé de déchiffrement, ce qui expose potentiellement tous les mots de passe si la clé est compromise.","Le stockage en texte clair ne fournit aucune protection cryptographique, exposant directement les mots de passe en cas de fuite de données.","L'encodage Base64 est une transformation de format, pas un mécanisme de sécurité; il ne protège pas la confidentialité des mots de passe stockés."] }),
  q("q13", "3", "3.4", "A company wants high availability for a critical application. Which design is BEST?", ["Single server with no backup", "Load balancing across redundant nodes", "One local account for all admins", "Disable monitoring during maintenance"], 1, "La redondance avec equilibrage augmente la disponibilite. Un serveur unique est un point de defaillance. Le compte partage nuit a la responsabilite. Desactiver la surveillance reduit la detection.", true, { optionExplanations: ["Serveur unique: Crée un point de défaillance unique (SPOF), rendant l'application indisponible en cas de panne.","Équilibrage de charge: Distribue le trafic sur plusieurs nœuds redondants, assurant la continuité et la disponibilité même en cas de panne d'un nœud.","Compte partagé: Nuit à la traçabilité des actions et à la responsabilisation des administrateurs, sans lien direct avec la disponibilité de l'application.","Désactiver la surveillance: Empêche la détection rapide des incidents ou pannes pendant la maintenance, augmentant les risques d'indisponibilité prolongée."] }),
  q("q14", "4", "4.1", "During incident response, what should be done FIRST after validating that an incident is occurring?", ["Contain the incident", "Delete evidence", "Notify social media", "Reinstall every server"], 0, "Apres validation, le confinement limite l'impact. Supprimer les preuves nuit a l'analyse. La communication publique n'est pas la premiere action technique. Reinstaller tout est excessif sans analyse.", false, { optionExplanations: ["Confinement de l'incident: Cette étape est cruciale pour limiter la propagation et l'impact de l'attaque, protégeant ainsi les systèmes et données restants.","Suppression des preuves: Cela détruirait les données forensiques vitales pour l'analyse de la cause racine et la réponse future à l'incident.","Notification des médias sociaux: C'est une action de communication publique prématurée, non technique, qui doit suivre des protocoles établis après confinement.","Réinstallation des serveurs: C'est une mesure drastique et prématurée qui causerait une interruption majeure sans comprendre la cause racine de l'incident."] }),
  q("q15", "4", "4.2", "A security analyst is reviewing logs from many systems in one place. Which solution is MOST likely being used?", ["SIEM", "NAT", "RAID", "WPA3"], 0, "Un SIEM centralise et correle les journaux. NAT traduit les adresses. RAID gere les disques. WPA3 securise le Wi-Fi.", true, { optionExplanations: ["SIEM centralise et agrège les journaux de multiples systèmes, permettant une analyse de sécurité unifiée et une corrélation des événements.","NAT traduit les adresses IP entre réseaux, facilitant la connectivité mais n'ayant aucun rôle dans la collecte ou l'analyse des journaux.","RAID gère le stockage des données sur plusieurs disques pour la redondance ou la performance, sans lien avec la centralisation des journaux.","WPA3 sécurise les réseaux Wi-Fi en chiffrant les communications sans fil, mais ne contribue pas à la centralisation des journaux système."] }),
  q("q16", "4", "4.3", "Which action is MOST appropriate when malware is detected on a laptop containing evidence?", ["Isolate the laptop from the network", "Wipe the disk immediately", "Share the user password", "Ignore until business hours"], 0, "L'isolation stoppe la propagation tout en preservant les preuves. Effacer le disque detruit les elements d'enquete. Partager le mot de passe et attendre augmentent le risque.", true, { optionExplanations: ["Isolation réseau stoppe la propagation du malware et préserve l'état du système et les preuves numériques pour l'analyse forensique sans altération.","Effacement du disque détruit irrémédiablement toutes les preuves numériques et les artefacts du malware, rendant toute investigation forensique impossible.","Partage de mot de passe compromet la sécurité des accès, viole les politiques de sécurité et n'apporte aucune solution technique à la détection du malware.","Ignorer l'incident permet au malware de se propager, de causer plus de dommages ou de corrompre/chiffrer les preuves avant toute intervention."] }),
  q("q17", "4", "4.8", "Which port is commonly associated with RDP?", ["22", "443", "3389", "1812"], 2, "RDP utilise couramment TCP 3389. 22 est SSH. 443 est HTTPS. 1812 est RADIUS authentication.", false),
  q("q18", "5", "5.1", "Which document BEST records risk owners, likelihood, impact, and treatment decisions?", ["Risk register", "Packet capture", "Certificate signing request", "Firewall ACL"], 0, "Le registre des risques suit proprietaires, probabilite, impact et traitement. Une capture reseau contient du trafic. Une CSR demande un certificat. Une ACL filtre le trafic.", false),
  q("q19", "5", "5.3", "A company must prove controls are working for a regulator. Which activity is MOST appropriate?", ["Audit", "Port mirroring only", "Credential stuffing", "Disabling change control"], 0, "Un audit evalue et documente l'efficacite des controles. Le mirroring aide l'analyse reseau mais ne prouve pas seul la conformite. Credential stuffing est une attaque. Supprimer le changement affaiblit la gouvernance.", true),
  q("q20", "5", "5.4", "Which policy is MOST likely to define acceptable employee use of company systems?", ["AUP", "BIA", "MTTR", "CSR"], 0, "L'AUP decrit l'utilisation acceptable. Le BIA analyse l'impact metier. MTTR mesure le temps moyen de reparation. CSR est une demande de signature de certificat.", false),
  q("q21", "1", "1.1", "Which security control category is PRIMARILY intended to identify that an event has occurred?", ["Preventive", "Detective", "Deterrent", "Directive"], 1, "Un controle detective signale ou revele un evenement. Preventive bloque avant l'action. Deterrent decourage. Directive indique une conduite attendue mais ne detecte pas.", false),
  q("q22", "1", "1.2", "A company requires users to provide a password and a hardware token before VPN access. Which concept is BEST demonstrated?", ["Federation", "MFA", "SSO", "Accounting"], 1, "MFA combine plusieurs facteurs pour renforcer l'authentification. Federation partage l'identite entre organisations. SSO reduit les connexions multiples. Accounting journalise les actions.", true),
  q("q23", "1", "1.3", "Which principle is MOST closely associated with separating administrator duties so no single person can approve and deploy a risky change?", ["Job rotation", "Separation of duties", "Implicit deny", "Data masking"], 1, "La separation des taches evite qu'une seule personne controle tout le processus. Job rotation change les roles avec le temps. Implicit deny concerne l'acces reseau. Data masking cache les donnees.", false),
  q("q24", "1", "1.4", "Which data state describes information being sent from a client browser to a web server?", ["Data at rest", "Data in transit", "Data in use", "Archived data"], 1, "Les donnees envoyees sur le reseau sont en transit. At rest signifie stockees. In use signifie traitees en memoire. Archived data est un etat de conservation.", false),
  q("q25", "1", "1.5", "A security analyst must prove a file was not changed after download. Which value is MOST useful?", ["Hash digest", "Subnet mask", "NAT table", "VLAN ID"], 0, "Un hash permet de verifier l'integrite du fichier. Le masque de sous-reseau, la table NAT et le VLAN concernent le reseau, pas l'integrite du fichier.", true),
  q("q26", "2", "2.1", "A company receives invoices from a vendor, but the payment account was secretly changed by email. Which attack is MOST likely?", ["Business email compromise", "Smishing", "Bluejacking", "Cryptojacking"], 0, "Le BEC manipule des processus metier comme les paiements. Smishing utilise SMS. Bluejacking vise Bluetooth. Cryptojacking utilise des ressources pour miner.", true),
  q("q27", "2", "2.2", "A security analyst sees many login attempts using known leaked passwords. Which attack is BEST described?", ["Credential stuffing", "SQL injection", "DNS tunneling", "RFID cloning"], 0, "Credential stuffing reutilise des identifiants voles. SQL injection cible une base de donnees. DNS tunneling cache du trafic dans DNS. RFID cloning copie un badge.", true),
  q("q28", "2", "2.3", "Which indicator is MOST associated with ransomware?", ["Encrypted user files and a payment demand", "A normal patch cycle", "A successful backup test", "A valid certificate renewal"], 0, "Le ransomware chiffre les fichiers et demande une rancon. Les autres choix sont des operations normales ou positives.", false),
  q("q29", "2", "2.4", "A company discovers a web page executes JavaScript supplied by a user comment. Which vulnerability is MOST likely?", ["Cross-site scripting", "LDAP signing", "ARP inspection", "Disk encryption"], 0, "XSS injecte du script dans une page vue par d'autres utilisateurs. LDAP signing securise LDAP. ARP inspection controle le reseau local. Le chiffrement disque protege le stockage.", true),
  q("q30", "2", "2.5", "Which mitigation is BEST for reducing the impact of a successful phishing password theft?", ["MFA", "Open shares", "Plaintext passwords", "Unrestricted local admin"], 0, "MFA ajoute une barriere apres le vol du mot de passe. Les partages ouverts, mots de passe en clair et administrateurs locaux augmentent le risque.", false),
  q("q31", "2", "2.6", "A security analyst finds outbound DNS requests carrying large encoded strings. Which activity is MOST suspicious?", ["DNS tunneling", "Normal DHCP renewal", "NTP synchronization", "Certificate pinning"], 0, "DNS tunneling peut exfiltrer ou encapsuler des donnees dans des requetes DNS. DHCP et NTP sont des services normaux. Certificate pinning valide les certificats.", true),
  q("q32", "2", "2.7", "Which source is MOST useful for identifying newly exploited vulnerabilities in actively targeted software?", ["Threat intelligence feed", "Printer toner report", "Employee phone list", "Cable map"], 0, "Un flux de threat intelligence signale menaces et vulnerabilites exploitees. Les autres sources ne donnent pas ce contexte d'attaque.", false),
  q("q33", "3", "3.1", "A company wants remote users to access cloud apps through policy-based security controls close to the user. Which architecture is BEST?", ["SASE", "RAID", "SCADA", "NTP"], 0, "SASE combine connectivite et controles de securite cloud. RAID gere les disques. SCADA controle l'industriel. NTP synchronise le temps.", true),
  q("q34", "3", "3.2", "Which wireless security protocol is MOST appropriate for modern enterprise Wi-Fi?", ["WEP", "WPA3-Enterprise", "Open authentication", "Telnet"], 1, "WPA3-Enterprise est le choix moderne et robuste. WEP est obsolete. Open authentication ne chiffre pas. Telnet n'est pas un protocole Wi-Fi.", false),
  q("q35", "3", "3.3", "A company needs to prevent sensitive files from being emailed outside the organization. Which solution is BEST?", ["DLP", "NAT", "DHCP", "NTP"], 0, "DLP detecte et bloque la fuite de donnees. NAT traduit les adresses. DHCP attribue des IP. NTP synchronise l'heure.", true),
  q("q36", "3", "3.4", "Which design BEST improves resilience against a single data center outage?", ["Geographic redundancy", "One local backup only", "Flat switching", "Shared passwords"], 0, "La redondance geographique maintient le service si un site tombe. Une sauvegarde locale ne suffit pas. Le reseau plat et les mots de passe partages n'ameliorent pas la resilience.", false),
  q("q37", "3", "3.5", "A company needs to isolate payment systems from guest Wi-Fi. Which option is MOST appropriate?", ["VLAN segmentation", "Disable logging", "Use one shared SSID only", "Permit any-to-any routing"], 0, "La segmentation VLAN separe les zones. Desactiver les logs reduit la visibilite. Un SSID partage et any-to-any augmentent l'exposition.", true, { optionExplanations: ["VLAN segmentation crée des réseaux logiques distincts, isolant efficacement les systèmes de paiement du Wi-Fi invité sur la même infrastructure.","Désactiver les logs réduit la visibilité et la capacité de détection d'incidents, n'apportant aucune isolation réseau.","Un SSID partagé mélange les trafics des systèmes de paiement et du Wi-Fi invité, augmentant les risques d'accès non autorisé.","Le routage any-to-any permet une communication illimitée entre tous les segments, annulant toute tentative d'isolation."] }),
  q("q38", "3", "3.6", "Which cryptographic method uses the same key to encrypt and decrypt data?", ["Symmetric encryption", "Asymmetric encryption", "Hashing", "Tokenization"], 0, "Le chiffrement symetrique utilise la meme cle. L'asymetrique utilise une paire de cles. Le hachage est non reversible. La tokenisation remplace une donnee sensible.", false, { optionExplanations: ["Chiffrement symétrique utilise une clé unique pour chiffrer et déchiffrer les données, correspondant exactement à la description du scénario.","Chiffrement asymétrique utilise une paire de clés distinctes (publique et privée), pas une seule clé pour les deux opérations.","Hachage génère une empreinte unique et irréversible des données, sans capacité de déchiffrement ou de réversibilité.","Tokenisation remplace les données sensibles par un jeton non significatif, ce n'est pas une méthode de chiffrement/déchiffrement."] }),
  q("q39", "4", "4.1", "A security analyst has isolated an infected host. What should be done NEXT in the incident response process?", ["Eradication", "Preparation", "Asset disposal", "Ignore the event"], 0, "Apres le confinement, l'eradication supprime la cause. La preparation vient avant l'incident. Asset disposal n'est pas l'etape suivante. Ignorer l'evenement est incorrect.", true, { optionExplanations: ["Éradication supprime le malware et sa cause racine après l'isolement, préparant la récupération du système affecté.","Préparation est une phase pré-incident, établissant politiques et outils, non l'étape suivant l'isolement d'un hôte infecté.","Mise au rebut d'actifs concerne la fin de vie du matériel, pas l'étape immédiate après l'isolement d'un hôte infecté.","Ignorer l'événement est contraire aux principes de réponse aux incidents et laisserait la menace persister et se propager."] }),
  q("q40", "4", "4.2", "Which log source is MOST useful for investigating successful and failed authentication attempts?", ["Identity provider logs", "Weather report", "Printer page count", "Marketing calendar"], 0, "Les journaux d'identite montrent les authentifications. Les autres sources ne documentent pas les connexions.", false, { optionExplanations: ["Journaux du fournisseur d'identité : Ils enregistrent précisément chaque tentative d'authentification, réussie ou échouée, essentielle pour l'audit de sécurité.","Rapport météo : Cette source fournit des données climatiques, sans aucun lien technique avec les événements d'authentification ou la sécurité des systèmes.","Compteur de pages d'imprimante : Il suit l'utilisation des imprimantes, mais ne contient aucune information pertinente sur les tentatives de connexion ou les identités.","Calendrier marketing : Il planifie les activités promotionnelles et n'enregistre aucune donnée technique relative aux authentifications ou à la sécurité informatique."] }),
  q("q41", "4", "4.3", "A company must restore a server after a destructive malware event. Which action is BEST before reconnecting it to production?", ["Validate from a known-good backup and scan", "Disable EDR permanently", "Reuse the compromised image", "Skip patching"], 0, "Restaurer depuis une sauvegarde saine puis scanner reduit la reinfection. Desactiver EDR, reutiliser l'image compromise ou ignorer les correctifs maintient le risque.", true),
  q("q42", "4", "4.4", "Which activity MOST directly supports change management?", ["Documented approval and rollback plan", "Unlogged emergency edits", "Shared root account", "Disabling version control"], 0, "L'approbation documentee et le plan de retour arriere reduisent le risque du changement. Les autres choix diminuent controle et tracabilite.", false),
  q("q43", "4", "4.5", "A security analyst needs packet-level evidence of suspicious network traffic. Which tool is BEST?", ["Protocol analyzer", "Password vault", "GRC platform", "Data classification label"], 0, "Un analyseur de protocole capture et inspecte les paquets. Le coffre de mots de passe, GRC et labels de classification ne donnent pas les paquets.", true),
  q("q44", "4", "4.6", "Which protocol is commonly used for centralized authentication, authorization, and accounting for network access?", ["RADIUS", "HTTP", "FTP", "IMAP"], 0, "RADIUS fournit AAA pour l'acces reseau. HTTP sert le web. FTP transfere des fichiers. IMAP lit les courriels.", false),
  q("q45", "4", "4.8", "Which protocol and port are MOST commonly used for secure web browsing?", ["HTTPS over TCP 443", "Telnet over TCP 23", "SMTP over TCP 25", "LDAP over TCP 389"], 0, "HTTPS sur TCP 443 est le web chiffre. Telnet est non chiffre. SMTP transporte le courriel. LDAP 389 n'est pas le web securise.", false),
  q("q46", "5", "5.1", "A company is calculating the financial impact of downtime for a critical service. Which process is MOST relevant?", ["Business impact analysis", "Port scanning", "Packet filtering", "Password spraying"], 0, "Le BIA estime l'impact metier d'une interruption. Le scan de ports et filtrage sont techniques. Password spraying est une attaque.", true),
  q("q47", "5", "5.2", "Which role is MOST likely responsible for deciding how data should be classified and protected?", ["Data owner", "Help desk analyst", "Guest user", "External attacker"], 0, "Le proprietaire de donnees decide classification et exigences de protection. Le help desk aide les utilisateurs. L'invite et l'attaquant ne definissent pas la gouvernance.", false),
  q("q48", "5", "5.3", "A company must keep security logs for one year due to regulation. Which requirement is being addressed?", ["Retention", "Latency", "Jitter", "MTU"], 0, "La retention definit combien de temps conserver les donnees. Latency, jitter et MTU sont des mesures reseau.", true),
  q("q49", "5", "5.4", "Which document is MOST likely to define recovery time objectives and recovery point objectives?", ["Business continuity plan", "Acceptable use policy", "NDA", "Certificate policy"], 0, "Le plan de continuite definit RTO/RPO et strategies de reprise. AUP gere l'utilisation. NDA protege la confidentialite contractuelle. Certificate policy concerne les certificats.", false),
  q("q50", "5", "5.5", "A company wants vendors to meet minimum security requirements before connecting to internal systems. Which approach is BEST?", ["Third-party risk management", "Disable vendor reviews", "Use shared VPN passwords", "Remove contracts"], 0, "La gestion du risque tiers evalue et impose des exigences aux fournisseurs. Les autres choix augmentent le risque ou retirent les controles.", true),
  q("q51", "1", "1.1", "Which part of the CIA triad is MOST directly affected when unauthorized users view sensitive records?", ["Confidentiality", "Integrity", "Availability", "Accounting"], 0, "La confidentialite est touchee quand des personnes non autorisees consultent des donnees. L'integrite concerne la modification non autorisee. La disponibilite concerne l'acces au service. Accounting trace les actions.", false),
  q("q52", "1", "1.1", "Which part of the CIA triad is MOST directly affected when a database record is changed without approval?", ["Availability", "Confidentiality", "Integrity", "Authentication"], 2, "L'integrite garantit que les donnees ne sont pas modifiees sans autorisation. La confidentialite protege contre la divulgation. La disponibilite garantit l'acces. L'authentification prouve l'identite.", false),
  q("q53", "1", "1.2", "A company wants proof that a user performed a transaction. Which AAA function BEST supports this requirement?", ["Authentication", "Authorization", "Accounting", "Federation"], 2, "Accounting journalise l'utilisation et soutient la non-repudiation. Authentication prouve l'identite. Authorization donne les permissions. Federation partage l'identite entre domaines.", true),
  q("q54", "1", "1.2", "Which authentication factor is represented by a fingerprint scan?", ["Something you know", "Something you have", "Something you are", "Somewhere you are"], 2, "Une empreinte digitale est un facteur biologique: quelque chose que l'utilisateur est. Un mot de passe est connu, un token est possede, et la localisation indique ou l'utilisateur se trouve.", false),
  q("q55", "2", "2.1", "Which malware type requires user action to execute and spread by infecting files?", ["Virus", "Worm", "Rootkit", "Logic bomb"], 0, "Un virus a besoin d'une action utilisateur et infecte des fichiers. Un ver se replique sans action. Un rootkit cache un controle privilegie. Une logic bomb s'execute selon une condition.", false),
  q("q56", "2", "2.1", "Which malware type is BEST described as self-replicating without user interaction?", ["Trojan", "Worm", "Adware", "Spyware"], 1, "Un ver se propage sans interaction utilisateur. Un cheval de Troie se deguise en logiciel legitime. Adware affiche des publicites. Spyware collecte des informations.", false),
  q("q57", "2", "2.1", "A security analyst finds malware that provides remote control of a victim workstation. Which type is MOST likely?", ["RAT", "Macro virus", "Spam", "PUP"], 0, "Un RAT donne un acces distant a l'attaquant. Un macro virus est lie aux documents. Le spam est abus de messagerie. Un PUP est potentiellement indesirable mais pas forcement du controle distant.", true),
  q("q58", "2", "2.1", "A company discovers user files are encrypted and a payment note is displayed. Which malware is MOST likely?", ["Ransomware", "Rootkit", "Worm", "Hoax"], 0, "Le ransomware chiffre les donnees et exige une rancon. Un rootkit cache un controle privilegie. Un ver se propage. Un hoax trompe sans necessairement chiffrer les fichiers.", true),
  q("q59", "2", "2.2", "A company suspects a rootkit on a workstation. Which response is MOST appropriate?", ["Reimage the system", "Only clear browser cache", "Disable logging", "Create a guest account"], 0, "Un rootkit est difficile a supprimer de facon fiable; reimager est souvent la meilleure option. Vider le cache ne suffit pas. Desactiver les logs et creer un compte invite aggravent le risque.", true),
  q("q60", "2", "2.2", "Which symptom is MOST suspicious for malware infection?", ["New double-extension files such as invoice.pdf.exe", "A successful backup", "A scheduled patch reboot", "A normal DHCP lease"], 0, "Une double extension peut cacher un executable malveillant. Une sauvegarde reussie, un reboot de patch et un bail DHCP sont des evenements normaux.", false),
  q("q61", "2", "2.3", "A company finds many compromised hosts controlled by one attacker. Which term BEST describes this group?", ["Botnet", "Honeynet", "VLAN", "DMZ"], 0, "Un botnet est un ensemble de machines compromises controlees par un acteur. Une honeynet piege les attaquants. VLAN segmente le reseau. DMZ expose des services publics controles.", true),
  q("q62", "2", "2.4", "Which vulnerability is BEST mitigated by input validation and output encoding?", ["Cross-site scripting", "RAID failure", "Brownout", "Port mirroring"], 0, "XSS est reduit par validation des entrees et encodage des sorties. RAID, brownout et port mirroring ne sont pas des vulnerabilites applicatives de ce type.", false),
  q("q63", "2", "2.4", "If a login field accepts `' OR 1=1;` and bypasses authentication, which attack is MOST likely?", ["SQL injection", "DNS poisoning", "Bluejacking", "ARP inspection"], 0, "Cette chaine est typique d'une injection SQL. DNS poisoning modifie la resolution. Bluejacking envoie des messages Bluetooth. ARP inspection est une defense reseau.", false),
  q("q64", "3", "3.1", "Which network zone is MOST appropriate for public-facing web servers that must be separated from the internal LAN?", ["DMZ", "Intranet", "Management VLAN only", "Loopback network"], 0, "Une DMZ heberge des services publics avec controle entre Internet et LAN interne. L'intranet est interne. Le VLAN de management n'est pas destine aux serveurs publics. Loopback reste local.", false),
  q("q65", "3", "3.1", "Which control BEST reduces the impact of VLAN hopping attacks such as double tagging?", ["Move access ports out of the default VLAN", "Enable Telnet", "Use one flat network", "Disable switch logging"], 0, "Retirer les ports du VLAN par defaut aide a reduire le double tagging. Telnet, reseau plat et logs desactives augmentent le risque.", false),
  q("q66", "3", "3.1", "A company wants to inspect web traffic for SQL injection and XSS attempts. Which device is MOST appropriate?", ["WAF", "UPS", "NTP server", "PBX"], 0, "Un WAF protege les applications web contre des attaques comme XSS et SQL injection. UPS fournit de l'alimentation. NTP synchronise l'heure. PBX gere la telephonie.", true),
  q("q67", "3", "3.2", "Which cloud model provides a full application to the customer while the provider manages the platform and infrastructure?", ["SaaS", "IaaS", "PaaS", "On-premises"], 0, "SaaS livre l'application complete. IaaS fournit surtout infrastructure. PaaS fournit plateforme pour developper/deployer. On-premises est gere localement.", false),
  q("q68", "3", "3.2", "A company requires maximum control over operating systems in the cloud. Which service model is MOST appropriate?", ["IaaS", "SaaS", "SECaaS", "DaaS"], 0, "IaaS donne plus de controle sur les systemes et serveurs. SaaS limite fortement le controle. SECaaS fournit des services securite. DaaS fournit des bureaux virtuels.", true),
  q("q69", "3", "3.4", "Which site type is MOST ready to resume operations within minutes?", ["Hot site", "Warm site", "Cold site", "Archive site"], 0, "Un hot site est presque pret a fonctionner. Un warm site necessite configuration. Un cold site a surtout l'espace et peu d'equipement. Archive site n'est pas le terme DR principal.", false),
  q("q70", "3", "3.4", "Which RAID level combines striping and mirroring?", ["RAID 10", "RAID 0", "RAID 1", "RAID 5"], 0, "RAID 10 combine RAID 1 et RAID 0: mirroring plus striping. RAID 0 stripe sans redondance. RAID 1 miroir. RAID 5 utilise parite distribuee.", false),
  q("q71", "4", "4.1", "During malware removal, which action should occur FIRST after identifying infection symptoms?", ["Quarantine the infected system", "Enable file sharing", "Delete all logs", "Reconnect to production"], 0, "Le confinement/quarantaine limite la propagation. Partager des fichiers, supprimer les logs ou reconnecter a la production augmentent le risque.", false),
  q("q72", "4", "4.2", "Which IDS detection method alerts when traffic differs significantly from an established baseline?", ["Anomaly-based", "Signature-based", "Manual approval", "Mandatory access control"], 0, "La detection par anomalie compare au comportement normal. Signature-based cherche des motifs connus. Les autres choix ne sont pas des methodes IDS.", false),
  q("q73", "4", "4.2", "An IDS fails to alert on actual malicious traffic. Which alert type occurred?", ["False negative", "False positive", "True positive", "True negative"], 0, "Un faux negatif signifie qu'une activite malveillante est vue comme legitime. Faux positif signale du legitime comme malveillant. True positive et true negative sont corrects.", false),
  q("q74", "4", "4.2", "Which technology aggregates and correlates logs from many enterprise systems?", ["SIEM", "NAT", "RAID", "WEP"], 0, "Un SIEM agrege et correle les evenements. NAT traduit les adresses. RAID gere le stockage. WEP est un ancien protocole Wi-Fi.", false),
  q("q75", "4", "4.8", "Which protocol commonly uses UDP port 514 for centralized logging?", ["Syslog", "LDAP", "RDP", "Kerberos"], 0, "Syslog utilise couramment UDP 514. LDAP utilise 389/636. RDP utilise 3389. Kerberos utilise 88.", false),
  q("q76", "4", "4.8", "Which protocol uses TCP port 49 and provides centralized AAA for network devices?", ["TACACS+", "RADIUS", "LDAP", "SNMP"], 0, "TACACS+ utilise TCP 49. RADIUS utilise surtout UDP 1812/1813. LDAP est annuaire. SNMP supervise les equipements.", false),
  q("q77", "5", "5.1", "Which calculation is represented by SLE x ARO?", ["ALE", "RTO", "RPO", "MTBF"], 0, "ALE = SLE x ARO. RTO est le temps de reprise. RPO est le point de reprise. MTBF mesure le temps moyen entre pannes.", false),
  q("q78", "5", "5.1", "A company chooses to buy insurance for a known risk. Which risk response is BEST described?", ["Transfer", "Avoid", "Accept", "Exploit"], 0, "L'assurance transfere une partie du risque a un tiers. Avoid arrete l'activite. Accept conserve le risque. Exploit n'est pas la reponse de risque classique ici.", true),
  q("q79", "5", "5.4", "Which document gives broad direction and desired security outcomes for an organization?", ["Policy", "Procedure", "Packet capture", "Exploit code"], 0, "Une politique est large et definit l'intention. Une procedure est detaillee et etape par etape. Les autres choix ne sont pas des documents de gouvernance.", false),
  q("q80", "5", "5.4", "Which document provides detailed step-by-step instructions for performing a task?", ["Procedure", "Policy", "Guideline", "Risk appetite statement"], 0, "Une procedure decrit les etapes precises. Une policy est generale. Une guideline recommande. Le risk appetite definit le niveau de risque acceptable.", false),
  q("q81", "3", "3.9", "Which cryptographic concept uses the same secret key for encryption and decryption?", ["Symmetric encryption", "Asymmetric encryption", "Hashing", "Steganography"], 0, "Le chiffrement symetrique utilise la meme cle. L'asymetrique utilise une paire public/prive. Le hachage est a sens unique. La steganographie cache l'existence du message.", false),
  q("q82", "3", "3.9", "Which algorithm is a common asymmetric algorithm based on factoring large prime numbers?", ["RSA", "AES", "RC4", "MD5"], 0, "RSA est asymetrique et repose sur la factorisation. AES est symetrique. RC4 est un stream cipher. MD5 est un hash faible.", false),
  q("q83", "3", "3.9", "Which PKI component verifies identity before a certificate authority issues a certificate?", ["Registration Authority", "Rootkit", "Load balancer", "Syslog server"], 0, "La Registration Authority valide l'identite avant emission par la CA. Les autres choix ne font pas cette validation PKI.", false),
  q("q84", "3", "3.9", "Which protocol checks certificate revocation status using a certificate serial number?", ["OCSP", "SNMP", "PPTP", "CHAP"], 0, "OCSP verifie le statut de revocation d'un certificat. SNMP supervise. PPTP est VPN ancien. CHAP est authentification challenge-response.", false),
  q("q85", "1", "1.2", "Which access control model lets the data owner determine permissions?", ["DAC", "MAC", "ABAC", "Rule-based firewall"], 0, "DAC laisse le proprietaire definir les droits. MAC est determine par le systeme avec labels. ABAC utilise attributs et contexte. Le firewall rule-based filtre le trafic.", false)
];

const guideTopics = [
  guideTopic("01", "Fundamental security concepts", "1", "1.1", [
    c("CIA triad", "Confidentiality, integrity, and availability describe the outcomes defenders protect.", "classify a breach as disclosure, tampering, or outage", "Confidentiality"),
    c("DAD triad", "Disclosure, alteration, and denial describe the outcomes attackers try to cause.", "connect ransomware to denial and data leaks to disclosure", "Denial"),
    c("Non-repudiation", "Non-repudiation prevents a subject from credibly denying an action.", "prove a transaction with a digital signature and audit trail", "Digital signature"),
    c("NIST CSF functions", "Identify, Protect, Detect, Respond, and Recover organize cybersecurity work.", "place containment under Respond and restoration under Recover", "Respond"),
    c("Gap analysis", "Gap analysis compares current controls against a framework or requirement.", "find missing controls before a compliance audit", "Gap analysis"),
    c("Control objectives", "Control objectives state the desired outcome of one or more controls.", "define what a control must accomplish before choosing technology", "Control objective"),
    c("Defense in depth", "Defense in depth layers independent controls to reduce cascading failure.", "combine MFA, segmentation, logging, and backups", "Layered controls"),
    c("Security baselines", "Baselines define minimum secure configuration requirements.", "start with a standard build before tailoring exceptions", "Minimum standard"),
    c("Control categories", "Technical, operational, and managerial controls describe how controls are implemented.", "classify firewalls as technical and training as operational", "Technical"),
    c("Control functions", "Preventive, detective, corrective, deterrent, and compensating controls describe what controls do.", "match backups to corrective controls", "Corrective"),
    c("Security roles", "Security roles assign responsibility for risk, monitoring, response, and governance.", "separate SOC monitoring from executive risk ownership", "SOC"),
    c("DevSecOps", "DevSecOps shifts security into every phase of software delivery.", "embed security review and testing in CI/CD", "Shift left")
  ]),
  guideTopic("02", "Threat actors and vectors", "2", "2.1", [
    c("Vulnerability, threat, and risk", "A vulnerability is a weakness, a threat is a potential cause, and risk combines likelihood and impact.", "distinguish an unpatched server from a motivated attacker", "Risk"),
    c("Threat actor attributes", "Location, intent, motivation, capability, and funding shape threat assessment.", "compare an insider to a nation-state actor", "Capability"),
    c("Script kiddie", "A script kiddie uses existing tools without deep exploit knowledge.", "recognize opportunistic scanning with public tools", "Script kiddie"),
    c("APT", "An advanced persistent threat maintains long-term access using sophisticated techniques.", "connect stealthy persistence to state-backed campaigns", "APT"),
    c("Insider threat", "Insiders already have some authorized access and may act maliciously or accidentally.", "monitor privilege misuse by employees or contractors", "Insider"),
    c("Attack surface", "Attack surface is the total set of points a threat actor can target.", "reduce exposed ports, services, and endpoints", "Attack surface"),
    c("Attack vector", "An attack vector is the path or method used to exploit a target.", "email attachment, USB drop, cloud account, or wireless access", "Email"),
    c("Unsupported systems", "Unsupported systems lack vendor patches and often require isolation as compensation.", "segment a legacy application that cannot be replaced", "Isolation"),
    c("Message-based vectors", "Email, SMS, instant messaging, and social media can deliver malicious links or files.", "identify smishing versus phishing", "Smishing"),
    c("Third-party risk", "Vendors can introduce access, hosting, compliance, and supply-chain risk.", "audit vendor data access and storage locations", "Vendor review"),
    c("Social engineering", "Social engineering manipulates emotions and trust to obtain access or information.", "spot urgency, fear, curiosity, or authority pressure", "Pretexting"),
    c("Typosquatting", "Typosquatting uses look-alike or misspelled domains to capture victims.", "detect facbook-style domain abuse", "Look-alike domain")
  ]),
  guideTopic("03", "Cryptographic solutions", "1", "1.4", [
    c("Plaintext and ciphertext", "Plaintext is readable data and ciphertext is encrypted output.", "identify what must be protected after encryption", "Ciphertext"),
    c("Hashing", "Hashing produces a fixed-length digest and supports integrity checks.", "compare downloaded file hashes", "Digest"),
    c("Hash collision", "A collision occurs when two different inputs produce the same hash.", "understand why weak hash algorithms are risky", "Collision"),
    c("Symmetric encryption", "Symmetric encryption uses the same secret key for encryption and decryption.", "choose AES for bulk data encryption", "AES"),
    c("Asymmetric encryption", "Asymmetric encryption uses related public and private keys.", "exchange keys or verify identity with public key cryptography", "Public key"),
    c("Digital signature", "A digital signature combines hashing and public key cryptography for integrity and authentication.", "sign code or email with a private key", "Private key"),
    c("Cipher suite", "A cipher suite combines algorithms for authentication, key exchange, encryption, and integrity.", "interpret TLS_AES_256_GCM_SHA384", "TLS"),
    c("Salting", "Salting adds a unique value to password hashing to defeat precomputed tables.", "store salted password hashes", "Salt"),
    c("Key stretching", "Key stretching repeats derivation work to slow password guessing.", "use PBKDF2, bcrypt, or similar functions", "PBKDF2"),
    c("PKI", "PKI uses certificate authorities and certificates to bind identities to public keys.", "validate a web server certificate chain", "CA"),
    c("Certificate lifecycle", "Certificates are requested, validated, issued, installed, renewed, revoked, or suspended.", "rekey rather than reuse a compromised key", "Revocation"),
    c("Key escrow", "Key escrow stores recovery keys with a trusted third party or process.", "recover encrypted data after key loss", "Escrow")
  ]),
  guideTopic("04", "Identity and access management", "1", "1.2", [
    c("IAM phases", "IAM includes identification, authentication, authorization, and auditing.", "track the difference between login and permission use", "Audit"),
    c("Authentication factors", "Knowledge, possession, and inherence factors support MFA.", "combine password, token, and fingerprint", "MFA"),
    c("Authentication attributes", "Location, behavior, and trust relationships can support contextual authentication.", "deny impossible travel login attempts", "Somewhere you are"),
    c("Biometric error rates", "FAR, FRR, and CER measure biometric reliability.", "choose a lower CER for stronger biometric systems", "CER"),
    c("Password policy", "Modern guidance favors long passwords, blocklists, and fewer forced changes.", "block common passwords instead of complex rotation rules", "Password blocklist"),
    c("Password manager risk", "Password managers reduce reuse but depend on a strong master password and trusted storage.", "evaluate spoofed login filling risk", "Master password"),
    c("DAC", "Discretionary access control lets resource owners grant permissions.", "identify owner-controlled file permissions", "DAC"),
    c("RBAC", "Role-based access control assigns permissions through job roles or groups.", "grant access by security group membership", "RBAC"),
    c("MAC", "Mandatory access control uses labels and clearances enforced by the system.", "compare secret and top-secret access", "MAC"),
    c("ABAC", "Attribute-based access control evaluates subject, object, action, and environment attributes.", "allow access only from managed devices during work hours", "ABAC"),
    c("PAM", "Privileged access management protects high-impact administrative accounts.", "use vaulting, JIT elevation, and secure admin workstations", "PAM"),
    c("Kerberos", "Kerberos provides SSO using a KDC, tickets, principals, and application servers.", "authenticate to Active Directory resources", "KDC")
  ]),
  guideTopic("05", "Enterprise network architecture", "3", "3.1", [
    c("Switches", "Switches forward frames using MAC addresses at OSI layer 2.", "segment hosts with VLANs", "Layer 2"),
    c("Routers", "Routers forward packets using IP addresses at OSI layer 3.", "connect subnets and route between zones", "Layer 3"),
    c("Firewalls", "Firewalls filter traffic with rules and can operate from layer 3 through layer 7.", "enforce ingress and egress policy", "ACL"),
    c("DMZ", "A DMZ isolates public-facing systems from the internal LAN.", "place Internet-facing web servers outside trusted LAN", "Screened subnet"),
    c("East-west traffic", "East-west traffic flows between systems inside a data center or cloud.", "monitor lateral movement between servers", "Lateral movement"),
    c("Microsegmentation", "Microsegmentation applies granular policies to individual workloads or nodes.", "treat a single server as its own zone", "Zero trust"),
    c("SPAN and TAP", "SPAN mirrors traffic logically while a TAP physically copies network signals.", "choose a TAP for reliable packet capture", "TAP"),
    c("Fail-open and fail-closed", "Fail-open preserves availability while fail-closed blocks access during failure.", "choose based on security versus availability priority", "Fail-closed"),
    c("ARP poisoning", "ARP poisoning tricks hosts into associating an IP address with the attacker's MAC.", "detect on-path attacks on local networks", "ARP"),
    c("MAC flooding", "MAC flooding exhausts switch tables and can force traffic flooding.", "mitigate with port security", "Port security"),
    c("DHCP snooping", "DHCP snooping allows DHCP messages only from trusted ports.", "block rogue DHCP servers", "Trusted port"),
    c("Secure protocols", "Secure protocol choices replace plaintext management, file, directory, and web traffic.", "use SSH, HTTPS, LDAPS, SFTP, and TLS", "SSH")
  ]),
  guideTopic("06", "Cloud and zero trust architecture", "3", "3.2", [
    c("Public cloud", "Public cloud is multi-tenant service delivered over the Internet.", "evaluate CSP controls and shared responsibility", "Public cloud"),
    c("Private cloud", "Private cloud is dedicated to one organization and offers more control.", "choose for strict privacy or regulatory needs", "Private cloud"),
    c("IaaS", "IaaS provides infrastructure while the customer manages operating systems and workloads.", "secure VM operating systems in cloud", "IaaS"),
    c("PaaS", "PaaS provides managed platforms for applications and databases.", "deploy code without managing the full OS stack", "PaaS"),
    c("SaaS", "SaaS provides a complete application managed mostly by the provider.", "configure identity and data controls in Microsoft 365", "SaaS"),
    c("Shared responsibility", "Shared responsibility defines which security tasks belong to the CSP and customer.", "map data, identity, network, host, and physical controls", "Responsibility matrix"),
    c("VPC", "A VPC isolates cloud networking resources inside a customer account.", "separate public and private subnets", "VPC"),
    c("CASB", "A CASB gives visibility and policy control over cloud service use.", "detect risky SaaS sharing and shadow IT", "CASB"),
    c("Infrastructure as code", "IaC uses tested code to provision consistent infrastructure.", "prevent snowflake systems and support idempotence", "IaC"),
    c("Serverless", "Serverless shifts server management to the provider and bills by execution.", "run event-driven functions without managing hosts", "FaaS"),
    c("Zero trust components", "Zero trust uses PDP, policy engine, policy administrator, and PEP.", "decide, issue, enforce, monitor, and terminate access", "PEP"),
    c("Edge and fog computing", "Edge and fog computing process data near sensors and devices to reduce latency.", "preprocess IoT telemetry locally", "Fog node")
  ]),
  guideTopic("07", "Resiliency and site security", "3", "3.4", [
    c("Backup types", "Full, incremental, differential, snapshots, and images support recovery goals.", "choose faster backup versus faster restore", "Incremental"),
    c("3-2-1 backups", "The 3-2-1 rule keeps multiple copies across media with an offline/offsite copy.", "protect backups from disaster and ransomware", "Offline copy"),
    c("Restoration order", "Recovery should restore power, network, security, core services, data, apps, and clients.", "bring a site back in dependency order", "Core services"),
    c("Non-persistence", "Non-persistence reverts systems to a known-good state.", "use snapshots, live boot, or rollback", "Known state"),
    c("High availability", "High availability keeps services accessible and is often measured by uptime.", "design for 99.99 percent availability", "HA"),
    c("Scalability and elasticity", "Scalability adds capacity while elasticity adjusts capacity on demand.", "scale out web servers under load", "Elasticity"),
    c("Fault tolerance", "Fault tolerance allows systems to continue after component failure.", "use redundant power, NICs, disks, and paths", "Redundancy"),
    c("RAID", "RAID levels combine disks for performance, redundancy, or both.", "distinguish RAID 1, 5, 6, and 10", "RAID 10"),
    c("Replication", "Synchronous replication writes all replicas together while asynchronous replication lags.", "choose synchronous for low data-loss tolerance", "Synchronous"),
    c("Honeypot", "A honeypot is a decoy system used to detect and study attacks.", "place decoys in a DMZ or isolated segment", "Honeynet"),
    c("Physical controls", "Physical controls restrict and monitor access to facilities and assets.", "combine locks, guards, badges, CCTV, and alarms", "Badge"),
    c("Media sanitization", "Sanitization removes data through overwriting, degaussing, shredding, or crypto erase.", "destroy drives before disposal", "Crypto erase")
  ]),
  guideTopic("08", "Vulnerability management", "2", "2.2", [
    c("Zero-day", "A zero-day vulnerability is exploited before a vendor fix is available.", "prioritize compensating controls during active exploitation", "Zero-day"),
    c("Bug bounty", "Bug bounty programs reward ethical vulnerability reporting.", "distinguish open and closed programs", "Responsible disclosure"),
    c("CVE", "CVE catalogs publicly known vulnerabilities.", "identify a vulnerability by standardized ID", "CVE"),
    c("CVSS", "CVSS communicates vulnerability characteristics and severity.", "prioritize critical and high findings", "CVSS"),
    c("NVD", "NVD enriches vulnerability entries with scoring and analysis.", "look up CVSS metrics for a CVE", "NVD"),
    c("Weak configuration", "Weak configuration includes defaults, open permissions, unnecessary services, and poor errors.", "change default credentials and disable unused services", "Hardening"),
    c("Weak encryption", "Weak encryption can involve poor algorithms, weak keys, or insecure key handling.", "replace deprecated ciphers and protocols", "Cipher strength"),
    c("Overflow", "Overflow vulnerabilities occur when input exceeds expected memory boundaries.", "connect buffer overflow to arbitrary code execution", "Buffer overflow"),
    c("Race condition", "Race conditions depend on timing between operations.", "test time-of-check to time-of-use flaws", "TOCTOU"),
    c("Rooting and jailbreaking", "Rooting and jailbreaking bypass mobile platform security controls.", "block compromised devices from enterprise access", "Jailbreak"),
    c("Threat intelligence", "Threat intelligence sources provide indicators, tactics, vulnerabilities, and context.", "use feeds, advisories, OSINT, STIX, and TAXII", "STIX"),
    c("Remediation", "Remediation prioritizes fixes using severity, exposure, and business risk.", "patch, isolate, mitigate, or accept with approval", "Patch management")
  ]),
  guideTopic("09", "Network security capabilities", "4", "4.6", [
    c("Secure configuration guides", "Benchmarks and hardening guides define secure settings.", "apply CIS, STIG, NCP, and vendor baselines", "CIS Benchmark"),
    c("Hardening", "Hardening reduces attack surface by disabling unnecessary features and applying secure settings.", "remove unused services and enforce secure protocols", "Least functionality"),
    c("WPA2-PSK", "WPA2-PSK uses a passphrase to derive encryption keys.", "secure home or small office Wi-Fi", "PSK"),
    c("WPA3-SAE", "WPA3-SAE improves personal Wi-Fi key exchange resistance.", "replace weak WPS enrollment", "SAE"),
    c("802.1X", "802.1X uses supplicant, authenticator, and AAA server for network access.", "authenticate wireless clients through RADIUS", "EAP"),
    c("PEAP and EAP-FAST", "PEAP uses server certificates while EAP-FAST can use protected access credentials.", "compare enterprise Wi-Fi authentication methods", "PEAP"),
    c("Rogue AP and evil twin", "Rogue APs are unauthorized and evil twins impersonate legitimate networks.", "detect with wireless scanning and physical inspection", "Evil twin"),
    c("Disassociation and jamming", "Disassociation abuses management frames and jamming disrupts radio availability.", "identify wireless DoS conditions", "Jamming"),
    c("NAC", "NAC authenticates and evaluates device compliance before granting access.", "quarantine noncompliant endpoints", "Network access control"),
    c("Dynamic VLAN", "Dynamic VLAN assignment places devices based on identity, type, location, or health.", "move unhealthy devices into remediation VLAN", "VLAN"),
    c("IDS and IPS", "IDS alerts while IPS can actively block or throttle threats.", "compare detection to prevention", "IPS"),
    c("NGFW and UTM", "NGFW and UTM consolidate firewall, application awareness, IPS, malware, VPN, and filtering.", "weigh consolidation against single point of failure", "NGFW")
  ]),
  guideTopic("10", "Endpoint and mobile security", "4", "4.3", [
    c("Endpoint hardening", "Endpoint hardening applies secure configuration and least functionality.", "disable unnecessary services and patch hosts", "Hardening"),
    c("Patch management", "Patch management tests and deploys updates while managing compatibility risk.", "stage updates before production rollout", "Patch"),
    c("EPP", "Endpoint protection platforms combine malware, firewall, encryption, and prevention features.", "deploy a single endpoint security agent", "EPP"),
    c("HIDS and HIPS", "HIDS detects host activity while HIPS can actively prevent suspicious behavior.", "monitor logs, file integrity, ports, and processes", "FIM"),
    c("Sandboxing", "Sandboxing isolates untrusted files or applications for analysis.", "detonate suspicious attachments safely", "Sandbox"),
    c("Segmentation zones", "Endpoint access can be controlled through trusted, untrusted, DMZ, enclave, air-gapped, wireless, and VPN zones.", "place sensitive workloads in enclaves", "Enclave"),
    c("MDM", "Mobile device management enforces device policies, remote wipe, and feature controls.", "disable camera in a restricted geofence", "MDM"),
    c("MAM", "Mobile application management controls apps and corporate data flow.", "prevent copy from work container to personal apps", "MAM"),
    c("BYOD and COPE", "Deployment models balance ownership, privacy, and control.", "compare BYOD risk to corporate-owned devices", "BYOD"),
    c("Geofencing", "Geofencing applies policy based on physical location.", "require reauthentication outside trusted areas", "Geofence"),
    c("Bluetooth attacks", "Bluejacking sends unsolicited messages while bluesnarfing steals data.", "disable discoverable mode on corporate devices", "Bluesnarfing"),
    c("RFID skimming", "RFID skimming reads contactless tags or cards with unauthorized readers.", "protect badges and payment cards from cloning", "Skimming")
  ]),
  guideTopic("11", "Application security", "2", "2.4", [
    c("DNSSEC", "DNSSEC validates DNS responses to reduce spoofing and poisoning.", "protect name resolution integrity", "DNSSEC"),
    c("LDAPS", "LDAPS protects LDAP credential exchange with TLS.", "avoid simple bind credentials in plaintext", "LDAPS"),
    c("NTP and NTS", "NTP synchronizes time and NTS adds authentication security.", "support log correlation with trusted time", "NTS"),
    c("SNMP security", "SNMP monitors devices and older versions rely on weak community strings.", "prefer SNMPv3 for authentication and encryption", "SNMPv3"),
    c("TLS versions", "TLS 1.3 removes insecure legacy features and reduces downgrade risk.", "disable SSL, TLS 1.0, and TLS 1.1", "TLS 1.3"),
    c("Secure file transfer", "SFTP and FTPS protect file transfer differently.", "choose SFTP over SSH or FTPS over TLS", "SFTP"),
    c("Email authentication", "SPF, DKIM, and DMARC reduce sender spoofing.", "reject unauthenticated domain impersonation", "DMARC"),
    c("Email gateway", "Email gateways filter spam, malware, malicious URLs, and phishing.", "scan attachments before mailbox delivery", "Gateway"),
    c("Input validation", "Input validation rejects unexpected or malicious input before processing.", "block SQL, LDAP, XML, and command injection", "Allowlist"),
    c("Output encoding", "Output encoding safely represents data in the target context.", "reduce XSS by encoding HTML output", "Encoding"),
    c("Security headers", "HSTS, CSP, and cache-control reduce browser-side risk.", "prevent SSL stripping and clickjacking", "CSP"),
    c("Static and dynamic analysis", "Static analysis checks source before runtime while dynamic analysis tests running behavior.", "combine code review, DAST, fuzzing, and stress tests", "Fuzzing")
  ]),
  guideTopic("12", "Incident response and monitoring", "4", "4.1", [
    c("IR lifecycle", "Incident response moves through preparation, identification, containment, eradication, recovery, and lessons learned.", "choose containment after confirming an incident", "Containment"),
    c("CIRT roles", "Incident teams coordinate technical, legal, HR, marketing, and executive communication.", "escalate breach notification to legal and privacy teams", "CIRT"),
    c("Playbook", "A playbook is a data-driven SOP for a specific incident scenario.", "guide junior analysts through ransomware triage", "Playbook"),
    c("Incident prioritization", "Data integrity, downtime, scope, economic impact, detection time, and recovery time affect priority.", "prioritize incidents that corrupt critical data", "Integrity"),
    c("MITRE ATT&CK", "ATT&CK maps adversary tactics, techniques, and procedures.", "tag activity as persistence or command and control", "TTP"),
    c("Diamond model", "The Diamond Model relates adversary, capability, infrastructure, and victim.", "analyze intrusion events with meta-features", "Victim"),
    c("IR exercises", "Tabletop, walkthrough, and simulation exercises test readiness at different cost and realism levels.", "run a tabletop before a full simulation", "Tabletop"),
    c("SIEM correlation", "SIEM correlation rules combine events into meaningful alerts.", "alert on repeated login failures followed by success", "Correlation"),
    c("Trend analysis", "Trend analysis detects changes over time using frequency, volume, or statistical deviation.", "notice abnormal log growth or traffic volume", "Baseline"),
    c("Log sources", "Identity, DNS, firewall, endpoint, web, system, and application logs support investigations.", "choose the log source closest to the symptom", "Data source"),
    c("Forensics documentation", "Chain of custody, legal hold, timelines, and reports preserve evidentiary value.", "document every evidence transfer", "Chain of custody"),
    c("Order of volatility", "Evidence should be collected from most volatile to least volatile.", "capture RAM before disk images", "Volatile data")
  ]),
  guideTopic("13", "Indicators of malicious activity", "2", "2.5", [
    c("Malware vector", "Malware can be classified by how it spreads, such as virus, worm, Trojan, or fileless.", "distinguish worm replication from Trojan disguise", "Worm"),
    c("Malware payload", "Payload categories include spyware, rootkit, RAT, ransomware, and logic bomb.", "identify encrypted files and payment demand", "Ransomware"),
    c("Virus", "A virus infects host files or boot sectors and often needs user action.", "spot macro viruses in documents", "Macro virus"),
    c("Worm", "A worm self-replicates across networks without user action.", "connect rapid bandwidth consumption to worm spread", "Worm"),
    c("Fileless malware", "Fileless malware runs in memory and abuses legitimate tools.", "detect suspicious PowerShell living-off-the-land behavior", "PowerShell"),
    c("Rootkit", "A rootkit hides privileged compromise and is difficult to trust after infection.", "reimage rather than simple removal", "Rootkit"),
    c("Password spraying", "Password spraying tries one common password across many accounts.", "detect horizontal brute force attempts", "Password spraying"),
    c("Offline cracking", "Offline cracking attacks stolen password hashes without interacting with the login service.", "use salted stretched hashes to slow attacks", "Hashcat"),
    c("IOC and IOA", "IOCs show compromise residue while IOAs indicate an attack in progress.", "separate suspicious registry change from active beaconing", "IOC"),
    c("Privilege escalation", "Privilege escalation gains access beyond the intended user or process rights.", "compare vertical and horizontal escalation", "Vertical escalation"),
    c("URL analysis", "URL paths, query strings, reserved characters, and percent encoding can carry malicious input.", "decode suspicious parameters before analysis", "Percent encoding"),
    c("Web attacks", "Replay, CSRF, clickjacking, SSL strip, injection, traversal, and SSRF target web sessions and servers.", "use tokens, headers, validation, and HTTPS protections", "CSRF")
  ]),
  guideTopic("14", "Governance concepts", "5", "5.4", [
    c("Regulations", "Regulations and laws impose security and privacy obligations.", "map HIPAA, GLBA, SOX, FISMA, and GDPR requirements", "Compliance"),
    c("Due diligence", "Due diligence shows responsible persons were not negligent.", "document risk assessments and control decisions", "Due care"),
    c("ISO 27001", "ISO 27001 defines an information security management system.", "align security program controls to ISO 27k", "ISMS"),
    c("CSA CCM", "Cloud Security Alliance resources guide cloud security controls.", "use CCM to evaluate a CSP", "CSA"),
    c("SOC reports", "SOC 2 evaluates trust services criteria and SOC 3 summarizes public assurance.", "compare Type 1 design to Type 2 operating effectiveness", "SOC 2 Type 2"),
    c("Governance roles", "Boards, executives, CISOs, committees, owners, custodians, and users hold different responsibilities.", "assign data classification to owners", "CISO"),
    c("Policies", "Policies state high-level mandatory direction approved by leadership.", "define acceptable security outcomes", "Policy"),
    c("Standards and baselines", "Standards are mandatory specifications and baselines aggregate secure settings.", "apply a server baseline to all new hosts", "Baseline"),
    c("Guidelines and procedures", "Guidelines recommend while procedures give step-by-step instructions.", "separate optional advice from mandatory steps", "Procedure"),
    c("AUP and NDA", "AUPs define acceptable behavior and NDAs protect disclosed information.", "require signature before account access", "AUP"),
    c("Change types", "Standard, normal, major, and emergency changes use different approval paths.", "handle critical failover as emergency change", "Emergency change"),
    c("Automation and orchestration", "Automation executes tasks while orchestration coordinates multi-system workflows.", "string multiple automated tasks into an incident response workflow", "Orchestration")
  ]),
  guideTopic("15", "Risk management", "5", "5.1", [
    c("Risk process", "Risk management identifies assets, vulnerabilities, threats, safeguards, and acceptable risk.", "build a risk register from assessed risks", "Risk register"),
    c("Quantitative risk", "Quantitative assessment uses values such as SLE, ARO, and ALE.", "calculate ALE as SLE times ARO", "ALE"),
    c("Qualitative risk", "Qualitative assessment ranks likelihood and impact using categories.", "use high, medium, and low ratings", "Risk matrix"),
    c("Risk mitigation", "Mitigation reduces likelihood or impact using safeguards.", "add MFA to reduce credential compromise risk", "Mitigate"),
    c("Risk avoidance", "Avoidance stops the risky activity entirely.", "retire an unsafe service rather than expose it", "Avoid"),
    c("Risk transfer", "Transfer shifts some risk to another party, such as insurance or outsourcing.", "buy cyber insurance for residual financial loss", "Transfer"),
    c("Risk acceptance", "Acceptance formally keeps risk when treatment costs outweigh benefit.", "document approval for low risk", "Accept"),
    c("Residual risk", "Residual risk remains after controls are applied.", "compare inherent risk before controls to residual risk after controls", "Residual"),
    c("BIA", "Business impact analysis estimates losses and recovery requirements.", "define MEF, MTD, RTO, WRT, and RPO", "BIA"),
    c("SPOF", "A single point of failure can collapse a workflow if unavailable.", "mitigate with redundancy", "SPOF"),
    c("Third-party agreements", "MOU, BPA, NDA, SLA, ISA, and data sharing agreements define supplier duties.", "include right-to-audit and security requirements", "SLA"),
    c("Audit assurance", "Audits provide independent evidence-based assurance and opinions.", "distinguish unqualified, qualified, adverse, and disclaimer opinions", "Unqualified")
  ]),
  guideTopic("16", "Data protection and compliance", "5", "5.2", [
    c("Information lifecycle", "Data must be protected during creation, use, retention, and disposal.", "apply controls at each lifecycle phase", "Lifecycle"),
    c("Data owner", "The data owner has ultimate responsibility for classification and protection requirements.", "choose a steward and custodian", "Owner"),
    c("Data steward", "The steward maintains data quality, labels, and metadata.", "ensure data is correctly classified", "Steward"),
    c("Data custodian", "The custodian manages systems and enforces technical controls.", "apply backups, ACLs, and encryption", "Custodian"),
    c("Controller and processor", "Controllers decide purpose and means; processors act on controller instructions.", "map GDPR-style privacy roles", "Controller"),
    c("Data classification", "Classification labels data by confidentiality and business value.", "separate public, confidential, critical, proprietary, private, and sensitive data", "Confidential"),
    c("PII", "PII identifies, contacts, or locates an individual.", "treat Social Security numbers and some IP addresses as sensitive", "PII"),
    c("Data sovereignty", "Data sovereignty restricts where data may be processed or stored.", "select cloud regions for jurisdiction requirements", "Region"),
    c("Breach notification", "Breach response must notify and escalate according to law and policy.", "meet GDPR-style 72-hour notification obligations when applicable", "Notification"),
    c("Data states", "Data can be at rest, in transit, or in use.", "apply disk encryption, TLS, or memory protections", "In use"),
    c("DLP", "DLP discovers, classifies, monitors, and blocks unauthorized data movement.", "alert, block, quarantine, or tombstone policy violations", "DLP"),
    c("Privacy enhancing technologies", "Masking, tokenization, anonymization, pseudonymization, aggregation, hashing, and salting reduce exposure.", "choose tokenization for payment data", "Tokenization")
  ])
];

const acronymRows = `
AAA|Authentication, Authorization, and Accounting
ACL|Access Control List
AES|Advanced Encryption Standard
AES-256|Advanced Encryption Standards 256-bit
AH|Authentication Header
AI|Artificial Intelligence
AIS|Automated Indicator Sharing
ALE|Annualized Loss Expectancy
AP|Access Point
API|Application Programming Interface
APT|Advanced Persistent Threat
ARO|Annualized Rate of Occurrence
ARP|Address Resolution Protocol
ASLR|Address Space Layout Randomization
ATT&CK|Adversarial Tactics, Techniques, and Common Knowledge
AUP|Acceptable Use Policy
AV|Antivirus
BASH|Bourne Again Shell
BCP|Business Continuity Planning
BGP|Border Gateway Protocol
BIA|Business Impact Analysis
BIOS|Basic Input/Output System
BPA|Business Partners Agreement
BPDU|Bridge Protocol Data Unit
BYOD|Bring Your Own Device
CA|Certificate Authority
CAPTCHA|Completely Automated Public Turing Test to Tell Computers and Humans Apart
CAR|Corrective Action Report
CASB|Cloud Access Security Broker
CBC|Cipher Block Chaining
CCMP|Counter Mode/CBC-MAC Protocol
CCTV|Closed-circuit Television
CERT|Computer Emergency Response Team
CFB|Cipher Feedback
CHAP|Challenge Handshake Authentication Protocol
CIA|Confidentiality, Integrity, Availability
CIO|Chief Information Officer
CIRT|Computer Incident Response Team
CMS|Content Management System
COOP|Continuity of Operation Planning
COPE|Corporate Owned, Personally Enabled
CP|Contingency Planning
CRC|Cyclical Redundancy Check
CRL|Certificate Revocation List
CSO|Chief Security Officer
CSP|Cloud Service Provider
CSR|Certificate Signing Request
CSRF|Cross-site Request Forgery
CSU|Channel Service Unit
CTM|Counter Mode
CTO|Chief Technology Officer
CVE|Common Vulnerability Enumeration
CVSS|Common Vulnerability Scoring System
CYOD|Choose Your Own Device
DAC|Discretionary Access Control
DBA|Database Administrator
DDoS|Distributed Denial of Service
DEP|Data Execution Prevention
DES|Digital Encryption Standard
DHCP|Dynamic Host Configuration Protocol
DHE|Diffie-Hellman Ephemeral
DKIM|DomainKeys Identified Mail
DLL|Dynamic Link Library
DLP|Data Loss Prevention
DMARC|Domain Message Authentication Reporting and Conformance
DNAT|Destination Network Address Translation
DNS|Domain Name System
DoS|Denial of Service
DPO|Data Privacy Officer
DRP|Disaster Recovery Plan
DSA|Digital Signature Algorithm
DSL|Digital Subscriber Line
EAP|Extensible Authentication Protocol
ECB|Electronic Code Book
ECC|Elliptic Curve Cryptography
ECDHE|Elliptic Curve Diffie-Hellman Ephemeral
ECDSA|Elliptic Curve Digital Signature Algorithm
EDR|Endpoint Detection and Response
EFS|Encrypted File System
ERP|Enterprise Resource Planning
ESN|Electronic Serial Number
ESP|Encapsulated Security Payload
FACL|File System Access Control List
FDE|Full Disk Encryption
FIM|File Integrity Management
FPGA|Field Programmable Gate Array
FRR|False Rejection Rate
FTP|File Transfer Protocol
FTPS|Secured File Transfer Protocol
GCM|Galois Counter Mode
GDPR|General Data Protection Regulation
GPG|Gnu Privacy Guard
GPO|Group Policy Object
GPS|Global Positioning System
GPU|Graphics Processing Unit
GRE|Generic Routing Encapsulation
HA|High Availability
HDD|Hard Disk Drive
HIDS|Host-based Intrusion Detection System
HIPS|Host-based Intrusion Prevention System
HMAC|Hashed Message Authentication Code
HOTP|HMAC-based One-time Password
HSM|Hardware Security Module
HTML|Hypertext Markup Language
HTTP|Hypertext Transfer Protocol
HTTPS|Hypertext Transfer Protocol Secure
HVAC|Heating, Ventilation Air Conditioning
IaaS|Infrastructure as a Service
IaC|Infrastructure as Code
IAM|Identity and Access Management
ICMP|Internet Control Message Protocol
ICS|Industrial Control Systems
IDEA|International Data Encryption Algorithm
IDF|Intermediate Distribution Frame
IdP|Identity Provider
IDS|Intrusion Detection System
IEEE|Institute of Electrical and Electronics Engineers
IKE|Internet Key Exchange
IM|Instant Messaging
IMAP|Internet Message Access Protocol
IoC|Indicators of Compromise
IoT|Internet of Things
IP|Internet Protocol
IPS|Intrusion Prevention System
IPSec|Internet Protocol Security
IR|Incident Response
IRC|Internet Relay Chat
IRP|Incident Response Plan
ISO|International Standards Organization
ISP|Internet Service Provider
ISSO|Information Systems Security Officer
IV|Initialization Vector
KDC|Key Distribution Center
KEK|Key Encryption Key
L2TP|Layer 2 Tunneling Protocol
LAN|Local Area Network
LDAP|Lightweight Directory Access Protocol
LEAP|Lightweight Extensible Authentication Protocol
MaaS|Monitoring as a Service
MAC|Mandatory Access Control
MAC|Media Access Control
MAC|Message Authentication Code
MAN|Metropolitan Area Network
MBR|Master Boot Record
MD5|Message Digest 5
MDF|Main Distribution Frame
MDM|Mobile Device Management
MFA|Multifactor Authentication
MFD|Multifunction Device
MFP|Multifunction Printer
ML|Machine Learning
MMS|Multimedia Message Service
MOA|Memorandum of Agreement
MOU|Memorandum of Understanding
MPLS|Multi-protocol Label Switching
MSA|Master Service Agreement
MSCHAP|Microsoft Challenge Handshake Authentication Protocol
MSP|Managed Service Provider
MSSP|Managed Security Service Provider
MTBF|Mean Time Between Failures
MTTF|Mean Time to Failure
MTTR|Mean Time to Recover
MTU|Maximum Transmission Unit
NAC|Network Access Control
NAT|Network Address Translation
NDA|Non-disclosure Agreement
NFC|Near Field Communication
NGFW|Next-generation Firewall
NIDS|Network-based Intrusion Detection System
NIPS|Network-based Intrusion Prevention System
NIST|National Institute of Standards & Technology
NTFS|New Technology File System
NTLM|New Technology LAN Manager
NTP|Network Time Protocol
OAUTH|Open Authorization
OCSP|Online Certificate Status Protocol
OID|Object Identifier
OS|Operating System
OSINT|Open-source Intelligence
OSPF|Open Shortest Path First
OT|Operational Technology
OTA|Over the Air
OVAL|Open Vulnerability Assessment Language
P12|PKCS #12
P2P|Peer to Peer
PaaS|Platform as a Service
PAC|Proxy Auto Configuration
PAM|Privileged Access Management
PAM|Pluggable Authentication Modules
PAP|Password Authentication Protocol
PAT|Port Address Translation
PBKDF2|Password-based Key Derivation Function 2
PBX|Private Branch Exchange
PCAP|Packet Capture
PCI DSS|Payment Card Industry Data Security Standard
PDU|Power Distribution Unit
PEAP|Protected Extensible Authentication Protocol
PED|Personal Electronic Device
PEM|Privacy Enhanced Mail
PFS|Perfect Forward Secrecy
PGP|Pretty Good Privacy
PHI|Personal Health Information
PII|Personally Identifiable Information
PIV|Personal Identity Verification
PKCS|Public Key Cryptography Standards
PKI|Public Key Infrastructure
POP|Post Office Protocol
POTS|Plain Old Telephone Service
PPP|Point-to-Point Protocol
PPTP|Point-to-Point Tunneling Protocol
PSK|Pre-shared Key
PTZ|Pan-tilt-zoom
PUP|Potentially Unwanted Program
RA|Recovery Agent
RA|Registration Authority
RACE|Research and Development in Advanced Communications Technologies in Europe
RAD|Rapid Application Development
RADIUS|Remote Authentication Dial-in User Service
RAID|Redundant Array of Inexpensive Disks
RAS|Remote Access Server
RAT|Remote Access Trojan
RBAC|Role-based Access Control
RBAC|Rule-based Access Control
RC4|Rivest Cipher version 4
RDP|Remote Desktop Protocol
RFID|Radio Frequency Identifier
RIPEMD|RACE Integrity Primitives Evaluation Message Digest
ROI|Return on Investment
RPO|Recovery Point Objective
RSA|Rivest, Shamir, & Adleman
RTBH|Remotely Triggered Black Hole
RTO|Recovery Time Objective
RTOS|Real-time Operating System
RTP|Real-time Transport Protocol
S/MIME|Secure/Multipurpose Internet Mail Extensions
SaaS|Software as a Service
SAE|Simultaneous Authentication of Equals
SAML|Security Assertions Markup Language
SAN|Storage Area Network
SAN|Subject Alternative Name
SASE|Secure Access Service Edge
SCADA|Supervisory Control and Data Acquisition
SCAP|Security Content Automation Protocol
SCEP|Simple Certificate Enrollment Protocol
SD-WAN|Software-defined Wide Area Network
SDK|Software Development Kit
SDLC|Software Development Lifecycle
SDLM|Software Development Lifecycle Methodology
SDN|Software-defined Networking
SE Linux|Security-enhanced Linux
SED|Self-encrypting Drives
SEH|Structured Exception Handler
SFTP|Secured File Transfer Protocol
SHA|Secure Hashing Algorithm
SHTTP|Secure Hypertext Transfer Protocol
SIEM|Security Information and Event Management
SIM|Subscriber Identity Module
SLA|Service-level Agreement
SLE|Single Loss Expectancy
SMS|Short Message Service
SMTP|Simple Mail Transfer Protocol
SMTPS|Simple Mail Transfer Protocol Secure
SNMP|Simple Network Management Protocol
SOAP|Simple Object Access Protocol
SOAR|Security Orchestration, Automation, Response
SoC|System on Chip
SOC|Security Operations Center
SOW|Statement of Work
SPF|Sender Policy Framework
SPIM|Spam over Internet Messaging
SQL|Structured Query Language
SQLi|SQL Injection
SRTP|Secure Real-Time Protocol
SSD|Solid State Drive
SSH|Secure Shell
SSL|Secure Sockets Layer
SSO|Single Sign-on
STIX|Structured Threat Information eXchange
SWG|Secure Web Gateway
TACACS+|Terminal Access Controller Access Control System
TAXII|Trusted Automated eXchange of Indicator Information
TCP/IP|Transmission Control Protocol/Internet Protocol
TGT|Ticket Granting Ticket
TKIP|Temporal Key Integrity Protocol
TLS|Transport Layer Security
TOC|Time-of-check
TOTP|Time-based One-time Password
TOU|Time-of-use
TPM|Trusted Platform Module
TTP|Tactics, Techniques, and Procedures
TSIG|Transaction Signature
UAT|User Acceptance Testing
UAV|Unmanned Aerial Vehicle
UDP|User Datagram Protocol
UEFI|Unified Extensible Firmware Interface
UEM|Unified Endpoint Management
UPS|Uninterruptable Power Supply
URI|Uniform Resource Identifier
URL|Universal Resource Locator
USB|Universal Serial Bus
USB OTG|USB On the Go
UTM|Unified Threat Management
UTP|Unshielded Twisted Pair
VBA|Visual Basic
VDE|Virtual Desktop Environment
VDI|Virtual Desktop Infrastructure
VLAN|Virtual Local Area Network
VLSM|Variable Length Subnet Masking
VM|Virtual Machine
VoIP|Voice over IP
VPC|Virtual Private Cloud
VPN|Virtual Private Network
VTC|Video Teleconferencing
WAF|Web Application Firewall
WAP|Wireless Access Point
WEP|Wired Equivalent Privacy
WIDS|Wireless Intrusion Detection System
WIPS|Wireless Intrusion Prevention System
WO|Work Order
WPA|Wi-Fi Protected Access
WPS|Wi-Fi Protected Setup
WTLS|Wireless TLS
XDR|Extended Detection and Response
XML|Extensible Markup Language
XOR|Exclusive Or
XSRF|Cross-site Request Forgery
XSS|Cross-site Scripting
`.trim().split("\n").map((line) => line.split("|"));

const ports = [
  ["20-21", "FTP", "TCP"], ["22", "SSH/SFTP/SCP", "TCP"], ["23", "Telnet", "TCP"], ["25", "SMTP relay", "TCP"],
  ["49", "TACACS+", "TCP"], ["53", "DNS", "TCP/UDP"], ["67-68", "DHCP", "UDP"], ["69", "TFTP", "UDP"],
  ["80", "HTTP", "TCP"], ["88", "Kerberos", "TCP/UDP"], ["110", "POP3", "TCP"], ["119", "NNTP", "TCP"],
  ["123", "NTP", "UDP"], ["135", "RPC/DCOM", "TCP/UDP"], ["137-139", "NetBIOS", "TCP/UDP"], ["143", "IMAP", "TCP"],
  ["161-162", "SNMP", "UDP"], ["389", "LDAP", "TCP/UDP"], ["443", "HTTPS", "TCP"], ["445", "SMB", "TCP"],
  ["465", "SMTPS", "TCP"], ["514", "Syslog", "UDP"], ["587", "SMTP-TLS/Submission", "TCP"], ["636", "LDAPS", "TCP"],
  ["860", "iSCSI", "TCP"], ["989-990", "FTPS", "TCP"], ["993", "IMAPS", "TCP"], ["995", "POP3S", "TCP"],
  ["1433", "Microsoft SQL Server", "TCP"], ["1645-1646", "RADIUS legacy", "UDP"], ["1701", "L2TP", "UDP"],
  ["1723", "PPTP", "TCP"], ["1812-1813", "RADIUS", "UDP"], ["3225", "FCIP", "TCP"], ["3260", "iSCSI target", "TCP"],
  ["3389", "RDP", "TCP/UDP"], ["3868", "Diameter", "TCP/SCTP"], ["5060-5061", "SIP/SIPS", "TCP/UDP"],
  ["5900", "VNC", "TCP"], ["6514", "Syslog over TLS", "TCP"]
].map(([port, protocol, transport]) => ({ port, protocol, transport }));

const pbqs = [
  {
    id: "pbq1",
    type: "matching",
    title: "Match attacks to descriptions",
    instructions: "Match each attack to the BEST description.",
    pairs: [
      ["Phishing", "Fraudulent message designed to steal credentials"],
      ["On-path attack", "Interception or alteration of traffic between parties"],
      ["SQL injection", "Input interpreted as database commands"],
      ["Credential stuffing", "Reuse of stolen username and password pairs"]
    ],
    explanation: "Chaque association mesure la reconnaissance des attaques. Le credit partiel recompense les correspondances exactes et montre les definitions a revoir."
  },
  {
    id: "pbq2",
    type: "ordering",
    title: "Incident response order",
    instructions: "Place the seven incident response steps in the correct order.",
    order: ["Preparation", "Detection", "Analysis", "Containment", "Eradication", "Recovery", "Lessons learned"],
    explanation: "L'ordre suit la logique: se preparer, detecter, analyser, contenir, supprimer la cause, restaurer, puis ameliorer le processus."
  },
  {
    id: "pbq3",
    type: "firewall",
    title: "Configure firewall rules",
    instructions: "Create rules to allow HTTPS from the Internet to 10.0.2.20 and SSH only from 10.0.1.10 to 10.0.2.20. The implicit deny remains at the bottom.",
    required: [
      { action: "Allow", protocol: "TCP", src: "Any", dst: "10.0.2.20", port: "443" },
      { action: "Allow", protocol: "TCP", src: "10.0.1.10", dst: "10.0.2.20", port: "22" }
    ],
    explanation: "Les regles autorisent uniquement les flux demandes. La regle implicite deny bloque tout le reste, ce qui respecte le principe du moindre privilege."
  },
  {
    id: "pbq4",
    type: "matching",
    title: "Match controls to categories",
    instructions: "Match each security control to the BEST control category.",
    pairs: [
      ["MFA", "Preventive"],
      ["SIEM alert", "Detective"],
      ["Restore from backup", "Corrective"],
      ["Warning banner", "Deterrent"],
      ["Manual approval process", "Compensating"]
    ],
    explanation: "MFA empeche ou reduit l'acces non autorise, le SIEM detecte, la restauration corrige, la banniere dissuade, et le processus manuel compense un controle indisponible."
  },
  {
    id: "pbq5",
    type: "ordering",
    title: "Change management order",
    instructions: "Place the change management steps in the MOST appropriate order.",
    order: ["Submit change request", "Assess risk and impact", "Obtain approval", "Schedule implementation", "Test and validate", "Implement change", "Document and close"],
    explanation: "Un changement securise commence par une demande, puis une analyse de risque, une approbation, une planification, des tests, l'implementation, et la documentation finale."
  },
  {
    id: "pbq6",
    type: "ordering",
    title: "PKI certificate lifecycle",
    instructions: "Place the PKI certificate lifecycle steps in the correct order.",
    order: ["Generate key pair", "Create CSR", "Submit CSR to CA", "Validate identity", "Issue certificate", "Install certificate", "Revoke or renew certificate"],
    explanation: "Le cycle PKI suit la creation des cles, la CSR, la validation par l'autorite, l'emission, l'installation, puis le renouvellement ou la revocation."
  },
  {
    id: "pbq7",
    type: "firewall",
    title: "Restrict management access",
    instructions: "Create rules to allow RDP only from 10.0.10.50 to 10.0.20.15 and allow DNS from the server subnet 10.0.20.0/24 to 10.0.30.10. The implicit deny remains at the bottom.",
    required: [
      { action: "Allow", protocol: "TCP", src: "10.0.10.50", dst: "10.0.20.15", port: "3389" },
      { action: "Allow", protocol: "UDP", src: "10.0.20.0/24", dst: "10.0.30.10", port: "53" }
    ],
    explanation: "RDP doit etre limite a l'hote d'administration autorise. DNS est autorise seulement depuis le sous-reseau serveur vers le resolver. Tout autre trafic reste bloque par l'implicite deny."
  },
  {
    id: "pbq8",
    type: "matching",
    title: "Match log sources to investigations",
    instructions: "Match each investigation need to the BEST log source.",
    pairs: [
      ["Failed MFA followed by success", "Identity provider logs"],
      ["Blocked outbound malware callback", "Firewall logs"],
      ["Suspicious PowerShell execution", "EDR telemetry"],
      ["Multiple web 500 errors after input", "Web application logs"],
      ["Unusual DNS query volume", "DNS logs"]
    ],
    explanation: "Chaque source donne le contexte le plus direct: identite pour MFA, firewall pour trafic bloque, EDR pour endpoint, application web pour erreurs applicatives, DNS pour resolution et volumes de requetes."
  },
  {
    id: "pbq9",
    type: "matching",
    title: "Match cloud controls to risks",
    instructions: "Match each cloud risk to the BEST mitigation.",
    pairs: [
      ["Public storage bucket", "Restrict bucket permissions"],
      ["Compromised cloud admin", "Require MFA and least privilege"],
      ["Unencrypted sensitive database", "Enable encryption at rest"],
      ["No visibility into SaaS sharing", "Deploy CASB"],
      ["Manual insecure deployments", "Use IaC security checks"]
    ],
    explanation: "Les controles doivent traiter directement le risque: permissions pour stockage public, MFA et moindre privilege pour comptes admin, chiffrement pour donnees, CASB pour SaaS, et controles IaC pour deploiements."
  },
  {
    id: "pbq10",
    type: "ordering",
    title: "Risk treatment process",
    instructions: "Place the risk management steps in the MOST appropriate order.",
    order: ["Identify asset", "Identify threat and vulnerability", "Determine likelihood", "Determine impact", "Calculate risk", "Select risk response", "Monitor residual risk"],
    explanation: "La gestion du risque commence par l'actif, puis menace/vulnerabilite, probabilite, impact, calcul du risque, choix du traitement, et suivi du risque residuel."
  },
  {
    id: "pbq11",
    type: "ordering",
    title: "Kerberos authentication flow",
    instructions: "Place the Kerberos authentication events in the correct high-level order.",
    order: ["User authenticates to KDC", "Authentication Service issues TGT", "Client requests service ticket", "Ticket Granting Service issues service ticket", "Client presents ticket to application server", "Application server grants access"],
    explanation: "Kerberos utilise le KDC, un TGT, puis un ticket de service. L'application ne recoit pas le mot de passe utilisateur directement."
  },
  {
    id: "pbq12",
    type: "ordering",
    title: "Digital forensics volatility order",
    instructions: "Place evidence sources from most volatile to least volatile.",
    order: ["CPU registers and cache", "RAM contents and network tables", "Persistent disks and removable media", "Remote logs and monitoring data", "Physical topology and configuration", "Archival media and printed documents"],
    explanation: "La collecte commence par ce qui disparait le plus vite. La RAM et les tables reseau passent avant les disques et les archives."
  },
  {
    id: "pbq13",
    type: "matching",
    title: "Match cloud responsibility",
    instructions: "Match each cloud item to the party MOST responsible in a typical SaaS/IaaS shared-responsibility discussion.",
    pairs: [
      ["Physical data center security", "Cloud provider"],
      ["Data classification", "Cloud customer"],
      ["User access decisions", "Cloud customer"],
      ["Managed SaaS application patching", "Cloud provider"],
      ["IaaS guest OS hardening", "Cloud customer"]
    ],
    explanation: "Le fournisseur controle surtout l'infrastructure physique et les services geres. Le client reste responsable des donnees, identites, decisions d'acces et charges qu'il administre."
  },
  {
    id: "pbq14",
    type: "firewall",
    title: "VPN and directory access rules",
    instructions: "Allow LDAPS from VPN clients 10.8.0.0/24 to 10.0.5.10 and allow Kerberos from 10.8.0.0/24 to 10.0.5.20. The implicit deny remains at the bottom.",
    required: [
      { action: "Allow", protocol: "TCP", src: "10.8.0.0/24", dst: "10.0.5.10", port: "636" },
      { action: "Allow", protocol: "TCP/UDP", src: "10.8.0.0/24", dst: "10.0.5.20", port: "88" }
    ],
    explanation: "LDAPS protege l'annuaire sur 636. Kerberos utilise 88. Les regles restent limitees aux clients VPN et aux serveurs cibles."
  },
  {
    id: "pbq15",
    type: "matching",
    title: "Match NAC outcomes",
    instructions: "Match each NAC observation to the BEST enforcement decision.",
    pairs: [
      ["Compliant corporate laptop", "Production VLAN"],
      ["Missing endpoint protection", "Remediation VLAN"],
      ["Unknown IoT sensor", "Restricted device VLAN"],
      ["Guest phone", "Internet-only guest VLAN"],
      ["Known compromised host", "Quarantine"]
    ],
    explanation: "NAC peut appliquer une affectation dynamique de VLAN selon l'identite, le type, la localisation et l'etat de sante du device."
  },
  {
    id: "pbq16",
    type: "matching",
    title: "Match BIA metrics",
    instructions: "Match each business continuity metric to its BEST meaning.",
    pairs: [
      ["RTO", "Target time to restore service"],
      ["RPO", "Maximum tolerable data loss point"],
      ["MTD", "Maximum downtime before unacceptable harm"],
      ["WRT", "Extra work time after systems are restored"],
      ["MTTR", "Average time to repair a failed component"]
    ],
    explanation: "RTO parle du temps de reprise, RPO de la perte de donnees, MTD du seuil maximal, WRT des taches apres reprise et MTTR de la reparation."
  },
  {
    id: "pbq17",
    type: "matching",
    title: "Match DLP responses",
    instructions: "Match each DLP action to the BEST description.",
    pairs: [
      ["Alert only", "Log and notify without stopping the user"],
      ["Block", "Prevent the transfer while keeping original access"],
      ["Quarantine", "Deny access to the original file"],
      ["Tombstone", "Replace the file with a policy notice"],
      ["Policy server", "Central place for rules, reports, and incidents"]
    ],
    explanation: "Les reponses DLP varient de la simple alerte au blocage, a la quarantaine ou au remplacement par un tombstone."
  },
  {
    id: "pbq18",
    type: "matching",
    title: "Match governance documents",
    instructions: "Match each governance artifact to the BEST description.",
    pairs: [
      ["Policy", "High-level mandatory direction"],
      ["Standard", "Mandatory implementation specification"],
      ["Baseline", "Minimum secure settings for a category"],
      ["Guideline", "Recommended non-mandatory advice"],
      ["Procedure", "Step-by-step task instructions"]
    ],
    explanation: "La gouvernance distingue l'intention, les exigences obligatoires, les minimums de configuration, les recommandations et les etapes operatoires."
  },
  {
    id: "pbq19",
    type: "ordering",
    title: "Certificate request and renewal",
    instructions: "Place these certificate management actions in the MOST appropriate order.",
    order: ["Generate or protect private key", "Create certificate signing request", "Submit request to CA or RA", "Validate subject identity", "Install issued certificate", "Monitor expiration", "Renew, rekey, revoke, or replace"],
    explanation: "Le cycle certificat doit proteger la cle privee, valider l'identite et prevoir l'expiration, le rekey ou la revocation."
  },
  {
    id: "pbq20",
    type: "matching",
    title: "Match secure protocols",
    instructions: "Match each insecure or plain service to the BEST secure replacement.",
    pairs: [
      ["HTTP", "HTTPS"],
      ["Telnet", "SSH"],
      ["LDAP simple bind", "LDAPS"],
      ["FTP", "SFTP or FTPS"],
      ["Plain SMTP submission", "STARTTLS or SMTPS"]
    ],
    explanation: "Les versions securisees ajoutent generalement TLS ou SSH pour proteger l'authentification et les donnees en transit."
  },
  {
    id: "pbq21",
    type: "ordering",
    title: "Incident response lifecycle",
    instructions: "Place the six common incident response lifecycle phases in order.",
    order: ["Preparation", "Identification", "Containment", "Eradication", "Recovery", "Lessons learned"],
    explanation: "On se prepare avant l'incident, on identifie, on limite l'impact, on supprime la cause, on restaure, puis on ameliore."
  },
  {
    id: "pbq22",
    type: "matching",
    title: "Match privacy roles",
    instructions: "Match each privacy or data role to the BEST responsibility.",
    pairs: [
      ["Data owner", "Defines classification and protection requirements"],
      ["Data steward", "Maintains data quality and metadata"],
      ["Data custodian", "Operates systems and technical controls"],
      ["Data controller", "Determines why and how personal data is processed"],
      ["Data processor", "Processes personal data on controller instructions"]
    ],
    explanation: "Les roles separent decision metier, qualite, operations techniques et responsabilites privacy."
  },
  {
    id: "pbq23",
    type: "matching",
    title: "Match malicious indicators",
    instructions: "Match each observation to the MOST likely malicious activity.",
    pairs: [
      ["Files renamed with encrypted extensions", "Ransomware"],
      ["Large encoded DNS queries", "DNS tunneling"],
      ["New hidden privileged process", "Rootkit"],
      ["One password tried against many users", "Password spraying"],
      ["Browser action submitted from another site", "CSRF"]
    ],
    explanation: "Les indicateurs doivent etre relies au comportement: chiffrement, exfiltration DNS, dissimulation privilegiee, brute force horizontale ou abus de session web."
  },
  {
    id: "pbq24",
    type: "ordering",
    title: "Restoration dependency order",
    instructions: "Place the site restoration actions in a practical dependency order.",
    order: ["Enable and test power", "Enable switching and routing", "Enable network security appliances", "Enable DNS, DHCP, NTP, and directory services", "Restore databases and middleware", "Enable front-end applications", "Validate client access"],
    explanation: "La reprise suit les dependances: energie, reseau, securite, services de base, donnees, applications, puis acces utilisateurs."
  },
  {
    id: "pbq25",
    type: "matching",
    title: "Match risk responses",
    instructions: "Match each decision to the BEST risk response.",
    pairs: [
      ["Deploy MFA to reduce account takeover", "Mitigation"],
      ["Stop using an unsupported public service", "Avoidance"],
      ["Buy cyber insurance", "Transference"],
      ["Document approval for a low residual risk", "Acceptance"],
      ["Continue monitoring after controls are applied", "Residual risk monitoring"]
    ],
    explanation: "Les reponses au risque sont mitigation, evitement, transfert et acceptation, avec suivi du risque residuel."
  },
  {
    id: "pbq26",
    type: "firewall",
    title: "Block attacker and allow web services",
    instructions: "Configure rules to block attacker 203.0.113.77 to the DMZ web server, allow HTTPS from the Internet to 10.0.2.20, and allow SSH only from admin host 10.0.10.5. The implicit deny remains at the bottom.",
    required: [
      { action: "Deny", protocol: "Any", src: "203.0.113.77", dst: "10.0.2.20", port: "Any" },
      { action: "Allow", protocol: "TCP", src: "Any", dst: "10.0.2.20", port: "443" },
      { action: "Allow", protocol: "TCP", src: "10.0.10.5", dst: "10.0.2.20", port: "22" }
    ],
    explanation: "La regle de blocage specifique doit passer avant les autorisations. HTTPS est ouvert au public, SSH reste limite a l'hote d'administration."
  },
  {
    id: "pbq27",
    type: "log",
    title: "Analyze SIEM log indicators",
    instructions: "Review the log excerpts and select the BEST finding for each investigation field.",
    logs: [
      "2026-05-11T09:12:04Z 198.51.100.44 POST /login user=alice status=401",
      "2026-05-11T09:12:06Z 198.51.100.44 POST /login user=bob status=401",
      "2026-05-11T09:12:08Z 198.51.100.44 POST /login user=carol status=401",
      "2026-05-11T09:12:10Z 198.51.100.44 POST /login user=dave status=401",
      "2026-05-11T09:12:15Z 198.51.100.44 POST /login user=erin status=200"
    ],
    fields: [
      { label: "Likely attack", answer: "Password spraying", options: ["SQL injection", "Password spraying", "DNS tunneling", "Clickjacking"] },
      { label: "Source IP", answer: "198.51.100.44", options: ["198.51.100.44", "203.0.113.77", "10.0.2.20", "127.0.0.1"] },
      { label: "Best immediate response", answer: "Disable affected account and block source", options: ["Disable affected account and block source", "Open port 22 to all hosts", "Ignore because one login succeeded", "Delete the authentication logs"] }
    ],
    explanation: "Le meme IP essaie un mot de passe contre plusieurs utilisateurs puis obtient un succes. C'est un signal typique de password spraying."
  },
  {
    id: "pbq28",
    type: "log",
    title: "Identify web attack from server logs",
    instructions: "Review the web logs and select the BEST finding for each field.",
    logs: [
      "2026-05-11T13:44:21Z 203.0.113.9 GET /products?id=10 status=200",
      "2026-05-11T13:44:24Z 203.0.113.9 GET /products?id=10'%20OR%201=1-- status=500",
      "2026-05-11T13:44:28Z 203.0.113.9 GET /admin status=403",
      "2026-05-11T13:44:32Z 203.0.113.9 GET /products?id=11%20UNION%20SELECT status=500"
    ],
    fields: [
      { label: "Likely attack", answer: "SQL injection", options: ["SQL injection", "Smishing", "ARP poisoning", "Password spraying"] },
      { label: "Strongest indicator", answer: "Encoded OR and UNION strings", options: ["Encoded OR and UNION strings", "Normal HTTP 200 response", "Use of TCP 443 only", "A single DNS lookup"] },
      { label: "Best control", answer: "Input validation and parameterized queries", options: ["Input validation and parameterized queries", "Disable all logging", "Use Telnet for admin access", "Allow anonymous database writes"] }
    ],
    explanation: "Les chaines encodees OR 1=1 et UNION SELECT sont des indicateurs classiques d'injection SQL."
  },
  {
    id: "pbq29",
    type: "topology",
    title: "Place network security devices",
    instructions: "Place each security device in the BEST topology location.",
    topology: ["Internet", "Edge", "DMZ", "Internal LAN", "Server VLAN"],
    placements: [
      { slot: "Between Internet and DMZ", answer: "Firewall", options: ["Firewall", "NTP server", "Data owner", "Password manager"] },
      { slot: "Monitoring traffic entering Server VLAN", answer: "NIDS sensor", options: ["NIDS sensor", "Public kiosk", "Root CA", "Marketing laptop"] },
      { slot: "Inbound web traffic before web servers", answer: "Reverse proxy/WAF", options: ["Reverse proxy/WAF", "DHCP client", "Bluetooth beacon", "Tape library"] },
      { slot: "Distribute HTTPS across web servers", answer: "Load balancer", options: ["Load balancer", "SIEM parser", "USB data blocker", "Degaussing station"] }
    ],
    explanation: "Le pare-feu controle les zones, le NIDS observe les flux, le reverse proxy/WAF protege l'application web et le load balancer distribue la charge."
  },
  {
    id: "pbq30",
    type: "iam",
    title: "Configure least privilege IAM",
    instructions: "Assign each identity the BEST role and control for least privilege.",
    identities: [
      { subject: "Help desk analyst", role: "Password reset role", control: "MFA required", roleOptions: ["Global admin", "Password reset role", "Billing owner", "Read-only auditor"], controlOptions: ["No MFA", "MFA required", "Shared account", "Anonymous access"] },
      { subject: "External auditor", role: "Read-only auditor", control: "Time-limited access", roleOptions: ["Global admin", "Password reset role", "Billing owner", "Read-only auditor"], controlOptions: ["Permanent admin", "Time-limited access", "Disable logging", "No approval"] },
      { subject: "Cloud administrator", role: "Privileged admin via JIT", control: "MFA and approval", roleOptions: ["Guest", "Privileged admin via JIT", "Public user", "Read-only auditor"], controlOptions: ["MFA and approval", "No MFA", "Shared root account", "Unlogged access"] }
    ],
    explanation: "Le moindre privilege exige des roles limites, MFA, acces temporaire et elevation JIT pour les comptes privilegies."
  },
  {
    id: "pbq31",
    type: "matching",
    title: "Match authentication factors",
    instructions: "Match each authentication method to the BEST factor or attribute.",
    pairs: [
      ["Password", "Something you know"],
      ["Hardware token", "Something you have"],
      ["Fingerprint", "Something you are"],
      ["GPS location", "Somewhere you are"],
      ["Typing rhythm", "Something you do"]
    ],
    explanation: "Les facteurs MFA doivent venir de categories differentes. Les attributs comme la localisation et le comportement peuvent renforcer l'evaluation du risque."
  },
  {
    id: "pbq32",
    type: "ordering",
    title: "Host hardening order",
    instructions: "Place the host hardening actions in the MOST appropriate order.",
    order: ["Install from trusted image", "Apply security patches", "Remove unnecessary services", "Change default credentials", "Enable host firewall and EDR", "Configure logging and monitoring", "Validate against baseline"],
    explanation: "Le durcissement part d'une image fiable, applique les correctifs, reduit la surface d'attaque, renforce l'acces, active les controles et valide la baseline."
  },
  {
    id: "pbq33",
    type: "topology",
    title: "Secure segmented enterprise network",
    instructions: "Choose the BEST placement for each control in a segmented network.",
    topology: ["Internet", "Guest Wi-Fi", "DMZ", "Internal LAN", "Management VLAN"],
    placements: [
      { slot: "Guest Wi-Fi to Internal LAN boundary", answer: "Firewall ACL deny", options: ["Firewall ACL deny", "Open route", "Shared admin password", "Plain FTP"] },
      { slot: "Management VLAN access", answer: "Jump server with MFA", options: ["Jump server with MFA", "Public web server", "Anonymous proxy", "Default account"] },
      { slot: "Public web application protection", answer: "WAF", options: ["WAF", "POP3 mailbox", "Flat switch", "Unencrypted LDAP"] },
      { slot: "Central event collection", answer: "SIEM", options: ["SIEM", "Rogue AP", "PPTP client", "USB hub"] }
    ],
    explanation: "La segmentation se protege avec ACL, VLAN de management controle, WAF pour l'application publique et SIEM pour la centralisation des evenements."
  }
];

const controls = [
  ["Preventive", "MFA, patching, hardening"],
  ["Detective", "SIEM alert, IDS, audit log"],
  ["Corrective", "Restore from backup, reimage host"],
  ["Deterrent", "Warning banner, guard presence"],
  ["Compensating", "Manual approval when automation is unavailable"]
];


export { domains, examSets, baseQuestions, guideTopics, acronymRows, ports, pbqs, controls };
