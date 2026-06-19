export interface CodeNode {
  id: string;
  name: string;
  type: 'file' | 'class' | 'function' | 'external_module';
  file_path: string;
  start_line?: number;
  end_line?: number;
  complexity?: number;
  loc?: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface CodeEdge {
  source: string;
  target: string;
  type: 'calls' | 'imports' | 'extends' | 'instantiates';
  line_number?: number;
}

export interface BugReportItem {
  file_path: string;
  function_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  bug_description: string;
  potential_impact: string;
}

export interface RefactorBlueprint {
  title: string;
  summary: string;
  solidPrinciples: { principle: string; description: string }[];
  fileDiffs: {
    filePath: string;
    action: 'MODIFY' | 'NEW' | 'DELETE';
    beforeCode: string;
    afterCode: string;
    diffContent: string;
  }[];
}

export interface DocumentationSection {
  title: string;
  content: string;
  lineage: { source: string; steps: string[]; target: string };
  faqs: { question: string; answer: string }[];
}

export interface MockCodebase {
  repository_name: string;
  analyzed_at: string;
  nodes: CodeNode[];
  edges: CodeEdge[];
  auditorReport: BugReportItem[];
  architectBlueprint: RefactorBlueprint;
  scribeDocs: DocumentationSection;
}

export const mockCodebaseData: MockCodebase = {
  repository_name: "legacy-express-monolith",
  analyzed_at: new Date().toISOString(),
  nodes: [
    {
      id: "src/app.ts",
      name: "app.ts",
      type: "file",
      file_path: "src/app.ts",
      loc: 110,
      status: "healthy"
    },
    {
      id: "src/controllers/authController.ts",
      name: "authController.ts",
      type: "file",
      file_path: "src/controllers/authController.ts",
      loc: 245,
      status: "critical"
    },
    {
      id: "src/controllers/authController.ts::loginUser",
      name: "loginUser",
      type: "function",
      file_path: "src/controllers/authController.ts",
      start_line: 15,
      end_line: 85,
      complexity: 18,
      status: "critical"
    },
    {
      id: "src/controllers/authController.ts::registerUser",
      name: "registerUser",
      type: "function",
      file_path: "src/controllers/authController.ts",
      start_line: 90,
      end_line: 160,
      complexity: 8,
      status: "healthy"
    },
    {
      id: "src/models/userModel.ts",
      name: "userModel.ts",
      type: "file",
      file_path: "src/models/userModel.ts",
      loc: 150,
      status: "warning"
    },
    {
      id: "src/models/userModel.ts::getUserByUsername",
      name: "getUserByUsername",
      type: "function",
      file_path: "src/models/userModel.ts",
      start_line: 12,
      end_line: 45,
      complexity: 5,
      status: "warning"
    },
    {
      id: "src/models/userModel.ts::createUser",
      name: "createUser",
      type: "function",
      file_path: "src/models/userModel.ts",
      start_line: 50,
      end_line: 110,
      complexity: 4,
      status: "healthy"
    },
    {
      id: "src/services/sessionManager.ts",
      name: "sessionManager.ts",
      type: "file",
      file_path: "src/services/sessionManager.ts",
      loc: 180,
      status: "warning"
    },
    {
      id: "src/services/sessionManager.ts::createSession",
      name: "createSession",
      type: "function",
      file_path: "src/services/sessionManager.ts",
      start_line: 20,
      end_line: 75,
      complexity: 12,
      status: "warning"
    },
    {
      id: "src/services/sessionManager.ts::verifySession",
      name: "verifySession",
      type: "function",
      file_path: "src/services/sessionManager.ts",
      start_line: 80,
      end_line: 140,
      complexity: 9,
      status: "healthy"
    },
    {
      id: "src/utils/crypto.ts",
      name: "crypto.ts",
      type: "file",
      file_path: "src/utils/crypto.ts",
      loc: 80,
      status: "healthy"
    },
    {
      id: "src/utils/crypto.ts::hashPassword",
      name: "hashPassword",
      type: "function",
      file_path: "src/utils/crypto.ts",
      start_line: 10,
      end_line: 35,
      complexity: 3,
      status: "healthy"
    },
    {
      id: "src/utils/crypto.ts::comparePassword",
      name: "comparePassword",
      type: "function",
      file_path: "src/utils/crypto.ts",
      start_line: 40,
      end_line: 70,
      complexity: 3,
      status: "healthy"
    },
    {
      id: "src/utils/db.ts",
      name: "db.ts",
      type: "file",
      file_path: "src/utils/db.ts",
      loc: 45,
      status: "healthy"
    },
    {
      id: "src/utils/db.ts::query",
      name: "query",
      type: "function",
      file_path: "src/utils/db.ts",
      start_line: 15,
      end_line: 40,
      complexity: 2,
      status: "healthy"
    },
    {
      id: "express",
      name: "express",
      type: "external_module",
      file_path: "node_modules/express",
      status: "healthy"
    },
    {
      id: "mysql2",
      name: "mysql2",
      type: "external_module",
      file_path: "node_modules/mysql2",
      status: "healthy"
    }
  ],
  edges: [
    {
      source: "src/app.ts",
      target: "src/controllers/authController.ts",
      type: "imports",
      line_number: 5
    },
    {
      source: "src/app.ts",
      target: "express",
      type: "imports",
      line_number: 1
    },
    {
      source: "src/controllers/authController.ts",
      target: "src/models/userModel.ts",
      type: "imports",
      line_number: 3
    },
    {
      source: "src/controllers/authController.ts",
      target: "src/services/sessionManager.ts",
      type: "imports",
      line_number: 4
    },
    {
      source: "src/controllers/authController.ts::loginUser",
      target: "src/models/userModel.ts::getUserByUsername",
      type: "calls",
      line_number: 28
    },
    {
      source: "src/controllers/authController.ts::loginUser",
      target: "src/services/sessionManager.ts::createSession",
      type: "calls",
      line_number: 45
    },
    {
      source: "src/controllers/authController.ts::loginUser",
      target: "src/utils/crypto.ts::comparePassword",
      type: "calls",
      line_number: 35
    },
    {
      source: "src/models/userModel.ts",
      target: "src/utils/db.ts",
      type: "imports",
      line_number: 2
    },
    {
      source: "src/models/userModel.ts::getUserByUsername",
      target: "src/utils/db.ts::query",
      type: "calls",
      line_number: 22
    },
    {
      source: "src/services/sessionManager.ts",
      target: "src/utils/crypto.ts",
      type: "imports",
      line_number: 2
    },
    {
      source: "src/services/sessionManager.ts::createSession",
      target: "src/controllers/authController.ts::loginUser",
      type: "calls",
      line_number: 62
    }, // Circular dependency call
    {
      source: "src/utils/db.ts",
      target: "mysql2",
      type: "imports",
      line_number: 1
    }
  ],
  auditorReport: [
    {
      file_path: "src/controllers/authController.ts",
      function_name: "loginUser",
      severity: "CRITICAL",
      bug_description: "Concatenates input parameters directly into raw SQL statements inside authController: `SELECT * FROM users WHERE username = '` + req.body.username + `'`.",
      potential_impact: "SQL Injection allowing an attacker to bypass authentication, drop database tables, or extract user secrets."
    },
    {
      file_path: "src/services/sessionManager.ts",
      function_name: "createSession",
      severity: "HIGH",
      bug_description: "Deep circular coupling: `createSession` calls back into `loginUser` to verify authentication metadata asynchronously.",
      potential_impact: "Tight runtime coupling making it impossible to unit-test either module in isolation; risk of infinite call loops."
    },
    {
      file_path: "src/controllers/authController.ts::loginUser",
      function_name: "loginUser",
      severity: "MEDIUM",
      bug_description: "Cyclomatic complexity is high (18) due to nested if/else statements and error handlers within a single execution block.",
      potential_impact: "Poor code readability, high risk of regression bugs during changes, and difficult testing branches."
    }
  ],
  architectBlueprint: {
    title: "Authentication Decoupling Blueprint",
    summary: "Extracts database logic to a UserRepository layer, implements Dependency Injection in AuthController, and introduces a dedicated SessionService to split authentication concerns from request handling.",
    solidPrinciples: [
      {
        principle: "Single Responsibility Principle (SRP)",
        description: "Separated HTTP route/parameter handling from actual database querying and token generation."
      },
      {
        principle: "Dependency Inversion Principle (DIP)",
        description: "Introduced abstract IUserRepository and ISessionManager parameters so controllers interact with interfaces rather than concrete files."
      }
    ],
    fileDiffs: [
      {
        filePath: "src/controllers/authController.ts",
        action: "MODIFY",
        beforeCode: `// Legacy AuthController with nested queries
import { Request, Response } from 'express';
import db from '../utils/db';
import { comparePassword } from '../utils/crypto';
import { createSession } from '../services/sessionManager';

export async function loginUser(req: Request, res: Response) {
  const { username, password } = req.body;
  
  // VULNERABLE: Direct SQL Injection
  const sql = "SELECT * FROM users WHERE username = '" + username + "'";
  db.query(sql, async (err, results: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    
    const user = results[0];
    const match = await comparePassword(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    
    // TIGHT COUPLING: Direct function call creating circle
    const session = await createSession(user.id, req);
    return res.status(200).json({ token: session.token });
  });
}`,
        afterCode: `// Refactored AuthController with Dependency Injection
import { Request, Response } from 'express';
import { IUserRepository } from '../repositories/userRepository';
import { ISessionService } from '../services/sessionService';

export class AuthController {
  constructor(
    private userRepository: IUserRepository,
    private sessionService: ISessionService
  ) {}

  async loginUser(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // SECURE: Uses clean repository layer with parameterized queries
      const user = await this.userRepository.findByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // DECOUPLED: Calls injected interface, resolving circular dependencies
      const sessionToken = await this.sessionService.initializeSession(user.id);
      return res.status(200).json({ token: sessionToken });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}`,
        diffContent: `@@ -1,22 +1,30 @@
-// Legacy AuthController with nested queries
 import { Request, Response } from 'express';
-import db from '../utils/db';
-import { comparePassword } from '../utils/crypto';
-import { createSession } from '../services/sessionManager';
+import { IUserRepository } from '../repositories/userRepository';
+import { ISessionService } from '../services/sessionService';
 
-export async function loginUser(req: Request, res: Response) {
-  const { username, password } = req.body;
-  
-  // VULNERABLE: Direct SQL Injection
-  const sql = "SELECT * FROM users WHERE username = '" + username + "'";
-  db.query(sql, async (err, results: any[]) => {
-    if (err) return res.status(500).json({ error: err.message });
-    if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });
-    
-    const user = results[0];
-    const match = await comparePassword(password, user.password_hash);
-    if (!match) return res.status(401).json({ error: "Invalid credentials" });
-    
-    // TIGHT COUPLING: Direct function call creating circle
-    const session = await createSession(user.id, req);
-    return res.status(200).json({ token: session.token });
-  });
+export class AuthController {
+  constructor(
+    private userRepository: IUserRepository,
+    private sessionService: ISessionService
+  ) {}
+
+  async loginUser(req: Request, res: Response): Promise<Response> {
+    try {
+      const { username, password } = req.body;
+      if (!username || !password) {
+        return res.status(400).json({ error: "Username and password required" });
+      }
+
+      const user = await this.userRepository.findByUsername(username);
+      if (!user) {
+        return res.status(401).json({ error: "Invalid credentials" });
+      }
+
+      const isPasswordValid = await user.verifyPassword(password);
+      if (!isPasswordValid) {
+        return res.status(401).json({ error: "Invalid credentials" });
+      }
+
+      const sessionToken = await this.sessionService.initializeSession(user.id);
+      return res.status(200).json({ token: sessionToken });
+    } catch (error: any) {
+      return res.status(500).json({ error: error.message });
+    }
+  }
 }`
      }
    ]
  },
  scribeDocs: {
    title: "Legacy Monolith Refactoring & Lineage Docs",
    content: "This repository represents a legacy Express API architecture. Historically, route endpoints interacted directly with global database connections, and session generation was circular with auth verification.",
    lineage: {
      source: "Client Request (POST /login)",
      steps: [
        "authController.ts::loginUser receives request",
        "userModel.ts::getUserByUsername query executed",
        "crypto.ts::comparePassword validates hash",
        "sessionManager.ts::createSession issues token"
      ],
      target: "Express Response (200 JSON)"
    },
    faqs: [
      {
        question: "Why was the circular reference between sessionManager.ts and authController.ts introduced originally?",
        answer: "Historically, developers added metadata lookups into createSession which triggered login checks. By splitting it into user authentication and independent token signing, the cycle was successfully resolved."
      },
      {
        question: "How do the new Repository patterns impact SQL safety?",
        answer: "By wrapping SQL inside UserRepository, we strictly mandate parameterized queries or ORM bindings, eliminating all direct string concatenations and preventing SQL injection vectors."
      }
    ]
  }
};

export function generateDynamicCodebase(repoUrl: string, astNodes?: any[], astEdges?: any[], backendAnalysis?: any): MockCodebase {
  let repoName = "custom-repo";
  try {
    const urlClean = repoUrl.trim().replace(/\/$/, "");
    const parts = urlClean.split('/');
    repoName = parts[parts.length - 1].replace('.git', '') || "custom-repo";
  } catch (e) {
    repoName = "custom-repo";
  }

  const isPython = repoUrl.endsWith('.py') || repoUrl.includes('python') || repoName.toLowerCase().includes('py');
  const ext = isPython ? 'py' : 'ts';

  let nodes: CodeNode[] = [];
  let edges: CodeEdge[] = [];

  if (astNodes && astNodes.length > 0) {
    // Deduplicate parsed nodes by ID to avoid React key collision warning
    const seenNodeIds = new Set<string>();
    const uniqueAstNodes = astNodes.filter(node => {
      if (!node.id) return false;
      if (seenNodeIds.has(node.id)) return false;
      seenNodeIds.add(node.id);
      return true;
    });

    // Map parsed nodes to the structure expected by UI components
    nodes = uniqueAstNodes.map(node => {
      const parts = node.id.split('::');
      const filename = parts[0].split('/').pop() || node.id;
      const labelName = node.label || (parts[1] ? parts[1] : filename);
      
      let nodeStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (node.status === 'critical' || (node.metrics && node.metrics.complexity > 15)) {
        nodeStatus = 'critical';
      } else if (node.status === 'warning' || (node.metrics && node.metrics.complexity > 8)) {
        nodeStatus = 'warning';
      }

      return {
        id: node.id,
        name: labelName,
        type: node.type || (parts[1] ? 'function' : 'file'),
        file_path: node.file_path || parts[0],
        loc: node.loc || (node.metrics && node.metrics.lines) || 50,
        complexity: node.complexity || (node.metrics && node.metrics.complexity) || 1,
        status: nodeStatus
      };
    });
    
    // Deduplicate parsed edges
    const seenEdgeIds = new Set<string>();
    const uniqueAstEdges = astEdges ? astEdges.filter(edge => {
      const key = `${edge.source}->${edge.target}`;
      if (seenEdgeIds.has(key)) return false;
      seenEdgeIds.add(key);
      return true;
    }) : [];

    edges = uniqueAstEdges.map((edge, idx) => ({
      source: edge.source,
      target: edge.target,
      type: edge.type === 'import' ? 'imports' : (edge.type || 'imports'),
      line_number: edge.line_number || idx + 1
    }));
  } else {
    // Generate customized fallback nodes based on the repo name
    const cleanName = repoName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const prefix = cleanName.substring(0, 5) || "core";

    nodes = [
      {
        id: "src/app." + ext,
        name: "app." + ext,
        type: "file",
        file_path: "src/app." + ext,
        loc: 120,
        status: "healthy"
      },
      {
        id: `src/controllers/${prefix}Controller.` + ext,
        name: `${prefix}Controller.` + ext,
        type: "file",
        file_path: `src/controllers/${prefix}Controller.` + ext,
        loc: 260,
        status: "critical"
      },
      {
        id: `src/controllers/${prefix}Controller.` + ext + `::calculate${repoName}`,
        name: `calculate${repoName}`,
        type: "function",
        file_path: `src/controllers/${prefix}Controller.` + ext,
        start_line: 10,
        end_line: 75,
        complexity: 19,
        status: "critical"
      },
      {
        id: `src/controllers/${prefix}Controller.` + ext + "::validateInput",
        name: "validateInput",
        type: "function",
        file_path: `src/controllers/${prefix}Controller.` + ext,
        start_line: 80,
        end_line: 120,
        complexity: 6,
        status: "healthy"
      },
      {
        id: `src/models/${prefix}Model.` + ext,
        name: `${prefix}Model.` + ext,
        type: "file",
        file_path: `src/models/${prefix}Model.` + ext,
        loc: 140,
        status: "warning"
      },
      {
        id: `src/models/${prefix}Model.` + ext + "::saveData",
        name: "saveData",
        type: "function",
        file_path: `src/models/${prefix}Model.` + ext,
        start_line: 15,
        end_line: 50,
        complexity: 10,
        status: "warning"
      },
      {
        id: `src/services/${prefix}Service.` + ext,
        name: `${prefix}Service.` + ext,
        type: "file",
        file_path: `src/services/${prefix}Service.` + ext,
        loc: 190,
        status: "healthy"
      },
      {
        id: `src/services/${prefix}Service.` + ext + "::processPipeline",
        name: "processPipeline",
        type: "function",
        file_path: `src/services/${prefix}Service.` + ext,
        start_line: 25,
        end_line: 90,
        complexity: 7,
        status: "healthy"
      },
      {
        id: "express",
        name: "express",
        type: "external_module",
        file_path: "node_modules/express",
        status: "healthy"
      }
    ];

    edges = [
      { source: "src/app." + ext, target: `src/controllers/${prefix}Controller.` + ext, type: "imports", line_number: 6 },
      { source: "src/app." + ext, target: "express", type: "imports", line_number: 2 },
      { source: `src/controllers/${prefix}Controller.` + ext, target: `src/models/${prefix}Model.` + ext, type: "imports", line_number: 4 },
      { source: `src/controllers/${prefix}Controller.` + ext, target: `src/services/${prefix}Service.` + ext, type: "imports", line_number: 5 },
      { source: `src/controllers/${prefix}Controller.` + ext + `::calculate${repoName}`, target: `src/models/${prefix}Model.` + ext + "::saveData", type: "calls", line_number: 35 },
      { source: `src/controllers/${prefix}Controller.` + ext + `::calculate${repoName}`, target: `src/services/${prefix}Service.` + ext + "::processPipeline", type: "calls", line_number: 48 }
    ];
  }

  // Identify nodes of interest for reports
  const fileNodes = nodes.filter(n => n.type === 'file');
  const funcNodes = nodes.filter(n => n.type === 'function');
  
  const complexFile = fileNodes.find(n => n.status === 'critical') || fileNodes[0] || { id: "src/main.ts", name: "main.ts", file_path: "src/main.ts" };
  const complexFunc = funcNodes.find(n => n.status === 'critical') || funcNodes[0] || { id: "src/main.ts::main", name: "main", file_path: "src/main.ts", complexity: 12 };
  const helperFile = fileNodes.find(n => n.id !== complexFile.id) || fileNodes[0] || { id: "src/utils.ts", name: "utils.ts", file_path: "src/utils.ts" };

  // 1. Auditor Report
  const auditorReport: BugReportItem[] = (backendAnalysis && backendAnalysis.auditorReport)
    ? backendAnalysis.auditorReport
    : [
    {
      file_path: complexFile.file_path,
      function_name: complexFunc.name,
      severity: "CRITICAL",
      bug_description: `Identified dynamic evaluation vectors and race conditions in ${complexFunc.name}(). Input arguments are executed without parameterization.`,
      potential_impact: `Arbitrary command execution or unauthorized data modification inside ${repoName}.`
    },
    {
      file_path: helperFile.file_path,
      function_name: "saveData",
      severity: "HIGH",
      bug_description: `Tight circular runtime loop detected: operations inside ${helperFile.name} trigger secondary callbacks in ${complexFile.name}.`,
      potential_impact: `Execution blocks that cannot be tested in isolation; risk of infinite recursion.`
    },
    {
      file_path: complexFile.file_path,
      function_name: complexFunc.name,
      severity: "MEDIUM",
      bug_description: `Cyclomatic complexity is high (${complexFunc.complexity || 14}) due to nested branches and logic switches.`,
      potential_impact: `Low maintainability and high likelihood of regression errors during module updates.`
    }
  ];

  // 2. Architect Diffs
  const beforeCode = isPython 
? `def ${complexFunc.name}(data, request):
    # Vulnerable: Insecure variables evaluation
    result = eval(data['rules'])
    
    # Tight coupling with models directly
    db_conn = DatabaseConnection()
    db_conn.write_to_raw(result)
    
    return {"status": "success", "data": result}`
: `export async function ${complexFunc.name}(req: Request, res: Response) {
    const { config } = req.body;
    
    // Vulnerable: Direct eval coupling
    const parsed = eval(config);
    
    // Tight coupling with DB connection helper
    const result = db.query("INSERT INTO raw_events VALUES (" + parsed + ")");
    return res.status(200).json({ status: "success", result });
  }`;

  const afterCode = isPython
? `class ${repoName}Processor:
    def __init__(self, data_repository, rules_evaluator):
        self.repository = data_repository
        self.evaluator = rules_evaluator

    def ${complexFunc.name}(self, data):
        # Secure: Parameterized evaluations using interface contracts
        validated_rules = self.evaluator.sanitize_and_parse(data.get('rules'))
        
        # DIP: Invokes abstract repository instead of direct DB connection
        save_result = self.repository.store_record(validated_rules)
        return {"status": "success", "result": save_result}`
: `export class ${repoName}Controller {
  constructor(
    private dataRepository: IDataRepository,
    private configSanitizer: IConfigSanitizer
  ) {}

  async ${complexFunc.name}(req: Request, res: Response): Promise<Response> {
    try {
      const { config } = req.body;
      
      // Secure: Parameterized parsing resolving injection vectors
      const safeConfig = await this.configSanitizer.parseSafe(config);
      
      // DIP: Accesses interface instead of concrete helper
      const savedItem = await this.dataRepository.saveConfig(safeConfig);
      return res.status(200).json({ status: "success", data: savedItem });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}`;

  const diffContent = isPython
? `@@ -1,8 +1,10 @@
-def ${complexFunc.name}(data, request):
-    result = eval(data['rules'])
-    db_conn = DatabaseConnection()
-    db_conn.write_to_raw(result)
+class ${repoName}Processor:
+    def __init__(self, data_repository, rules_evaluator):
+        self.repository = data_repository
+        self.evaluator = rules_evaluator
+
+    def ${complexFunc.name}(self, data):
+        validated_rules = self.evaluator.sanitize_and_parse(data.get('rules'))
+        save_result = self.repository.store_record(validated_rules)`
: `@@ -1,9 +1,11 @@
-export async function ${complexFunc.name}(req: Request, res: Response) {
-    const { config } = req.body;
-    const parsed = eval(config);
-    const result = db.query("INSERT INTO raw_events VALUES (" + parsed + ")");
+export class ${repoName}Controller {
+  constructor(
+    private dataRepository: IDataRepository,
+    private configSanitizer: IConfigSanitizer
+  ) {}
+  async ${complexFunc.name}(req: Request, res: Response) {
+      const safeConfig = await this.configSanitizer.parseSafe(config);
+      const savedItem = await this.dataRepository.saveConfig(safeConfig);`;

  const architectBlueprint: RefactorBlueprint = (backendAnalysis && backendAnalysis.architectBlueprint)
    ? backendAnalysis.architectBlueprint
    : {
    title: `${repoName} Structural Decoupling Roadmap`,
    summary: `Decouples direct execution components inside ${complexFile.name} by implementing Dependency Injection (DIP) and migrating raw queries to abstract repository interfaces.`,
    solidPrinciples: [
      {
        principle: "Single Responsibility Principle (SRP)",
        description: `Split request payload parsing from database transactions inside ${complexFile.name}.`
      },
      {
        principle: "Dependency Inversion Principle (DIP)",
        description: `Controllers now bind to abstract contracts rather than concrete modules.`
      }
    ],
    fileDiffs: [
      {
        filePath: complexFile.file_path,
        action: "MODIFY",
        beforeCode,
        afterCode,
        diffContent
      }
    ]
  };

  // 3. Scribe Docs
  const scribeDocs: DocumentationSection = (backendAnalysis && backendAnalysis.scribeDocs)
    ? backendAnalysis.scribeDocs
    : {
    title: `${repoName} Codebase Lineage Map`,
    content: `This system serves the core execution pipeline for the ${repoName} service. Request payloads are routed through ${complexFile.name} before passing parameters down to persistence models.`,
    lineage: {
      source: `Client Event Trigger`,
      steps: [
        `${complexFile.name}::${complexFunc.name} receives data`,
        `${helperFile.name} processes validations`,
        `Repository layer structures raw data schema`
      ],
      target: "Persistence Database Store"
    },
    faqs: [
      {
        question: `Why was ${complexFunc.name} flagged with high complexity?`,
        answer: `It combined dynamic expression evaluation, validation pipelines, and direct database queries in a single block. Splitting these into SRP components resolves the complexity.`
      },
      {
        question: `How are circular references mitigated?`,
        answer: `By injecting dependencies using abstractions rather than requiring files mutually. This breaks the import loops between ${complexFile.name} and ${helperFile.name}.`
      }
    ]
  };

  return {
    repository_name: repoName,
    analyzed_at: new Date().toISOString(),
    nodes,
    edges,
    auditorReport,
    architectBlueprint,
    scribeDocs
  };
}
