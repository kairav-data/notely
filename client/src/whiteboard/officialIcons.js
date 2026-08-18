// Comprehensive Professional SVG Vector Icon Suite for AWS Architecture, Azure, GCP, Databricks, Data Engineering, Cloud, DevOps, & Software Systems

function makeSvgDataUri(svgContent) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

const AWS_ORANGE = "#FF9900";
const AWS_S3_GREEN = "#7AA116";
const AWS_RED = "#DD344C";
const AWS_BLUE = "#232F3E";
const AWS_PURPLE = "#8C4FFF";
const AWS_TEAL = "#00A4A6";

const AZURE_BLUE = "#0078D4";
const GCP_BLUE = "#4285F4";
const DATABRICKS_RED = "#FF3621";

// 1. AWS Architecture Official SVG Icons (20 Services)
const AWS_SERVICES = [
  {
    id: "aws-ec2",
    name: "AWS EC2",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_ORANGE}"/>
      <path d="M22 28h36v24H22z" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M14 34h8M14 46h8M58 34h8M58 46h8M34 20v8M46 20v8M34 52v8M46 52v8" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="34" cy="40" r="3" fill="#fff"/>
      <circle cx="46" cy="40" r="3" fill="#fff"/>
    </svg>`,
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_S3_GREEN}"/>
      <path d="M20 28c0-5 40-5 40 0v24c0 5-40 5-40 0V28z" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M20 28c0 5 40 5 40 0M20 40c0 5 40 5 40 0" stroke="#fff" stroke-width="4" fill="none"/>
    </svg>`,
  },
  {
    id: "aws-lambda",
    name: "AWS Lambda",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_ORANGE}"/>
      <path d="M22 58l14-36h8l14 36h-9l-9-24-9 24h-9z" fill="#fff"/>
    </svg>`,
  },
  {
    id: "aws-dynamodb",
    name: "AWS DynamoDB",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_BLUE}"/>
      <path d="M20 24c0-4 40-4 40 0v32c0 4-40 4-40 0V24z" fill="none" stroke="${AWS_ORANGE}" stroke-width="4"/>
      <path d="M20 24c0 4 40 4 40 0M20 35c0 4 40 4 40 0M20 46c0 4 40 4 40 0" stroke="${AWS_ORANGE}" stroke-width="3" fill="none"/>
    </svg>`,
  },
  {
    id: "aws-rds",
    name: "AWS RDS",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_BLUE}"/>
      <ellipse cx="40" cy="24" rx="20" ry="8" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M20 24v32c0 4.4 9 8 20 8s20-3.6 20-8V24" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M20 40c0 4.4 9 8 20 8s20-3.6 20-8" fill="none" stroke="#fff" stroke-width="4"/>
    </svg>`,
  },
  {
    id: "aws-vpc",
    name: "AWS VPC",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_PURPLE}"/>
      <rect x="20" y="20" width="40" height="40" rx="6" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="6 4"/>
      <circle cx="40" cy="40" r="6" fill="#fff"/>
    </svg>`,
  },
  {
    id: "aws-cloudfront",
    name: "AWS CloudFront",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_PURPLE}"/>
      <circle cx="40" cy="40" r="22" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M18 40h44M40 18a30 30 0 0 1 0 44M40 18a30 30 0 0 0 0 44" stroke="#fff" stroke-width="3" fill="none"/>
    </svg>`,
  },
  {
    id: "aws-api-gateway",
    name: "AWS API Gateway",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_RED}"/>
      <path d="M22 24h36M22 40h36M22 56h36" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <circle cx="30" cy="24" r="5" fill="${AWS_ORANGE}"/>
      <circle cx="50" cy="40" r="5" fill="${AWS_ORANGE}"/>
      <circle cx="38" cy="56" r="5" fill="${AWS_ORANGE}"/>
    </svg>`,
  },
  {
    id: "aws-sqs",
    name: "AWS SQS",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_PURPLE}"/>
      <rect x="18" y="28" width="44" height="24" rx="4" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M28 28v24M38 28v24M48 28v24" stroke="#fff" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "aws-sns",
    name: "AWS SNS",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_RED}"/>
      <path d="M40 20a16 16 0 0 0-16 16c0 14-6 18-6 18h44s-6-4-6-18a16 16 0 0 0-16-16z" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M34 58a6 6 0 0 0 12 0" stroke="#fff" stroke-width="4" fill="none"/>
    </svg>`,
  },
  {
    id: "aws-kinesis",
    name: "AWS Kinesis",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_PURPLE}"/>
      <path d="M20 25c12 0 12 30 24 30s12-30 24-30" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M20 35c12 0 12 20 24 20s12-20 24-20" stroke="${AWS_ORANGE}" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: "aws-lakeformation",
    name: "AWS Lake Formation",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_TEAL}"/>
      <ellipse cx="40" cy="28" rx="22" ry="10" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M18 28v24c0 5.5 10 10 22 10s22-4.5 22-10V28" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M18 40c0 5.5 10 10 22 10s22-4.5 22-10" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M32 44l8-8 8 8" stroke="${AWS_ORANGE}" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: "aws-datalake",
    name: "AWS Data Lake",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_BLUE}"/>
      <path d="M18 24c0-4 44-4 44 0v32c0 4-44 4-44 0V24z" fill="none" stroke="${AWS_TEAL}" stroke-width="4"/>
      <path d="M18 24c0 4 44 4 44 0M18 36c0 4 44 4 44 0M18 48c0 4 44 4 44 0" stroke="${AWS_TEAL}" stroke-width="3" fill="none"/>
    </svg>`,
  },
  {
    id: "aws-redshift",
    name: "AWS Redshift",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_BLUE}"/>
      <rect x="20" y="20" width="40" height="40" rx="6" fill="none" stroke="${AWS_RED}" stroke-width="4"/>
      <path d="M20 33h40M20 47h40M33 20v40M47 20v40" stroke="${AWS_RED}" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "aws-glue",
    name: "AWS Glue (ETL)",
    category: "AWS Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AWS_PURPLE}"/>
      <circle cx="28" cy="40" r="10" fill="none" stroke="#fff" stroke-width="4"/>
      <circle cx="52" cy="40" r="10" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M38 40h4" stroke="${AWS_ORANGE}" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
  },
];

