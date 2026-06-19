# 🔍 Codebase Archaeologist

> A premium, interactive developer intelligence tool designed to ingest, parse, and map raw source code hierarchies into dynamic, directed dependency graphs. Supported by a local AST parsing engine and an LLM Multi-Agent Swarm (Auditor, Architect, and Scribe), it simplifies code comprehension, security audits, and structural refactoring.

---

## 🚀 Key Features

### 1. Clustered Code Mapping
* **Dynamic Node Layout**: Traverses any JavaScript, TypeScript, or Python repository and places files in a central layout grid, automatically clustering local functions in a circle around their parent files.
* **Interactive SVG Canvas**: Zoom, pan, reset, and drag nodes directly inside the viewport. Icons and colors represent safety states (Healthy, Warning, and Critical).
* **Plural Edge Normalization**: Maps import and call hierarchies using HMR-friendly CSS variables to adjust lines and arrowhead markers instantly based on active theme classes.

### 2. Dual-Theme Protocol
* **Strict Class-based Toggle**: Leverages Tailwind CSS v4's class-based variant strategy to handle instant swaps without canvas flashing.
* **Tech Noir Dark Mode**: Matte black workspace (`#050811`), slate panels (`#0C1322`), neon indigo overlays, emerald highlights, and ruby alerts.
* **Clean IDE Light Mode**: Crisp gray backgrounds (`#F8FAFC`), pure white panels (`#FFFFFF`), solid dividers (`#E2E8F0`), and high-contrast slate text.

### 3. Glassmorphic Authentication Suite
* **Interactive tab card** featuring smooth validation transitions.
* **4-bar password complexity scanner** with dynamic strength indicators and password visibility eye toggles.
* **Single-click GitHub OAuth** simulation for immediate workspace loading.

### 4. Swarm Insights Terminal
* **Auditor Tab**: Highlights vulnerabilities (such as raw SQL injections or circular coupling loops) along with potential impact details.
* **Architect Tab**: Generates SOLID-compliant refactoring blueprints and maps a side-by-side comparative diff (vulnerable legacy vs. decoupled interfaces).
* **Scribe Tab**: Generates system data lineage diagrams, interactive FAQ anchors, and hosts a sandboxed console chat prompt.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
* **Backend**: FastAPI (Python), Uvicorn, Python Native AST & Regex parsing engines
* **AI Swarm Integration**: Gemini API (utilizing `gemini-2.5-flash` model mapping for code evaluations)

---

## 📂 Project Architecture

```
Codebase Archaeologist/
├── src/
│   ├── assets/              # Static vector graphic icons
│   ├── components/
│   │   ├── AuthLayout.tsx       # Auth suite and password metrics
│   │   ├── RepositoryMap.tsx    # Draggable SVG Canvas & Grid Layouts
│   │   └── InsightsTerminal.tsx # Themed tabs, diff views, Q&A terminal
│   ├── data/
│   │   └── mockCodebase.ts      # Type mappings and fallback mock schemas
│   ├── App.tsx              # Page layout shell, desktop controls, header/footer
│   ├── index.css            # Tailwind CSS v4 declarations & variables
│   └── main.tsx             # Application entry point
├── fastapi_ast_parser.py    # FastAPI AST code parser backend
├── package.json             # NPM package scripts & configuration
└── README.md                # Project documentation
```

---

## ⚙️ Getting Started

### Prerequisites
* **Node.js**: `v18.x` or later
* **Python**: `v3.10.x` or later

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rohan-webdeveloper/Codebase-Archaeologist.git
   cd Codebase-Archaeologist
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Install python backend dependencies**:
   ```bash
   pip install fastapi uvicorn pydantic
   ```

### Running the Application

1. **Start the FastAPI AST backend** (runs on port `8000`):
   ```bash
   npm run backend
   ```
   *Alternatively:*
   ```bash
   python fastapi_ast_parser.py
   ```

2. **Start the Vite React frontend** (runs on port `5173`):
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:5173/](http://localhost:5173/)** in your browser.

---

## 💡 How to Use the System

1. **Sign In**: Log in using credentials (or click **Continue with GitHub** for a mock OAuth bypass).
2. **Settings Configurations**: (Optional) In the settings panel, input your **Gemini API Key** to enable AI Swarm analysis (falls back to local static heuristic checkers if no key is provided).
3. **Ingest Repository**: Paste any remote git URL (or local folder directory path) in the address bar and click **Analyze**.
4. **Inspect Node**: Click on file or function nodes in the graph to view properties, inbound connections, and code snippets inside the terminal dashboard.
5. **Decouple Code**: Open the **Architect** tab to analyze file diff comparisons and import decoupled SOLID layouts into your workspace.
