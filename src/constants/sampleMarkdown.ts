export const SHOWCASE_MARKDOWN = `# 🚀 Welcome to MDfy

> **MDfy** is your high-fidelity Markdown & Mermaid document studio. Paste any Markdown text, visualize complex diagrams with interactive pan-and-zoom controls, format mathematical formulas, and export razor-sharp vector PDFs with a single click.

---

## 💡 GitHub Alert Callouts

> [!NOTE]
> MDfy automatically saves your scratchpad to your browser's local storage in real time. Your work stays safe across reloads.

> [!TIP]
> Click and drag the splitter divider to adjust the split pane ratio, or use the toolbar buttons to switch to full-screen preview mode.

> [!IMPORTANT]
> When printing or exporting to PDF, all interactive buttons and editors disappear, leaving only a clean, vector-perfect printable document.

> [!WARNING]
> Mermaid diagram syntax errors are caught gracefully with inline visual feedback without crashing your document.

> [!CAUTION]
> The **Clear** button resets the editor canvas. You can always reload the showcase sample from the toolbar if needed.

---

## 📊 Interactive Mermaid Diagrams

MDfy supports **all Mermaid diagram types**. Hover over any diagram to **Pan & Zoom**, **Expand Fullscreen**, or **Export as SVG / PNG**.

### 1. Architecture Flowchart
\`\`\`mermaid
flowchart TD
    User([👤 User / Client]) -->|HTTPS Request| CDN[⚡ Cloudflare CDN & Edge]
    CDN -->|Static Assets| S3[(🪣 Asset Bucket)]
    CDN -->|API Requests| ALB[⚖️ Application Load Balancer]
    
    subgraph Microservices Cluster
        ALB --> Auth[🔐 Auth Service]
        ALB --> DocService[📄 Document Service]
        ALB --> ExportEngine[🖨️ PDF Vector Engine]
        
        DocService --> DB[(🗄️ PostgreSQL)]
        DocService --> Cache[(⚡ Redis Cache)]
        ExportEngine --> Headless[🖥️ Headless Render Pool]
    end

    Auth -.->|JWT Verification| DocService
    ExportEngine --> S3

    classDef primary fill:#2563eb,stroke:#3b82f6,color:#ffffff,stroke-width:2px;
    classDef storage fill:#059669,stroke:#10b981,color:#ffffff,stroke-width:2px;
    class User,CDN primary;
    class DB,Cache,S3 storage;
\`\`\`

### 2. Enterprise Cloud Architecture (Deeply Nested Print Stress Test)
\`\`\`mermaid
flowchart TB
    subgraph CloudVPC["☁️ Global Multi-Tier Cloud VPC (Production us-east-1 / eu-central-1)"]
        direction TB

        subgraph EdgePerimeter["🛡️ Layer 1: Edge & Perimeter Security Mesh"]
            direction LR
            Users(["👥 Global Clients (Web / Mobile / IoT)"])
            GeoDNS["🌐 Anycast Route 53 DNS & Geo-Routing"]
            EdgeShield["🛡️ Cloud Armor DDoS Shield & WAF"]
            EdgeCDN["⚡ Cloudflare Edge CDN & Edge Compute"]

            Users -->|"HTTPS / TLS 1.3"| GeoDNS
            GeoDNS -->|"Latency Routing"| EdgeShield
            EdgeShield -->|"Scrubbed Traffic"| EdgeCDN
        end

        subgraph IngressDMZ["🚪 Layer 2: Demilitarized Zone & Ingress Gateway"]
            direction TB
            NLB["⚖️ External Network Load Balancer (NLB)"]
            IstioIngress["🚪 Istio Envoy Ingress Gateway"]
            RateLimitEngine["⏱️ Distributed Envoy Rate Limiter (Redis-backed)"]
            WAFInspect["🔍 Deep Packet & JWT Inspection Filter"]

            EdgeCDN -->|"Origin Forward"| NLB
            NLB --> IstioIngress
            IstioIngress <-->|"Verify Quota"| RateLimitEngine
            IstioIngress <-->|"Token Pre-flight"| WAFInspect
        end

        subgraph K8sCluster["☸️ Layer 3: Production Kubernetes Cluster (Zero-Trust Private Mesh)"]
            direction TB

            subgraph ServiceMeshControl["🕹️ Mesh Control Plane & Security"]
                IstioControl["🕸️ Istio Daemon (istiod)"]
                CertManager["🔐 Cert-Manager (Let's Encrypt TLS)"]
                VaultSidecar["🔒 Vault Agent & Mutual TLS Injector"]
            end

            subgraph UserIdentityDomain["👤 User & Identity Domain (Namespace: auth)"]
                UserAPI["📱 User & Organization API"]
                AuthService["🔑 OAuth2 / OIDC Auth Provider"]
                RBACPolicy["🛡️ Open Policy Agent (OPA Engine)"]
                UserAPI <--> AuthService
                AuthService --> RBACPolicy
            end

            subgraph CoreCommerceDomain["🛒 Core Commerce & Orders (Namespace: commerce)"]
                OrderService["📦 Order Lifecycle Service"]
                PaymentGateway["💳 Stripe & Payment Integration"]
                SagaOrchestrator["🔄 Saga Distributed Transaction Manager"]
                BillingWorker["🧾 Invoice Generation Engine"]

                OrderService -->|"Initiate Checkout"| SagaOrchestrator
                SagaOrchestrator -->|"Execute Charge"| PaymentGateway
                SagaOrchestrator -->|"Emit Invoice Job"| BillingWorker
            end

            subgraph ContentCatalogDomain["📚 Content & Catalog Domain (Namespace: catalog)"]
                CatalogAPI["📑 Markdown Document & Catalog Service"]
                SearchIndexer["🔎 Realtime Search Indexer"]
                VectorSearch["🧠 Semantic & Embedding Indexer"]

                CatalogAPI --> SearchIndexer
                CatalogAPI --> VectorSearch
            end

            subgraph RenderWorkerDomain["🖨️ Document Rendering & Export Pipeline (Namespace: compute)"]
                TaskQueue["⚙️ Distributed Celery / BullMQ Queue"]
                VectorRenderPool["🖨️ MDfy Vector PDF Headless Daemon Pool"]
                AssetCompiler["🖼️ SVG / PNG Static Asset Synthesizer"]
                NotificationSvc["📬 Webhook & Email Notification Dispatcher"]

                TaskQueue --> VectorRenderPool
                TaskQueue --> AssetCompiler
                VectorRenderPool --> NotificationSvc
            end

            IstioIngress -->|"mTLS gRPC"| UserAPI
            IstioIngress -->|"mTLS REST"| OrderService
            IstioIngress -->|"mTLS GraphQL"| CatalogAPI
        end

        subgraph EventStreamingFabric["📨 Layer 4: Event Streaming & Async Data Backbone"]
            direction TB
            subgraph KafkaMesh["⚡ Apache Kafka Distributed Cluster (Kraft Mode)"]
                KafkaBroker1["⚡ Kafka Broker 01 (Leader)"]
                KafkaBroker2["⚡ Kafka Broker 02 (Follower)"]
                KafkaBroker3["⚡ Kafka Broker 03 (Follower)"]
                SchemaRegistry["📜 Confluent Schema Registry (Avro / Protobuf)"]
            end

            subgraph DLQTier["📬 Dead Letter Queue & Poison Pill Auditing"]
                DLQStream["⚠️ DLQ Topic & Quarantine Storage"]
                AuditLogger["📋 Compliance & Transaction Audit Sink"]
            end

            OrderService -.->|"Publish: OrderCreated"| KafkaBroker1
            BillingWorker -.->|"Publish: InvoiceGenerated"| KafkaBroker2
            KafkaBroker1 -.->|"Schema Validation"| SchemaRegistry
            KafkaBroker1 -.->|"Async Subscription"| TaskQueue
            KafkaBroker3 -.->|"Failure Redirection"| DLQStream
            DLQStream --> AuditLogger
        end

        subgraph DistributedDataLayer["💾 Layer 5: Polyglot Distributed Data Mesh"]
            direction LR

            subgraph RelationalTier["🗄️ Primary Relational ACID Tier"]
                AuroraMaster[("🐘 Aurora PostgreSQL Master (Read/Write)")]
                AuroraReplica1[("🐘 Aurora Read Replica 01")]
                AuroraReplica2[("🐘 Aurora Read Replica 02")]
                AuroraMaster -.->|"Zero-Lag Replication"| AuroraReplica1
                AuroraMaster -.->|"Zero-Lag Replication"| AuroraReplica2
            end

            subgraph MemoryCacheTier["⚡ In-Memory Distributed Cache"]
                RedisMaster[("🔴 Redis Cluster Master")]
                RedisReplica[("🔴 Redis In-Memory Replica")]
                RedisMaster -.->|"Replication"| RedisReplica
            end

            subgraph SearchAnalyticsTier["📊 Search & Analytical Store"]
                OpenSearchCluster[("🔍 OpenSearch Distributed Cluster")]
                ClickHouseDB[("⚡ ClickHouse Columnar OLAP")]
            end

            subgraph ObjectStorageTier["🪣 Object Storage & Cold Glacier"]
                S3VectorDocs[("🪣 S3 Vector PDF Documents")]
                S3RawAssets[("🪣 S3 User Media & Diagrams")]
                GlacierCold[("🧊 Glacier Deep Archive")]
                S3VectorDocs -->|"Lifecycle Tiering"| GlacierCold
            end

            UserAPI --> AuroraMaster
            OrderService --> AuroraMaster
            CatalogAPI --> RedisMaster
            CatalogAPI --> AuroraReplica1
            SearchIndexer --> OpenSearchCluster
            VectorSearch --> OpenSearchCluster
            BillingWorker --> ClickHouseDB
            VectorRenderPool --> S3VectorDocs
            AssetCompiler --> S3RawAssets
        end

        subgraph ObservabilityMesh["🔭 Layer 6: Unified Telemetry, Tracing & Secrets Management"]
            direction TB
            subgraph TelemetryPipeline["📡 Telemetry Ingestion"]
                OTelDaemon["📡 OpenTelemetry Collector DaemonSet"]
                VectorForwarder["🚚 Vector Log Aggregator"]
            end

            subgraph MonitoringStore["📈 Metrics & APM Stores"]
                PrometheusStore[("📈 Prometheus & Thanos Long-Term Storage")]
                JaegerTracing[("🔍 Jaeger Distributed Tracing")]
                LokiLogs[("📜 Grafana Loki Structured Logs")]
            end

            subgraph VisualDashboards["📊 Unified Operations & Alerting"]
                GrafanaDashboard["📊 Production Grafana Dashboard"]
                PagerDutyAlerts["🚨 PagerDuty & Slack On-Call Alertmanager"]
            end

            K8sCluster -.->|"OTLP Spans & Traces"| OTelDaemon
            K8sCluster -.->|"Container stdout/stderr"| VectorForwarder
            OTelDaemon --> PrometheusStore
            OTelDaemon --> JaegerTracing
            VectorForwarder --> LokiLogs
            PrometheusStore --> GrafanaDashboard
            PrometheusStore --> PagerDutyAlerts
        end
    end

    classDef edge fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff;
    classDef ingress fill:#1e293b,stroke:#64748b,stroke-width:2px,color:#f8fafc;
    classDef control fill:#312e81,stroke:#6366f1,stroke-width:1.5px,color:#ffffff;
    classDef k8s fill:#0f172a,stroke:#0284c7,stroke-width:2px,color:#f8fafc;
    classDef kafka fill:#451a03,stroke:#d97706,stroke-width:2px,color:#ffffff;
    classDef database fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ffffff;
    classDef storage fill:#701a75,stroke:#c026d3,stroke-width:2px,color:#ffffff;
    classDef telemetry fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#ffffff;

    class Users,GeoDNS,EdgeShield,EdgeCDN edge;
    class NLB,IstioIngress,RateLimitEngine,WAFInspect ingress;
    class IstioControl,CertManager,VaultSidecar control;
    class UserAPI,AuthService,RBACPolicy,OrderService,PaymentGateway,SagaOrchestrator,BillingWorker,CatalogAPI,SearchIndexer,VectorSearch,TaskQueue,VectorRenderPool,AssetCompiler,NotificationSvc k8s;
    class KafkaBroker1,KafkaBroker2,KafkaBroker3,SchemaRegistry,DLQStream,AuditLogger kafka;
    class AuroraMaster,AuroraReplica1,AuroraReplica2,RedisMaster,RedisReplica database;
    class OpenSearchCluster,ClickHouseDB,S3VectorDocs,S3RawAssets,GlacierCold storage;
    class OTelDaemon,VectorForwarder,PrometheusStore,JaegerTracing,LokiLogs,GrafanaDashboard,PagerDutyAlerts telemetry;
\`\`\`

### 3. Sequence Diagram (Authentication Flow)
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as 🧑‍💻 Client App
    participant Gateway as 🚪 API Gateway
    participant Auth as 🔐 Auth Provider
    participant Resource as 📦 Secure API

    User->>Gateway: POST /auth/login (credentials)
    Gateway->>Auth: Validate Credentials
    alt Valid Credentials
        Auth-->>Gateway: 200 OK (JWT Access & Refresh Token)
        Gateway-->>User: Set-Cookie (HttpOnly JWT)
    else Invalid Credentials
        Auth-->>Gateway: 401 Unauthorized
        Gateway-->>User: Error: Invalid email or password
    end

    User->>Gateway: GET /api/documents (Bearer Token)
    Gateway->>Gateway: Verify Token Signature & Expiry
    Gateway->>Resource: Forward Authorized Request
    Resource-->>User: 200 OK (Document Payload)
\`\`\`

### 4. Git Branching Graph
\`\`\`mermaid
gitGraph
    commit id: "v1.0.0"
    branch develop
    checkout develop
    commit id: "feat: markdown parser"
    commit id: "feat: katex math support"
    branch feature/mermaid
    checkout feature/mermaid
    commit id: "add: pan-zoom controls"
    commit id: "add: svg export"
    checkout develop
    merge feature/mermaid id: "merge: mermaid suite"
    commit id: "test: gfm callouts"
    checkout main
    merge develop id: "release: v1.1.0" tag: "v1.1.0"
\`\`\`

### 5. Mindmap & Brainstorming
\`\`\`mermaid
mindmap
  root((MDfy))
    ::icon(fa fa-book)
    Core Engine
      React Markdown
      Remark GFM
      KaTeX Math
    Diagram Suite
      Flowcharts & Sequence
      Mindmaps & Timelines
      Pan and Zoom
      SVG & PNG Export
    Export & Output
      Vector Print PDF
      Raw Markdown Copy
      Clean HTML Copy
    Aesthetics
      Obsidian Dark
      Paper Light
      Synchronized Themes
\`\`\`

---

## 🧮 Mathematical Expressions (LaTeX / KaTeX)

MDfy renders both inline and display math expressions using high-speed KaTeX.

Inline equation: The famous Euler's Identity is $e^{i\\pi} + 1 = 0$, uniting fundamental mathematical constants.

The **Normal (Gaussian) Distribution** probability density function:
$$f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\left( -\\frac{(x - \\mu)^2}{2\\sigma^2} \\right)$$

The **Discrete Fourier Transform (DFT)**:
$$X_k = \\sum_{n=0}^{N-1} x_n \\cdot e^{-\\frac{i 2\\pi}{N} k n}, \\quad k = 0, \\dots, N-1$$

---

## 💻 Syntax-Highlighted Code Blocks

\`\`\`typescript
import React, { useState, useEffect } from "react";

interface DocumentStats {
  words: number;
  chars: number;
  readTimeMinutes: number;
}

export function calculateMetrics(content: string): DocumentStats {
  const words = content.trim() ? content.trim().split(/\\s+/).length : 0;
  const chars = content.length;
  const readTimeMinutes = Math.ceil(words / 200);

  return { words, chars, readTimeMinutes };
}
\`\`\`

\`\`\`python
# Vector PDF Generation Pipeline
import asyncio
from dataclasses import dataclass

@dataclass
class ExportOptions:
    page_format: str = "A4"
    print_background: bool = True
    margin_top: str = "15mm"

async def export_document(markdown_src: str, options: ExportOptions) -> bytes:
    print(f"Exporting document in {options.page_format} format...")
    # PDF rendering logic with vector SVG preservation
    return b"%PDF-1.7..."
\`\`\`

---

## 📋 Comprehensive Feature Comparison Table

| Feature Category | Basic Viewer | Generic Editor | **MDfy Studio** |
| :--- | :---: | :---: | :---: |
| **All Mermaid Types** | ❌ Limited | ⚠️ Static only | ✅ **Interactive Suite (Pan/Zoom/Export)** |
| **LaTeX Equations** | ❌ No | ⚠️ Plugin needed | ✅ **Built-in KaTeX Engine** |
| **GitHub Callout Alerts** | ❌ Raw text | ⚠️ Partial | ✅ **5 Distinct Styled Variations** |
| **Vector PDF Output** | ⚠️ Rasterized | ❌ Browser default | ✅ **Clean @media print Vector Engine** |
| **Scratchpad Auto-Save** | ❌ Lost on reload | ⚠️ Cookie-based | ✅ **Instant LocalStorage Persistence** |
| **Theme Synchronization** | ❌ Single theme | ⚠️ Manual switch | ✅ **Obsidian Dark & Paper Light Sync** |

---

## ✅ Interactive Task Lists

- [x] Integrate full GFM pipeline with tables and autolinks
- [x] Implement interactive pan & zoom for Mermaid diagrams
- [x] Configure print stylesheet with zero diagram page-break clipping
- [x] Add GitHub callout alert components
- [x] Enable 1-click SVG & PNG diagram export
- [ ] Star the repository on GitHub 🌟

---

## 📑 Footnotes & References

Markdown syntax supports comprehensive footnote cross-referencing[^1]. You can link technical specifications and citations cleanly throughout your document[^2].

[^1]: Mermaid.js is a Javascript-based diagramming and charting tool that uses Markdown-inspired text definitions.
[^2]: KaTeX is the fastest math typesetting library for the web, developed by Khan Academy.
`;