// 2. Microsoft Azure Data & Cloud Icons
const AZURE_SERVICES = [
  {
    id: "azure-sql",
    name: "Azure SQL Database",
    category: "Azure Cloud",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AZURE_BLUE}"/>
      <ellipse cx="40" cy="24" rx="22" ry="9" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M18 24v32c0 5 10 9 22 9s22-4 22-9V24" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M18 40c0 5 10 9 22 9s22-4 22-9" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M30 40l20-16" stroke="#fff" stroke-width="3" opacity="0.6"/>
    </svg>`,
  },
  {
    id: "azure-synapse",
    name: "Azure Synapse Analytics",
    category: "Azure Cloud",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AZURE_BLUE}"/>
      <circle cx="40" cy="40" r="22" fill="none" stroke="#fff" stroke-width="4"/>
      <polygon points="40,24 52,48 28,48" fill="#fff"/>
      <circle cx="40" cy="40" r="5" fill="${AZURE_BLUE}"/>
    </svg>`,
  },
  {
    id: "azure-data-factory",
    name: "Azure Data Factory (ADF)",
    category: "Azure Cloud",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AZURE_BLUE}"/>
      <rect x="20" y="24" width="18" height="18" rx="4" fill="none" stroke="#fff" stroke-width="4"/>
      <rect x="42" y="38" width="18" height="18" rx="4" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M38 33h13v5" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: "azure-cosmosdb",
    name: "Azure Cosmos DB",
    category: "Azure Cloud",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AZURE_BLUE}"/>
      <circle cx="40" cy="40" r="22" fill="none" stroke="#fff" stroke-width="3"/>
      <ellipse cx="40" cy="40" rx="22" ry="9" fill="none" stroke="#fff" stroke-width="3" transform="rotate(-30 40 40)"/>
      <ellipse cx="40" cy="40" rx="22" ry="9" fill="none" stroke="#fff" stroke-width="3" transform="rotate(30 40 40)"/>
    </svg>`,
  },
  {
    id: "azure-datalake",
    name: "Azure Data Lake Storage",
    category: "Azure Cloud",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AZURE_BLUE}"/>
      <path d="M22 28c0-5 36-5 36 0v24c0 5-36 5-36 0V28z" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M22 28c0 5 36 5 36 0M22 40c0 5 36 5 36 0" stroke="#fff" stroke-width="3" fill="none"/>
      <path d="M34 44l6-6 6 6" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: "azure-eventhubs",
    name: "Azure Event Hubs",
    category: "Azure Cloud",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${AZURE_BLUE}"/>
      <circle cx="40" cy="40" r="22" fill="none" stroke="#fff" stroke-width="4"/>
      <circle cx="40" cy="24" r="5" fill="#fff"/>
      <circle cx="26" cy="48" r="5" fill="#fff"/>
      <circle cx="54" cy="48" r="5" fill="#fff"/>
      <path d="M40 29v11M31 44l9-4M49 44l-9-4" stroke="#fff" stroke-width="3"/>
    </svg>`,
  },
];

