export interface RegistrationStep {
  step: number;
  title: string;
  titleCn: string;
  duration: string;
  durationCn: string;
  description: string;
  descriptionCn: string;
  documents: { en: string; cn: string }[];
  tips: { en: string; cn: string }[];
  cost?: string;
  costCn?: string;
}

export interface RegistrationInfo {
  type: string;
  typeCn: string;
  summary: string;
  summaryCn: string;
  steps: RegistrationStep[];
  keyPoints: { en: string; cn: string }[];
}

export const COMPANY_REGISTRATION: RegistrationInfo[] = [
  {
    type: "WFOE (Wholly Foreign-Owned Enterprise)",
    typeCn: "外商独资企业 (WFOE)",
    summary:
      "A WFOE is a limited liability company wholly owned by foreign investors. It is the most common structure for foreign businesses establishing a presence in China.",
    summaryCn:
      "外商独资企业是全资由外国投资者所有的有限责任公司。是中国设立外资企业最常见的公司形式。",
    steps: [
      {
        step: 1,
        title: "Name Pre-approval",
        titleCn: "名称预先核准",
        duration: "1–3 business days",
        durationCn: "1-3个工作日",
        description:
          "Submit 3 potential company names to the Administration for Market Regulation (AMR). Names must include the city, a distinctive name, industry descriptor, and legal entity type.",
        descriptionCn:
          "向市场监督管理局提交3个备选公司名称。名称须包含城市名称、独特字号、行业表述及公司类型。",
        documents: [
          { en: "Application form for name pre-approval", cn: "名称预先核准申请表" },
          { en: "Passport copy of the legal representative", cn: "法定代表人护照复印件" },
          {
            en: "Proof of foreign investment (for specific industries)",
            cn: "外商投资证明（特定行业）",
          },
        ],
        tips: [
          {
            en: "Prepare 3–5 alternative names to avoid conflicts",
            cn: "准备3-5个备选名称以避免重名",
          },
          {
            en: "Name format: City + Brand Name + Industry + Limited/Ltd.",
            cn: "名称格式：城市+字号+行业+有限公司",
          },
          {
            en: "Check name availability online before submitting",
            cn: "提交前先在网上查询名称可用性",
          },
        ],
        cost: "Free",
        costCn: "免费",
      },
      {
        step: 2,
        title: "MOEPC Filing & Approval",
        titleCn: "商务部/发改委备案或审批",
        duration: "7–30 business days",
        durationCn: "7-30个工作日",
        description:
          "Submit the project proposal to the Ministry of Commerce or local commerce bureau for approval. This step is mandatory for industries on the Negative List.",
        descriptionCn: "向商务部或地方商务局提交项目申请，需要审批的行业须完成此步骤。",
        documents: [
          { en: "Project proposal ( feasibility study )", cn: "项目申请书（可行性研究报告）" },
          { en: "Investment proposal from the foreign party", cn: "外方投资方案" },
          { en: "Company registration certificate of the investor", cn: "投资方公司注册证明" },
          { en: "Proof of financial capacity (bank statements)", cn: "资信证明（银行存款证明）" },
        ],
        tips: [
          {
            en: "Most service industries only need filing, not approval",
            cn: "大多数服务业只需备案，不需要审批",
          },
          {
            en: "Negative List industries require full MOEPC approval",
            cn: "负面清单行业需要商务部完整审批",
          },
          {
            en: "Work with a local consultant familiar with your industry",
            cn: "与熟悉本行业的本地顾问合作",
          },
        ],
      },
      {
        step: 3,
        title: "Business License Application",
        titleCn: "申请营业执照",
        duration: "5–10 business days",
        durationCn: "5-10个工作日",
        description:
          "Submit all documents to the Administration for Market Regulation (AMR) to obtain the Unified Social Credit Code (USCC) — your legal business license.",
        descriptionCn: "向市场监督管理局提交所有材料，获得统一社会信用代码，即公司营业执照。",
        documents: [
          { en: "Name pre-approval notice", cn: "名称预先核准通知书" },
          { en: "Articles of Association (AoA) of the WFOE", cn: "外商独资企业章程" },
          { en: "MOEPC approval document (if applicable)", cn: "商务部批准文件（如适用）" },
          { en: "Passport copies of all shareholders", cn: "全体股东护照复印件" },
          {
            en: "Proof of registered address (lease agreement + property certificate)",
            cn: "注册地址证明（租赁合同+产权证）",
          },
          { en: "Legal representative appointment letter", cn: "法定代表人任命书" },
        ],
        tips: [
          {
            en: "The registered address must be a commercial property in China",
            cn: "注册地址必须是中国境内的商业物业",
          },
          {
            en: "Virtual address services are available in most cities — verify acceptability",
            cn: "大多数城市有虚拟地址服务，需确认是否被接受",
          },
          {
            en: "Prepare both English and Chinese versions of all documents",
            cn: "准备所有文件的中英文版本",
          },
        ],
      },
      {
        step: 4,
        title: "Post-License Registrations",
        titleCn: "领取执照后登记",
        duration: "10–20 business days",
        durationCn: "10-20个工作日",
        description:
          "After receiving the business license, complete several post-registration steps at various government offices.",
        descriptionCn: "获得营业执照后，还需在多个政府部门完成多项后续登记。",
        documents: [
          { en: "Tax registration (State Tax + Local Tax bureaus)", cn: "税务登记（国税+地税）" },
          {
            en: "Social insurance registration (for hiring employees)",
            cn: "社保登记（招聘员工时）",
          },
          { en: "Customs declaration (if importing/exporting)", cn: "海关备案（如涉及进出口）" },
          { en: "Foreign exchange registration at the bank", cn: "银行外汇登记" },
          { en: "Statistics bureau reporting", cn: "统计局报备" },
          {
            en: "Environmental impact assessment (for specified industries)",
            cn: "环境影响评估（特定行业）",
          },
        ],
        tips: [
          {
            en: "Complete tax registration within 30 days of getting the license",
            cn: "获得执照后30天内完成税务登记",
          },
          {
            en: "Hire a local accounting firm for tax compliance from day one",
            cn: "从第一天起就聘请本地会计事务所处理税务合规",
          },
          { en: "Open a corporate bank account as soon as possible", cn: "尽快开设公司银行账户" },
        ],
        cost: "RMB 0–500 (government fees vary by city)",
        costCn: "人民币0-500元（各城市政府收费不同）",
      },
      {
        step: 5,
        title: "Capital Verification",
        titleCn: "注册资本验资",
        duration: "3–7 business days",
        durationCn: "3-7个工作日",
        description:
          "Contribute registered capital to the company account and have a Chinese certified public accountant verify the capital injection.",
        descriptionCn: "将注册资本汇入公司账户，由中国注册会计师验资。",
        documents: [
          { en: "Business license (copy)", cn: "营业执照（复印件）" },
          { en: "Articles of Association", cn: "公司章程" },
          { en: "Bank receipt for capital injection", cn: "注册资本银行入账凭证" },
          { en: "Shareholder's remittance proof", cn: "股东汇款证明" },
        ],
        tips: [
          {
            en: "Capital verification is no longer mandatory for most industries",
            cn: "大多数行业不再强制要求验资",
          },
          {
            en: "If required, work with a certified CPA firm",
            cn: "如需验资，与认证会计师事务所合作",
          },
          {
            en: "Registered capital can now be injected over the company's operating period",
            cn: "注册资本现在可以在公司经营期内注入",
          },
        ],
      },
    ],
    keyPoints: [
      {
        en: "WFOEs are limited liability companies — shareholders have liability proportional to their investment",
        cn: "外商独资企业为有限责任公司，股东以出资额为限承担责任",
      },
      {
        en: "Total timeline: typically 2–3 months with professional support",
        cn: "整体时间：有专业支持通常需要2-3个月",
      },
      {
        en: "Minimum registered capital varies by industry — consult a local expert",
        cn: "最低注册资本因行业而异，请咨询本地专家",
      },
      { en: "Annual inspections are required after establishment", cn: "设立后每年需接受年检" },
      {
        en: "A registered Chinese legal representative is mandatory",
        cn: "必须指定一名中国法定代表",
      },
    ],
  },
  {
    type: "Representative Office (RO)",
    typeCn: "代表处 (RO)",
    summary:
      "A Representative Office allows a foreign company to establish a presence in China for non-profit activities such as market research, liaison, and promotion. ROs cannot engage in direct commercial activities or issue invoices.",
    summaryCn:
      "代表处允许外国公司在中国设立联络点，开展市场调研、联络和推广等非营利性活动。代表处不能从事直接商业活动或开具发票。",
    steps: [
      {
        step: 1,
        title: "Host Company Sponsorship",
        titleCn: "聘请本地代理公司（托管）",
        duration: "3–5 business days",
        durationCn: "3-5个工作日",
        description:
          "A Representative Office must have a Chinese host company (host enterprise) that acts as the sponsor. The host manages tax filings and HR on behalf of the RO.",
        descriptionCn:
          "代表处必须有一家中国企业（东道企业）作为托管方。托管方代为代表处处理税务申报和人事事务。",
        documents: [
          { en: "Host enterprise qualification documents", cn: "东道企业资质证明" },
          { en: "Sponsorship agreement between the two companies", cn: "两家公司间的托管协议" },
        ],
        tips: [
          {
            en: "Many ROs use professional agency firms as host enterprises",
            cn: "许多代表处使用专业代理公司作为东道企业",
          },
          {
            en: "The host enterprise bears joint liability for the RO's activities",
            cn: "东道企业对代表处的活动承担连带责任",
          },
        ],
      },
      {
        step: 2,
        title: "Registration at AMR",
        titleCn: "市场监督管理局登记",
        duration: "10–15 business days",
        durationCn: "10-15个工作日",
        description:
          "Apply for registration at the local Administration for Market Regulation to obtain the Registration Certificate.",
        descriptionCn: "向当地市场监督管理局申请登记，获得登记证书。",
        documents: [
          { en: "Application form for representative office registration", cn: "代表处登记表" },
          { en: "Certificate of Good Standing of the parent company", cn: "母公司良好存续证明" },
          { en: "Power of Attorney for the Chief Representative", cn: "首席代表授权书" },
          { en: "Passport copies of all representatives", cn: "全体代表护照复印件" },
          { en: "Lease agreement for office space", cn: "办公场所租赁合同" },
          { en: "Host enterprise documents and sponsorship letter", cn: "东道企业文件及担保函" },
        ],
        tips: [
          {
            en: "Only 2–4 foreign representatives are allowed per RO",
            cn: "每个代表处最多允许2-4名外国代表",
          },
          {
            en: "The RO can only hire Chinese staff through the host enterprise",
            cn: "代表处只能通过东道企业招聘中国员工",
          },
        ],
      },
    ],
    keyPoints: [
      {
        en: "ROs are suitable for market exploration, not direct revenue-generating activities",
        cn: "代表处适合市场探索，不能进行直接产生收益的活动",
      },
      {
        en: "ROs cannot sign commercial contracts or issue invoices in China",
        cn: "代表处不能在中国签署商业合同或开具发票",
      },
      { en: "Total timeline: typically 1–2 months", cn: "整体时间：通常需要1-2个月" },
      { en: "Annual inspection and renewal is required", cn: "需要年度检查和续期" },
    ],
  },
  {
    type: "FCTE (Foreign-Contracted Taxable Enterprise)",
    typeCn: "外资企业常设机构 (FCTE)",
    summary:
      "A Foreign-Contracted Taxable Enterprise refers to a situation where a foreign company has a taxable presence in China through projects, employees, or facilities — but has not incorporated a local entity.",
    summaryCn:
      "外资企业常设机构指外国公司通过项目、员工或设施在中国有应税存在，但未在当地注册独立法人实体的情况。",
    steps: [
      {
        step: 1,
        title: "Determine Taxable Presence",
        titleCn: "确定应税存在形式",
        duration: "N/A",
        durationCn: "不适用",
        description:
          "Identify whether your foreign company's activities in China constitute a permanent establishment (PE) or taxable presence under Chinese tax law.",
        descriptionCn: "确定贵公司在中国境内的活动是否构成中国税法下的常设机构或应税存在。",
        documents: [
          { en: "Description of activities in China", cn: "在华活动说明" },
          {
            en: "Contracts and agreements with Chinese entities",
            cn: "与中国实体签订的合同和协议",
          },
          { en: "Employee presence records", cn: "员工在华记录" },
        ],
        tips: [
          {
            en: "Common PE triggers: office in China, regular contract signing in China, employees working on-site",
            cn: "常见常设机构触发条件：在华有办公室、经常在中国签署合同、员工在项目现场工作",
          },
          {
            en: "Tax treaties between your country and China may affect PE determination",
            cn: "贵国与中国之间的税收协定可能影响常设机构的认定",
          },
          {
            en: "Consult a Chinese tax advisor before beginning operations",
            cn: "开展运营前咨询中国税务顾问",
          },
        ],
      },
      {
        step: 2,
        title: "Tax Registration",
        titleCn: "税务登记",
        duration: "3–7 business days",
        durationCn: "3-7个工作日",
        description:
          "Register with the State Taxation Administration and Local Taxation Bureau as a taxpayer once PE is established.",
        descriptionCn: "常设机构确定后，向国家税务总局和地方税务局进行纳税人登记。",
        documents: [
          { en: "Application for tax registration", cn: "税务登记表" },
          {
            en: "Evidence of PE (contracts, office lease, employee records)",
            cn: "常设机构证明（合同、办公室租赁、员工记录）",
          },
          { en: "Copy of parent company registration", cn: "母公司注册证明复印件" },
        ],
        tips: [
          {
            en: "FCTE status requires filing income tax return for all China-sourced income",
            cn: "外资常设机构需就所有中国来源收入申报所得税",
          },
          {
            en: "Corporate income tax rate is typically 25% (with treaty benefits possible)",
            cn: "企业所得税率通常为25%（可享协定优惠）",
          },
          {
            en: "VAT registration may also be required for service activities",
            cn: "提供服务活动可能还需要增值税登记",
          },
        ],
      },
    ],
    keyPoints: [
      {
        en: "FCTE is not a separate legal entity — income is attributed to the foreign parent",
        cn: "外资常设机构不是独立法人实体，收入归入外国母公司",
      },
      {
        en: "The foreign parent company is directly liable for China taxes",
        cn: "外国母公司直接承担中国税务责任",
      },
      {
        en: "Common for construction projects, installation projects, and service contracts longer than 6 months",
        cn: "常见于建筑项目、安装项目和服务期超过6个月的合同",
      },
      {
        en: "Transfer pricing rules apply to inter-company transactions",
        cn: "关联交易适用转让定价规则",
      },
    ],
  },
];

export const REGISTRATION_TIMELINE = {
  wfoe: { min: "2 months", max: "3 months", cost: "RMB 10,000–50,000 (agent + government fees)" },
  ro: { min: "1 month", max: "2 months", cost: "RMB 5,000–20,000 (agent + government fees)" },
  fcte: { min: "2 weeks", max: "1 month", cost: "RMB 3,000–10,000 (advisor + filing fees)" },
};
