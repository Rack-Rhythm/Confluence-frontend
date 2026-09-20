<div align="center">

# 🌐 Confluence

### From Community Problems to Deployable Solutions

A digital collaboration platform that connects **citizens, universities, students, government and industry** to solve real-world societal challenges.

<p>
  <img src="https://img.shields.io/badge/Smart%20India%20Hackathon-2026-blue?style=for-the-badge" alt="SIH 2026"/>
  <img src="https://img.shields.io/badge/PS-SIH26043-purple?style=for-the-badge" alt="Problem Statement SIH26043"/>
  <img src="https://img.shields.io/badge/Category-Software-green?style=for-the-badge" alt="Software"/>
  <img src="https://img.shields.io/badge/Theme-Smart%20Education-orange?style=for-the-badge" alt="Smart Education"/>
</p>

**Discover → Triage → Validate → Adopt → Innovate → Evaluate → Fund → Deploy → Verify**

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [How It Works](#-how-it-works)
- [Key Features](#-key-features)
- [Workflow in Detail](#-workflow-in-detail)
  - [1. Problem Discovery & AI Triage](#1-problem-discovery--ai-triage)
  - [2. Validation & University Adoption](#2-validation--university-adoption)
  - [3. Student Solution Development](#3-student-solution-development)
  - [4. Review, Ranking & Selection](#4-review-ranking--selection)
  - [5. Industry / CSR Support & Deployment](#5-industry--csr-support--deployment)
- [Challenge Lifecycle](#-challenge-lifecycle)
- [End-to-End Sequence](#-end-to-end-sequence)
- [Roles & Responsibilities](#-roles--responsibilities)
- [Security & IP Protection](#-security--ip-protection)
- [Business Rules](#-business-rules)
- [System Architecture](#-system-architecture)
- [Conceptual Data Model](#-conceptual-data-model)
- [Analytics & Monitoring](#-analytics--monitoring)
- [Glossary](#-glossary)
- [Getting Started](#-getting-started)
- [Contributing](#-contributing)
- [Problem Statement](#-problem-statement)

---

## 🎯 Overview

**Confluence** turns everyday civic observations into structured challenges, routes them to universities for adoption, lets students build and pitch solutions, and connects the best ones with industry and CSR partners for real-world pilots — closing the loop with community feedback and measurable impact.

| | |
|---|---|
| **For citizens** | Report a local problem with a photo, description and location. |
| **For universities** | Adopt validated challenges and channel student talent toward them. |
| **For students** | Build, prototype and pitch solutions with faculty mentorship — with your IP protected. |
| **For government** | Validate genuine civic needs and track outcomes. |
| **For industry / CSR** | Discover vetted solutions and fund, mentor and scale them. |

---

## 🚧 The Problem

Communities encounter real problems every day, yet the path from *"someone noticed an issue"* to *"a working solution is deployed"* is fragmented:

- Citizen-reported issues rarely reach the people who can solve them.
- Universities and students lack a structured pipeline of real-world, validated problems.
- Student innovations often stall at the prototype stage without funding or field access.
- Industry and CSR partners lack a trusted channel to find and back credible solutions.
- Outcomes are seldom measured, so lessons are not fed back into new challenges.

Confluence provides a single, governed platform that connects these stakeholders end to end.

---

## 🔄 How It Works

```mermaid
flowchart TB
    A["🌍 COMMUNITY<br/><b>Real-world problem</b>"]
    B["🤖 AI TRIAGE<br/><b>Classify • Deduplicate • Verify</b>"]
    C["✅ VALIDATION<br/><b>Civic need confirmed</b>"]
    D["🏛️ UNIVERSITY<br/><b>Challenge adopted</b>"]
    E["🎓 STUDENT INNOVATION<br/><b>Build • Test • Pitch</b>"]
    F["⚖️ EVALUATION<br/><b>Review • Select</b>"]
    G["🏢 INDUSTRY / CSR<br/><b>Fund • Mentor • Scale</b>"]
    H["🚀 FIELD DEPLOYMENT<br/><b>Pilot in the community</b>"]
    I["📊 IMPACT LOOP<br/><b>Feedback • Measure • Improve</b>"]

    A --> B --> C --> D --> E --> F --> G --> H --> I
    I -. "New / improved challenges" .-> A

    classDef community fill:#fff7ed,stroke:#f59e0b,stroke-width:2px,color:#7c2d12;
    classDef ai fill:#f5f3ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95;
    classDef governance fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;
    classDef innovation fill:#fdf2f8,stroke:#db2777,stroke-width:2px,color:#831843;
    classDef support fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#7c2d12;
    classDef deployment fill:#ecfdf5,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef impact fill:#ecfeff,stroke:#0891b2,stroke-width:2px,color:#164e63;

    class A community;
    class B ai;
    class C,D governance;
    class E,F innovation;
    class G support;
    class H deployment;
    class I impact;
```

> **Central loop:** Problem → AI Triage → Validation → University Adoption → Student Innovation → Evaluation → Industry Support → Deployment → Community Feedback → Impact

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📸 **Grassroots reporting** | Citizens submit photo, description, location and supporting evidence from their phone. |
| 📦 **In-browser compression** | Images are compressed client-side (~5 MB → ~150 KB) for low-bandwidth use. |
| 🤖 **AI Smart Engine** | Automatic categorization, duplicate detection and GPS verification. |
| 🏛️ **Institutional validation** | District officers confirm genuine civic need before challenges go live. |
| 🔒 **University Adoption Gate** | Pitching stays locked until a university formally adopts the challenge. |
| 🧑‍🏫 **Faculty mentorship** | Mentors guide engineering, prototyping, lab testing and refinement. |
| 🔐 **IP Shield** | Two-layer submissions keep sensitive technical material confidential. |
| ⚖️ **Structured review** | A University Review Board evaluates technical merit, cost, impact and readiness. |
| 🏢 **Industry / CSR support** | Grants, hardware, mentorship and pilot-scale support for selected solutions. |
| 📊 **Impact analytics** | Dashboards track participation, progress, deployment and outcomes. |

---

## 🧭 Workflow in Detail

### 1. Problem Discovery & AI Triage

A citizen's observation becomes a structured challenge.

```mermaid
flowchart LR
    A["📸 Raw Submission<br/>Photo + description + location"] --> B["🧹 Pre-processing<br/>In-browser compression"]
    B --> C["🤖 AI Classification"]
    C --> D{"♻️ Duplicate?"}

    D -->|Yes| E["🔗 Link / Merge<br/>Existing Challenge"]
    D -->|No| F["📍 GPS Verification"]

    F --> G{"✅ Valid Civic Need?"}
    G -->|No| H["⚠️ Review / Reject"]
    G -->|Yes| I["📋 Publish to<br/>Challenge Board"]

    classDef input fill:#fff7ed,stroke:#f59e0b,color:#7c2d12;
    classDef ai fill:#f5f3ff,stroke:#8b5cf6,color:#4c1d95;
    classDef decision fill:#eff6ff,stroke:#3b82f6,color:#1e3a8a;
    classDef output fill:#ecfdf5,stroke:#16a34a,color:#14532d;

    class A input;
    class B,C ai;
    class D,G decision;
    class E,F,H,I output;
```

> **Design principle:** AI assists triage; the workflow still contains explicit validation and institutional review stages.

### 2. Validation & University Adoption

Challenges reach adoption through two discovery routes: **student nomination** (with a feasibility rationale) or **district officer validation**.

```mermaid
flowchart TD
    X["📋 Challenge Board"]

    X --> A["🎓 Student Discovery"]
    X --> B["🏛️ District Officer"]

    A --> A1["Student Nomination<br/>+ Feasibility Rationale"]
    A1 --> C["🏫 University Coordinator"]

    B --> B1["Validate Genuine Civic Need"]
    B1 --> B2["Publish / Confirm Challenge"]
    B2 --> C

    C --> D{"University Adopts?"}

    D -->|No| E["🔒 Pitching Remains Locked"]
    D -->|Yes| F["🔓 Formally Adopted"]
    F --> G["📢 Open Call Activated"]

    classDef board fill:#eef6ff,stroke:#2563eb,color:#1e3a8a;
    classDef review fill:#fff7ed,stroke:#f59e0b,color:#7c2d12;
    classDef decision fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef lock fill:#fef2f2,stroke:#dc2626,color:#7f1d1d;
    classDef success fill:#ecfdf5,stroke:#16a34a,color:#14532d;

    class X board;
    class A,B,A1,B1,B2,C review;
    class D decision;
    class E lock;
    class F,G success;
```

> ### 🔑 Critical business rule: *No adoption → No pitching*
> A student may discover and nominate a challenge, but solution pitching becomes available **only after formal university adoption**.

### 3. Student Solution Development

Once a challenge is adopted and the open call is active, student teams build and pitch solutions with faculty support.

```mermaid
flowchart TD
    A["📢 Open Call"]
    B["🎓 Student / Engineering Teams"]
    C["💡 Solution Concept"]
    D["🧪 Prototype Development"]
    E["🧑‍🏫 Faculty Mentor"]
    F["🔐 IP Shield"]
    G["📤 Solution Pitch"]
    H["⚖️ University Review Board"]

    A --> B --> C --> D --> G --> H
    E --> D
    E --> G
    F --> G

    classDef openCall fill:#eef6ff,stroke:#2563eb,color:#1e3a8a;
    classDef student fill:#fdf2f8,stroke:#db2777,color:#831843;
    classDef mentor fill:#ecfdf5,stroke:#16a34a,color:#14532d;
    classDef security fill:#fff7ed,stroke:#ea580c,color:#7c2d12;
    classDef review fill:#f5f3ff,stroke:#7c3aed,color:#4c1d95;

    class A openCall;
    class B,C,D,G student;
    class E mentor;
    class F security;
    class H review;
```

**Faculty mentors guide:** engineering decisions · prototype development · laboratory testing · technical refinement.

### 4. Review, Ranking & Selection

```mermaid
flowchart TD
    A["📤 Student Pitches"]
    B["⚖️ University Review Board"]
    C["📐 Technical Evaluation"]
    D["💰 Feasibility / Cost Review"]
    E["🌍 Potential Community Impact"]
    F["🧪 Prototype Readiness"]
    G["🏆 Top-Ranked Solution"]
    H["🔄 Additional Review / Iteration"]

    A --> B
    B --> C & D & E & F
    C & D & E & F --> G
    B -.-> H
    H -.-> B

    classDef pitch fill:#fdf2f8,stroke:#db2777,color:#831843;
    classDef review fill:#f5f3ff,stroke:#7c3aed,color:#4c1d95;
    classDef criterion fill:#eff6ff,stroke:#3b82f6,color:#1e3a8a;
    classDef result fill:#ecfdf5,stroke:#16a34a,color:#14532d;

    class A pitch;
    class B,H review;
    class C,D,E,F criterion;
    class G result;
```

### 5. Industry / CSR Support & Deployment

Selected solutions can receive **grants**, **hardware**, **mentorship** and **pilot-scale support** before deployment in the community.

```mermaid
flowchart LR
    A["🏆 Selected Solution"]
    B["🏢 Corporate / CSR Partner"]
    C["💰 Grant"]
    D["🔧 Hardware"]
    E["🧑‍🏫 Mentorship"]
    F["📈 Pilot Scaling"]
    G["🚀 Field Deployment"]
    H["🏘️ Local Community"]
    I["📊 Outcome / Feedback"]

    A --> G
    B --> C --> G
    B --> D --> G
    B --> E --> G
    B --> F --> G
    G --> H --> I
    I -. "Improvements" .-> A

    classDef selected fill:#ecfdf5,stroke:#16a34a,color:#14532d;
    classDef industry fill:#fff7ed,stroke:#f59e0b,color:#7c2d12;
    classDef deployment fill:#eef6ff,stroke:#2563eb,color:#1e3a8a;
    classDef feedback fill:#f5f3ff,stroke:#7c3aed,color:#4c1d95;

    class A selected;
    class B,C,D,E,F industry;
    class G,H deployment;
    class I feedback;
```

---

## 🔁 Challenge Lifecycle

Every challenge moves through a well-defined set of states.

```mermaid
stateDiagram-v2
    [*] --> Reported
    Reported --> AI_Triage
    AI_Triage --> Duplicate_Linked: Duplicate
    AI_Triage --> Validation: New / Valid
    Validation --> Unadopted
    Unadopted --> Nominated
    Nominated --> University_Review
    University_Review --> Unadopted: Not adopted
    University_Review --> Adopted: Approved
    Adopted --> Open_Call
    Open_Call --> Pitch_Submitted
    Pitch_Submitted --> Board_Review
    Board_Review --> Iteration: Needs refinement
    Iteration --> Pitch_Submitted
    Board_Review --> Selected
    Selected --> Industry_Support
    Industry_Support --> Pilot
    Pilot --> Community_Feedback
    Community_Feedback --> [*]
```

---

## 🧵 End-to-End Sequence

```mermaid
sequenceDiagram
    autonumber

    actor Citizen
    participant AI as AI Smart Engine
    participant Officer as District Officer
    participant Uni as University
    participant Student as Student Team
    participant Board as University Review Board
    participant CSR as Industry / CSR
    participant Community as Local Community

    Citizen->>AI: Submit problem + photo + location
    AI->>AI: Categorize, detect duplicates, verify GPS
    AI->>Officer: Challenge for validation

    Officer->>Uni: Validated challenge
    Student->>Uni: Nomination + feasibility rationale
    Uni->>Uni: Review and adopt challenge

    Uni->>Student: Activate open call
    Uni->>Student: Faculty mentorship
    Student->>Student: Develop prototype
    Student->>Board: Submit solution pitch

    Board->>Board: Evaluate solutions
    Board->>CSR: Selected solution for support
    CSR->>Student: Grant / hardware / mentorship
    Student->>Community: Deploy pilot
    Community->>Uni: Feedback / outcome
```

---

## 👥 Roles & Responsibilities

```mermaid
flowchart TB
    A["🔐 Confluence Access Control"]

    A --> C["👥 Citizen"]
    A --> S["🎓 Student"]
    A --> F["🧑‍🏫 Faculty"]
    A --> U["🏛️ University"]
    A --> O["🏢 District / Government"]
    A --> I["🏭 Industry / CSR"]
    A --> R["⚖️ Review Board"]

    C --> C1["Report problems"]
    S --> S1["Discover + nominate"]
    S --> S2["Submit pitches"]
    F --> F1["Mentor + test"]
    U --> U1["Adopt challenges"]
    O --> O1["Validate civic need"]
    I --> I1["Support deployment"]
    R --> R1["Evaluate + select"]

    classDef root fill:#0f172a,stroke:#64748b,color:#f8fafc;
    classDef actor fill:#eef6ff,stroke:#3b82f6,color:#172554;
    classDef action fill:#f8fafc,stroke:#94a3b8,color:#0f172a;

    class A root;
    class C,S,F,U,O,I,R actor;
    class C1,S1,S2,F1,U1,O1,I1,R1 action;
```

### Stakeholder responsibility matrix

| Stakeholder | Discover | Validate | Adopt | Build | Evaluate | Fund | Deploy | Feedback |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Citizen / Community | ✓ | | | | | | | ✓ |
| Student | ✓ | | | ✓ | | | ✓ | |
| District Officer | | ✓ | | | | | | |
| University Coordinator | | | ✓ | | | | | |
| Faculty Mentor | | | | ✓ | ✓ | | | |
| Review Board | | | ✓ | | ✓ | | | |
| Industry / CSR | | | | | | ✓ | ✓ | |
| Government / Admin | | ✓ | ✓ | | ✓ | | ✓ | ✓ |

---

## 🔐 Security & IP Protection

Every student submission is split into a **public showcase layer** and a **confidential technical dossier**. Access to the confidential layer is enforced through **role-based access control (RBAC)**.

```mermaid
flowchart TB
    A["📦 Student Submission"]

    A --> B["🌐 PUBLIC ZONE<br/>Layer 1 — Showcase"]
    A --> C["🔐 RESTRICTED ZONE<br/>Layer 2 — Technical Dossier"]

    B --> B1["Problem summary"]
    B --> B2["High-level methodology"]
    B --> B3["Team + university credentials"]
    B --> B4["Community discussion"]

    C --> C1["CAD / circuit schematics"]
    C --> C2["Full source code"]
    C --> C3["Bill of materials + unit cost"]
    C --> C4["Proprietary algorithms / patents"]

    B --> P["👥 Public / Citizens / Community"]
    C --> Q["🔑 Authorized University Jury<br/>+ CSR Evaluators"]

    R["Role-Based Access Control"] -.-> C
    R -.-> Q

    classDef root fill:#0f172a,stroke:#64748b,color:#f8fafc;
    classDef public fill:#eff6ff,stroke:#2563eb,color:#1e3a8a;
    classDef private fill:#fff1f2,stroke:#dc2626,color:#7f1d1d;
    classDef security fill:#f5f3ff,stroke:#7c3aed,color:#4c1d95;

    class A root;
    class B,B1,B2,B3,B4,P public;
    class C,C1,C2,C3,C4,Q private;
    class R security;
```

| Layer | Visibility | Contents |
|---|---|---|
| 🌐 **Layer 1 — Public Showcase** | Everyone | Problem summary, high-level methodology, team members, university credentials, community discussion |
| 🔐 **Layer 2 — Confidential Dossier** | Authorized evaluators only | CAD blueprints, circuit schematics, source-code repositories, bill of materials, unit-cost calculations, proprietary algorithms, patent-related information |

---

## 📜 Business Rules

| # | Rule | Purpose |
|---|---|---|
| 01 | **No adoption → No pitching** | Prevents uncontrolled solution submissions |
| 02 | Student nominations require a **feasibility rationale** | Adds an initial quality filter |
| 03 | AI performs **categorization and duplicate detection** | Structures incoming challenges |
| 04 | District validation can confirm a **genuine civic need** | Adds institutional validation |
| 05 | Student submissions have **public + confidential layers** | Separates visibility from sensitive technical material |
| 06 | Confidential material is restricted to **authorized evaluators** | Protects sensitive solution details |
| 07 | University review precedes selection | Provides institutional evaluation |
| 08 | Industry/CSR can provide **grants, hardware, pilot support and mentorship** | Enables deployment |
| 09 | Deployment produces community feedback | Creates an impact-verification loop |

---

## 🏗️ System Architecture

Recommended layered architecture:

```mermaid
flowchart TB
    subgraph CLIENT["CLIENT LAYER"]
        A["Web / Responsive UI"]
        B["Citizen Interface"]
        C["Student Interface"]
        D["University / Admin Interface"]
    end

    subgraph API["APPLICATION LAYER"]
        E["REST API"]
        F["Authentication / RBAC"]
        G["Challenge Workflow"]
        H["Pitch / Review Workflow"]
        I["Notification / Communication"]
    end

    subgraph AI["AI LAYER"]
        J["Classification"]
        K["Duplicate Detection"]
        L["Semantic Matching / Embeddings"]
        M["Location / Evidence Validation"]
    end

    subgraph DATA["DATA & STORAGE"]
        N[("PostgreSQL")]
        O["Media / Document Storage"]
        P["Audit / Activity Data"]
    end

    subgraph EXTERNAL["PARTNER / EXTERNAL LAYER"]
        Q["University"]
        R["Government"]
        S["Industry / CSR"]
    end

    CLIENT --> API
    API --> AI
    API --> DATA
    API --> EXTERNAL

    classDef layer fill:#f8fafc,stroke:#64748b,stroke-width:1.5px,color:#0f172a;
    classDef ai fill:#f5f3ff,stroke:#7c3aed,stroke-width:1.5px,color:#4c1d95;
    classDef external fill:#fff7ed,stroke:#f59e0b,stroke-width:1.5px,color:#7c2d12;

    class A,B,C,D,E,F,G,H,I,N,O,P layer;
    class J,K,L,M ai;
    class Q,R,S external;
```

---

## 🗄️ Conceptual Data Model

```mermaid
erDiagram
    CITIZEN ||--o{ CHALLENGE : reports
    CHALLENGE ||--o{ NOMINATION : receives
    STUDENT ||--o{ NOMINATION : submits
    UNIVERSITY ||--o{ CHALLENGE : adopts
    CHALLENGE ||--o{ PITCH : receives
    STUDENT_TEAM ||--o{ PITCH : submits
    FACULTY ||--o{ STUDENT_TEAM : mentors
    UNIVERSITY ||--o{ STUDENT_TEAM : hosts
    REVIEW_BOARD ||--o{ PITCH : evaluates
    PITCH ||--o| SOLUTION : becomes
    INDUSTRY_PARTNER ||--o{ SUPPORT : provides
    SOLUTION ||--o{ SUPPORT : receives
    SOLUTION ||--o{ PILOT : enters
    PILOT ||--o{ FEEDBACK : generates
    COMMUNITY ||--o{ FEEDBACK : submits

    CITIZEN {
        string citizen_id
        string name
    }
    CHALLENGE {
        string challenge_id
        string category
        string status
        string location
    }
    NOMINATION {
        string nomination_id
        string rationale
        string status
    }
    STUDENT {
        string student_id
        string name
    }
    UNIVERSITY {
        string university_id
        string name
    }
    PITCH {
        string pitch_id
        string title
        string status
    }
    SOLUTION {
        string solution_id
        string deployment_status
    }
    INDUSTRY_PARTNER {
        string partner_id
        string organization
    }
    PILOT {
        string pilot_id
        string location
        string status
    }
```

> ℹ️ This is a **conceptual data model** derived from the workflow, not the exact implemented database schema.

---

## 📊 Analytics & Monitoring

Operational events from every stage feed a shared analytics layer.

```mermaid
flowchart LR
    subgraph SRC["Data Sources"]
        B["Challenge data"]
        C["University data"]
        D["Student / pitch data"]
        E["Industry / CSR data"]
        F["Deployment data"]
        G["Community feedback"]
    end

    H["📊 Analytics Layer"]

    subgraph MET["Dashboards & Metrics"]
        I["Challenge volume"]
        J["Domain distribution"]
        K["Institutional participation"]
        L["Industry engagement"]
        M["Project progress"]
        N["Deployment / impact"]
    end

    SRC --> H --> MET

    classDef data fill:#eef6ff,stroke:#2563eb,color:#1e3a8a;
    classDef analytics fill:#f5f3ff,stroke:#7c3aed,color:#4c1d95;
    classDef metric fill:#ecfdf5,stroke:#16a34a,color:#14532d;

    class B,C,D,E,F,G data;
    class H analytics;
    class I,J,K,L,M,N metric;
```

---

## 📚 Glossary

| Term | Meaning |
|---|---|
| **Challenge** | A structured societal problem submitted to the platform |
| **AI Triage** | Automated categorization, duplicate detection and GPS verification |
| **Nomination** | Student proposal requesting consideration/adoption of a challenge |
| **Adoption** | University's formal acceptance of a challenge for solution development |
| **Open Call** | Stage where students can formally submit solutions |
| **IP Shield** | Separation/protection mechanism for sensitive technical material |
| **Pitch** | A student team's proposed solution |
| **Review Board** | University-level body that evaluates submitted solutions |
| **CSR Partner** | Corporate partner supporting funding, hardware, mentoring or pilot deployment |
| **Pilot** | Field deployment of a selected solution in a local community |

---

## 🚀 Getting Started

> 🛠️ **Note:** Replace the placeholders below with the project's actual setup details.

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/confluence.git
cd confluence

# 2. Install dependencies
# <install command>

# 3. Configure environment variables
cp .env.example .env

# 4. Run the development server
# <run command>
```

### Prerequisites

- `<runtime / language version>`
- PostgreSQL
- `<any other services, e.g. object storage>`

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

**Reporting security issues:** please do not open a public issue for vulnerabilities — contact the maintainers privately instead.

---

## 🏁 Problem Statement

| | |
|---|---|
| **Hackathon** | Smart India Hackathon 2026 |
| **Problem Statement ID** | SIH26043 |
| **Category** | Software |
| **Theme** | Smart Education |

---

<div align="center">

**Problem → AI Triage → Validation → University Adoption → Student Innovation → Evaluation → Industry Support → Deployment → Community Feedback → Impact**

*Built to turn community problems into deployable solutions.* 🌍

</div>