// 3. Google Cloud Platform (GCP) Data & Architecture Icons
const GCP_SERVICES = [
  {
    id: "gcp-bigquery",
    name: "GCP BigQuery",
    category: "Google Cloud (GCP)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${GCP_BLUE}"/>
      <ellipse cx="36" cy="36" rx="18" ry="18" fill="none" stroke="#fff" stroke-width="5"/>
      <path d="M49 49l13 13" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <path d="M26 36h20M36 26v20" stroke="#fff" stroke-width="4"/>
    </svg>`,
  },
  {
    id: "gcp-cloud-storage",
    name: "GCP Cloud Storage (GCS)",
    category: "Google Cloud (GCP)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${GCP_BLUE}"/>
      <path d="M26 48a14 14 0 0 1 2-27.5 18 18 0 0 1 34 5.5 12 12 0 0 1-2 22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <path d="M24 54h32" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: "gcp-cloud-sql",
    name: "GCP Cloud SQL",
    category: "Google Cloud (GCP)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${GCP_BLUE}"/>
      <ellipse cx="40" cy="24" rx="20" ry="8" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M20 24v32c0 4.4 9 8 20 8s20-3.6 20-8V24" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M20 40c0 4.4 9 8 20 8s20-3.6 20-8" fill="none" stroke="#fff" stroke-width="4"/>
      <circle cx="40" cy="40" r="4" fill="#EA4335"/>
    </svg>`,
  },
  {
    id: "gcp-pubsub",
    name: "GCP Pub/Sub Messaging",
    category: "Google Cloud (GCP)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${GCP_BLUE}"/>
      <circle cx="40" cy="24" r="6" fill="#fff"/>
      <circle cx="24" cy="52" r="6" fill="#fff"/>
      <circle cx="56" cy="52" r="6" fill="#fff"/>
      <path d="M40 30l-16 22M40 30l16 22M24 52h32" stroke="#fff" stroke-width="4"/>
    </svg>`,
  },
  {
    id: "gcp-dataflow",
    name: "GCP Dataflow (Beam)",
    category: "Google Cloud (GCP)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${GCP_BLUE}"/>
      <path d="M18 40h44" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <path d="M44 26l18 14-18 14" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,
  },
  {
    id: "gcp-bigtable",
    name: "GCP Cloud Bigtable",
    category: "Google Cloud (GCP)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${GCP_BLUE}"/>
      <rect x="20" y="20" width="40" height="40" rx="6" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M20 33h40M20 47h40M33 20v40M47 20v40" stroke="#fff" stroke-width="3"/>
    </svg>`,
  },
];

// 4. Databricks & Modern Data Engineering Stack
const DATA_ENGINEERING_ICONS = [
  {
    id: "databricks-lakehouse",
    name: "Databricks Lakehouse",
    category: "Databricks & Data Eng",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="${DATABRICKS_RED}"/>
      <path d="M40 18L64 30L40 42L16 30Z" fill="#fff"/>
      <path d="M16 38L40 50L64 38" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <path d="M16 48L40 60L64 48" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: "delta-lake",
    name: "Delta Lake (ACID Storage)",
    category: "Databricks & Data Eng",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#00A4A6"/>
      <polygon points="40,18 62,58 18,58" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="40,30 52,52 28,52" fill="#fff"/>
    </svg>`,
  },
  {
    id: "apache-spark",
    name: "Apache Spark Engine",
    category: "Databricks & Data Eng",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#E25A1C"/>
      <path d="M40 16c6 10 2 16-4 22s-6 12 0 20c-14-4-16-16-10-24s10-12 14-18z" fill="#fff"/>
      <path d="M44 32c4 6 2 10-2 14s-4 8 0 12c-8-2-10-10-6-15s6-7 8-11z" fill="#FFC9C9"/>
    </svg>`,
  },
  {
    id: "snowflake-data",
    name: "Snowflake Data Cloud",
    category: "Databricks & Data Eng",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#29B5E8"/>
      <path d="M40 16v48M18 28l44 24M18 52l44-24" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="6" fill="#fff"/>
    </svg>`,
  },
  {
    id: "dbt-transform",
    name: "dbt (Data Build Tool)",
    category: "Databricks & Data Eng",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#FF6B4A"/>
      <polygon points="40,20 60,34 60,56 40,42" fill="#fff"/>
      <polygon points="40,20 20,34 20,56 40,42" fill="#fff" opacity="0.75"/>
      <polygon points="40,42 60,56 40,68 20,56" fill="#fff" opacity="0.5"/>
    </svg>`,
  },
  {
    id: "apache-airflow",
    name: "Apache Airflow (Orchestrator)",
    category: "Databricks & Data Eng",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#017CEE"/>
      <path d="M40 18c12 0 22 10 22 22 0 10-6 18-16 21M40 62c-12 0-22-10-22-22 0-10 6-18 16-21" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="40" cy="40" r="6" fill="#fff"/>
    </svg>`,
  },
  {
    id: "clickhouse-db",
    name: "ClickHouse Columnar DB",
    category: "Databricks & Data Eng",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#FA4616"/>
      <rect x="22" y="24" width="6" height="32" fill="#fff"/>
      <rect x="32" y="24" width="6" height="32" fill="#fff"/>
      <rect x="42" y="24" width="6" height="32" fill="#fff"/>
      <rect x="52" y="24" width="6" height="32" fill="#fff"/>
    </svg>`,
  },
  {
    id: "duckdb-analytics",
    name: "DuckDB Analytical DB",
    category: "Databricks & Data Eng",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#FFF000"/>
      <path d="M40 24c8 0 14 6 14 14 0 12-10 20-22 20-6 0-10-4-10-10 0-8 8-14 18-14" fill="none" stroke="#231F20" stroke-width="5"/>
      <circle cx="48" cy="32" r="3" fill="#231F20"/>
    </svg>`,
  },
];

// 5. Cloud & DevOps Infrastructure Icons
const CLOUD_ICONS = [
  {
    id: "cloud-kubernetes",
    name: "Kubernetes (K8s)",
    category: "Cloud Infrastructure",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#326ce5"/>
      <polygon points="40,16 64,28 64,52 40,64 16,52 16,28" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="40" cy="40" r="8" fill="#fff"/>
      <path d="M40 16v16M64 28L48 36M64 52L48 44M40 64V48M16 52l16-8M16 28l16 8" stroke="#fff" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "cloud-docker",
    name: "Docker Containers",
    category: "Cloud Infrastructure",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1D63ED"/>
      <rect x="22" y="32" width="8" height="8" rx="1" fill="#fff"/>
      <rect x="32" y="32" width="8" height="8" rx="1" fill="#fff"/>
      <rect x="42" y="32" width="8" height="8" rx="1" fill="#fff"/>
      <rect x="32" y="22" width="8" height="8" rx="1" fill="#fff"/>
      <rect x="42" y="22" width="8" height="8" rx="1" fill="#fff"/>
      <rect x="52" y="32" width="8" height="8" rx="1" fill="#fff"/>
      <path d="M16 46c2 10 16 12 30 12s24-6 26-14c-4 0-10 2-16-2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: "cloud-nginx",
    name: "Nginx Web Server",
    category: "Cloud Infrastructure",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#009639"/>
      <path d="M24 56V24l22 32V24" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="56" cy="40" r="4" fill="#fff"/>
    </svg>`,
  },
  {
    id: "cloud-redis",
    name: "Redis Cache",
    category: "Cloud Infrastructure",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#D82C20"/>
      <polygon points="40,20 62,32 62,48 40,60 18,48 18,32" fill="#fff" opacity="0.9"/>
      <polygon points="40,26 54,34 40,42 26,34" fill="#D82C20"/>
      <polygon points="40,42 54,34 54,44 40,52" fill="#B01E13"/>
    </svg>`,
  },
  {
    id: "cloud-postgres",
    name: "PostgreSQL Database",
    category: "Cloud Infrastructure",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#336791"/>
      <ellipse cx="40" cy="30" rx="20" ry="10" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M20 30v20c0 5.5 9 10 20 10s20-4.5 20-10V30" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M20 40c0 5.5 9 10 20 10s20-4.5 20-10" fill="none" stroke="#fff" stroke-width="4"/>
    </svg>`,
  },
  {
    id: "cloud-mongodb",
    name: "MongoDB Database",
    category: "Cloud Infrastructure",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#13AA52"/>
      <path d="M40 16c0 0-16 14-16 28 0 10 7 16 16 20 9-4 16-10 16-20 0-14-16-28-16-28z" fill="#fff"/>
      <path d="M40 16v32" stroke="#13AA52" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "cloud-kafka",
    name: "Apache Kafka",
    category: "Cloud Infrastructure",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#231F20"/>
      <circle cx="40" cy="24" r="8" fill="#231F20" stroke="#fff" stroke-width="4"/>
      <circle cx="26" cy="52" r="8" fill="#231F20" stroke="#fff" stroke-width="4"/>
      <circle cx="54" cy="52" r="8" fill="#231F20" stroke="#fff" stroke-width="4"/>
      <path d="M40 32v12M32 46l8-10M48 46l-8-10" stroke="#fff" stroke-width="4"/>
    </svg>`,
  },
  {
    id: "cloud-github",
    name: "GitHub / Version Control",
    category: "Cloud Infrastructure",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#181717"/>
      <path d="M40 16a24 24 0 0 0-7.6 46.8c1.2.2 1.6-.5 1.6-1.2v-4.2c-6.7 1.5-8.1-3.2-8.1-3.2-1.1-2.8-2.7-3.5-2.7-3.5-2.2-1.5.2-1.5.2-1.5 2.4.2 3.7 2.5 3.7 2.5 2.2 3.7 5.7 2.6 7.1 2 .2-1.6.9-2.6 1.6-3.2-5.3-.6-11-2.7-11-12a9.4 9.4 0 0 1 2.5-6.5c-.3-.6-1.1-3 .2-6.4 0 0 2-.7 6.7 2.5a23 23 0 0 1 12.2 0c4.7-3.2 6.7-2.5 6.7-2.5 1.3 3.4.5 5.8.2 6.4a9.4 9.4 0 0 1 2.5 6.5c0 9.3-5.7 11.4-11.1 12 .9.8 1.6 2.3 1.6 4.6v6.8c0 .7.4 1.4 1.6 1.2A24 24 0 0 0 40 16z" fill="#fff"/>
    </svg>`,
  },
];

// 6. Software Architecture System Nodes
const SOFTWARE_ICONS = [
  {
    id: "soft-api-gateway",
    name: "API Gateway Node",
    category: "Software Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#6965db"/>
      <path d="M20 25h40M20 40h40M20 55h40" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <circle cx="32" cy="25" r="5" fill="#fff"/>
      <circle cx="48" cy="40" r="5" fill="#fff"/>
      <circle cx="38" cy="55" r="5" fill="#fff"/>
    </svg>`,
  },
  {
    id: "soft-load-balancer",
    name: "Load Balancer",
    category: "Software Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#4c48c4"/>
      <circle cx="24" cy="40" r="6" fill="#fff"/>
      <path d="M30 40h12" stroke="#fff" stroke-width="4"/>
      <path d="M42 40l14-16M42 40h16M42 40l14 16" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="60" cy="24" r="5" fill="#fff"/>
      <circle cx="60" cy="40" r="5" fill="#fff"/>
      <circle cx="60" cy="56" r="5" fill="#fff"/>
    </svg>`,
  },
  {
    id: "soft-microservice",
    name: "Microservice Node",
    category: "Software Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#2b8a3e"/>
      <rect x="22" y="22" width="36" height="36" rx="6" fill="none" stroke="#fff" stroke-width="4"/>
      <circle cx="40" cy="40" r="7" fill="#fff"/>
      <path d="M40 14v8M40 58v8M14 40h8M58 40h8" stroke="#fff" stroke-width="4"/>
    </svg>`,
  },
  {
    id: "soft-web-client",
    name: "Web Browser Client",
    category: "Software Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1c7ed6"/>
      <rect x="18" y="20" width="44" height="40" rx="4" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M18 30h44" stroke="#fff" stroke-width="3"/>
      <circle cx="24" cy="25" r="2" fill="#fff"/>
      <circle cx="30" cy="25" r="2" fill="#fff"/>
      <circle cx="36" cy="25" r="2" fill="#fff"/>
    </svg>`,
  },
  {
    id: "soft-mobile-app",
    name: "Mobile App Client",
    category: "Software Architecture",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#e03131"/>
      <rect x="24" y="16" width="32" height="48" rx="6" fill="none" stroke="#fff" stroke-width="4"/>
      <circle cx="40" cy="58" r="3" fill="#fff"/>
      <path d="M34 22h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
];

// Format into Notely element stencils
function buildIconStencils(list) {
  return list.map((item) => {
    const src = makeSvgDataUri(item.svg);
    return {
      id: `official-${item.id}`,
      name: item.name,
      category: item.category,
      elements: [
        {
          type: "image",
          x: 0,
          y: 0,
          width: 70,
          height: 70,
          src,
        },
        {
          type: "text",
          x: -15,
          y: 76,
          width: 100,
          height: 24,
          text: item.name,
          fontSize: 14,
          strokeColor: "#1e1e1e",
          textAlign: "center",
        },
      ],
    };
  });
}

// 7. Data Visualization & Business Intelligence Icons
const BI_VISUALIZATION_ICONS = [
  {
    id: "bi-powerbi",
    name: "Microsoft Power BI",
    category: "Data Visualization",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#F2C811"/>
      <rect x="22" y="44" width="10" height="18" rx="2" fill="#231F20"/>
      <rect x="35" y="32" width="10" height="30" rx="2" fill="#231F20"/>
      <rect x="48" y="20" width="10" height="42" rx="2" fill="#231F20"/>
    </svg>`,
  },
  {
    id: "bi-excel",
    name: "Microsoft Excel Data Viz",
    category: "Data Visualization",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#107C41"/>
      <path d="M22 22h36v36H22z" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M22 34h36M22 46h36M34 22v36M46 22v36" stroke="#fff" stroke-width="3"/>
      <path d="M28 28l24 24M52 28L28 52" stroke="#fff" stroke-dasharray="2 2" opacity="0.4"/>
    </svg>`,
  },
  {
    id: "bi-tableau",
    name: "Tableau Analytics",
    category: "Data Visualization",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#E97627"/>
      <path d="M40 16v48M16 40h48" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <path d="M26 26l28 28M26 54l28-28" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="7" fill="#fff"/>
      <circle cx="40" cy="16" r="4" fill="#fff"/>
      <circle cx="40" cy="64" r="4" fill="#fff"/>
      <circle cx="16" cy="40" r="4" fill="#fff"/>
      <circle cx="64" cy="40" r="4" fill="#fff"/>
    </svg>`,
  },
];

// 8. Chart & Graph Types
const CHART_STENCILS = [
  {
    id: "chart-column",
    name: "Bar / Column Chart",
    category: "Charts & Analytics",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1e1e1e"/>
      <path d="M16 64h48M16 16v48" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <rect x="22" y="40" width="8" height="24" rx="2" fill="#4285F4"/>
      <rect x="33" y="28" width="8" height="36" rx="2" fill="#EA4335"/>
      <rect x="44" y="46" width="8" height="18" rx="2" fill="#FBBC04"/>
      <rect x="55" y="20" width="8" height="44" rx="2" fill="#34A853"/>
    </svg>`,
  },
  {
    id: "chart-line",
    name: "Line & Trend Chart",
    category: "Charts & Analytics",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1e1e1e"/>
      <path d="M16 64h48M16 16v48" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M22 52L34 38L44 46L58 22" fill="none" stroke="#6965db" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="22" cy="52" r="4" fill="#fff"/>
      <circle cx="34" cy="38" r="4" fill="#fff"/>
      <circle cx="44" cy="46" r="4" fill="#fff"/>
      <circle cx="58" cy="22" r="4" fill="#fff"/>
    </svg>`,
  },
  {
    id: "chart-pie",
    name: "Pie Chart",
    category: "Charts & Analytics",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1e1e1e"/>
      <circle cx="40" cy="40" r="24" fill="#4285F4"/>
      <path d="M40 40L40 16A24 24 0 0 1 64 40Z" fill="#EA4335"/>
      <path d="M40 40L64 40A24 24 0 0 1 40 64Z" fill="#FBBC04"/>
    </svg>`,
  },
  {
    id: "chart-donut",
    name: "Donut Ring Chart",
    category: "Charts & Analytics",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1e1e1e"/>
      <circle cx="40" cy="40" r="24" fill="none" stroke="#4285F4" stroke-width="12"/>
      <circle cx="40" cy="40" r="24" fill="none" stroke="#EA4335" stroke-width="12" stroke-dasharray="45 150"/>
      <circle cx="40" cy="40" r="24" fill="none" stroke="#34A853" stroke-width="12" stroke-dasharray="30 150" stroke-dashoffset="-45"/>
    </svg>`,
  },
  {
    id: "chart-area",
    name: "Area Stacked Chart",
    category: "Charts & Analytics",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1e1e1e"/>
      <path d="M16 64h48M16 16v48" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M20 54 Q32 30 44 42 T64 24 L64 64 L20 64 Z" fill="#6965db" opacity="0.6"/>
      <path d="M20 54 Q32 30 44 42 T64 24" fill="none" stroke="#6965db" stroke-width="4"/>
    </svg>`,
  },
  {
    id: "chart-scatter",
    name: "Scatter Plot Chart",
    category: "Charts & Analytics",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1e1e1e"/>
      <path d="M16 64h48M16 16v48" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="26" cy="50" r="4" fill="#4285F4"/>
      <circle cx="34" cy="36" r="4" fill="#EA4335"/>
      <circle cx="42" cy="44" r="4" fill="#FBBC04"/>
      <circle cx="50" cy="28" r="4" fill="#34A853"/>
      <circle cx="58" cy="22" r="4" fill="#6965db"/>
      <circle cx="38" cy="24" r="4" fill="#4285F4"/>
      <circle cx="48" cy="54" r="4" fill="#EA4335"/>
    </svg>`,
  },
  {
    id: "chart-candlestick",
    name: "Candlestick Trading Chart",
    category: "Charts & Analytics",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1e1e1e"/>
      <line x1="26" y1="20" x2="26" y2="60" stroke="#34A853" stroke-width="3"/>
      <rect x="22" y="28" width="8" height="24" fill="#34A853" rx="1"/>
      <line x1="42" y1="16" x2="42" y2="64" stroke="#EA4335" stroke-width="3"/>
      <rect x="38" y="24" width="8" height="32" fill="#EA4335" rx="1"/>
      <line x1="58" y1="24" x2="58" y2="56" stroke="#34A853" stroke-width="3"/>
      <rect x="54" y="32" width="8" height="16" fill="#34A853" rx="1"/>
    </svg>`,
  },
  {
    id: "chart-funnel",
    name: "Conversion Funnel Chart",
    category: "Charts & Analytics",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1e1e1e"/>
      <polygon points="18,20 62,20 54,32 26,32" fill="#4285F4"/>
      <polygon points="26,34 54,34 46,46 34,46" fill="#FBBC04"/>
      <polygon points="34,48 46,48 42,60 38,60" fill="#34A853"/>
    </svg>`,
  },
  {
    id: "chart-radar",
    name: "Radar / Spider Web Chart",
    category: "Charts & Analytics",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1e1e1e"/>
      <polygon points="40,18 60,32 54,58 26,58 20,32" fill="none" stroke="#fff" stroke-width="3"/>
      <polygon points="40,28 50,36 46,50 34,50 30,36" fill="none" stroke="#fff" stroke-width="2" opacity="0.6"/>
      <polygon points="40,22 56,34 48,54 28,46 24,34" fill="#6965db" opacity="0.5" stroke="#6965db" stroke-width="3"/>
    </svg>`,
  },
];

// 9. ER Diagram & Database Modeling Shapes
const ER_DIAGRAM_STENCILS = [
  {
    id: "er-entity",
    name: "Strong Entity Box",
    category: "UML & ER Diagrams",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#6965db"/>
      <rect x="18" y="22" width="44" height="36" rx="4" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M18 34h44" stroke="#fff" stroke-width="3"/>
      <text x="40" y="29" fill="#fff" font-size="9" font-family="sans-serif" text-anchor="middle" font-weight="bold">ENTITY</text>
    </svg>`,
  },
  {
    id: "er-weak-entity",
    name: "Weak Entity Box",
    category: "UML & ER Diagrams",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#4c48c4"/>
      <rect x="16" y="20" width="48" height="40" rx="4" fill="none" stroke="#fff" stroke-width="3"/>
      <rect x="22" y="26" width="36" height="28" rx="2" fill="none" stroke="#fff" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "er-relationship",
    name: "Relationship Diamond",
    category: "UML & ER Diagrams",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#2b8a3e"/>
      <polygon points="40,18 64,40 40,62 16,40" fill="none" stroke="#fff" stroke-width="4"/>
      <text x="40" y="43" fill="#fff" font-size="8" font-family="sans-serif" text-anchor="middle" font-weight="bold">RELATION</text>
    </svg>`,
  },
  {
    id: "er-weak-relationship",
    name: "Weak Relationship",
    category: "UML & ER Diagrams",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#2b8a3e"/>
      <polygon points="40,16 66,40 40,64 14,40" fill="none" stroke="#fff" stroke-width="3"/>
      <polygon points="40,24 58,40 40,56 22,40" fill="none" stroke="#fff" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "er-key-attribute",
    name: "Primary Key Attribute",
    category: "UML & ER Diagrams",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1c7ed6"/>
      <ellipse cx="40" cy="40" rx="24" ry="14" fill="none" stroke="#fff" stroke-width="4"/>
      <text x="40" y="43" fill="#fff" font-size="10" font-family="sans-serif" text-anchor="middle" text-decoration="underline" font-weight="bold">id [PK]</text>
    </svg>`,
  },
  {
    id: "er-multivalued-attr",
    name: "Multivalued Attribute",
    category: "UML & ER Diagrams",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1c7ed6"/>
      <ellipse cx="40" cy="40" rx="25" ry="16" fill="none" stroke="#fff" stroke-width="3"/>
      <ellipse cx="40" cy="40" rx="19" ry="11" fill="none" stroke="#fff" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "er-derived-attr",
    name: "Derived Attribute",
    category: "UML & ER Diagrams",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#1c7ed6"/>
      <ellipse cx="40" cy="40" rx="24" ry="14" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="5 4"/>
      <text x="40" y="43" fill="#fff" font-size="9" font-family="sans-serif" text-anchor="middle">derived</text>
    </svg>`,
  },
  {
    id: "er-table-schema",
    name: "Database Table Schema",
    category: "UML & ER Diagrams",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="12" fill="#336791"/>
      <rect x="16" y="16" width="48" height="48" rx="4" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M16 28h48M16 40h48M16 52h48M34 28v36" stroke="#fff" stroke-width="3"/>
      <text x="32" y="24" fill="#fff" font-size="8" font-family="sans-serif" text-anchor="middle" font-weight="bold">USERS TABLE</text>
    </svg>`,
  },
];

export const OFFICIAL_ICON_STENCILS = [
  ...buildIconStencils(ER_DIAGRAM_STENCILS),
  ...buildIconStencils(CHART_STENCILS),
  ...buildIconStencils(BI_VISUALIZATION_ICONS),
  ...buildIconStencils(AWS_SERVICES),
  ...buildIconStencils(AZURE_SERVICES),
  ...buildIconStencils(GCP_SERVICES),
  ...buildIconStencils(DATA_ENGINEERING_ICONS),
  ...buildIconStencils(CLOUD_ICONS),
  ...buildIconStencils(SOFTWARE_ICONS),
];
