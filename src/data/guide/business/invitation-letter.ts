export interface InvitationTemplate {
  id: string;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  language: "en" | "cn" | "bilingual";
  type: "formal" | "standard" | "urgent";
  content: InvitationContent;
  fields: TemplateField[];
}

export interface InvitationContent {
  sections: {
    title: string;
    content: string;
  }[];
  closing: string;
}

export interface TemplateField {
  key: string;
  label: string;
  labelCn: string;
  placeholder: string;
  placeholderCn: string;
  required: boolean;
}

export const INVITATION_TEMPLATES: InvitationTemplate[] = [
  {
    id: "formal-bilingual",
    title: "Formal Bilingual Invitation",
    titleCn: "正式双语邀请函",
    description:
      "Professional bilingual invitation letter with full company details, suitable for visa applications and official visits.",
    descriptionCn: "专业双语邀请函，含完整公司信息，适用于签证申请和正式访问。",
    language: "bilingual",
    type: "formal",
    content: {
      sections: [
        {
          title: "Date & Reference",
          content:
            "Date: [DATE]\nRef No.: [REF_NUMBER]\n\nTo Whom It May Concern,\n\nWe are pleased to extend a formal invitation to [GUEST_NAME] ([PASSPORT_NUMBER]), [POSITION] of [GUEST_COMPANY], to visit our company in [CITY], China.\n\n日期：[DATE]\n编号：[REF_NUMBER]\n\n致：相关人士：\n\n我们欣然邀请[GUEST_COMPANY]公司的[POSITION][GUEST_NAME]（护照号：[PASSPORT_NUMBER]）前来中国[CITY]访问我司。",
        },
        {
          title: "Visit Purpose",
          content:
            "Purpose of Visit: [PURPOSE]\n\nThe purpose of this visit is for [DETAILED_PURPOSE], which will take place from [START_DATE] to [END_DATE].\n\n访问目的：[PURPOSE]\n\n此次访问旨在[DETAILED_PURPOSE]，时间为[START_DATE]至[END_DATE]。",
        },
        {
          title: "Company Details",
          content:
            "Hosting Company: [HOST_COMPANY]\nRegistration No.: [REG_NUMBER]\nAddress: [HOST_ADDRESS]\nContact Person: [CONTACT_NAME]\nPhone: [CONTACT_PHONE]\nEmail: [CONTACT_EMAIL]\n\n我司信息如下：\n公司名称：[HOST_COMPANY]\n注册号：[REG_NUMBER]\n地址：[HOST_ADDRESS]\n联系人：[CONTACT_NAME]\n电话：[CONTACT_PHONE]\n邮箱：[CONTACT_EMAIL]",
        },
        {
          title: "Accommodation & Expenses",
          content:
            "Accommodation Arrangement:\n[ACCOMMODATION_DETAILS]\n\nAll expenses including travel, accommodation, and local transportation will be:\n[ ] borne by the hosting company\n[ ] shared between both parties\n[ ] borne by the invited party\n\n住宿安排：\n[ACCOMMODATION_DETAILS]\n\n行程、住宿及本地交通费用：\n[ ] 由邀请方承担\n[ ] 双方分担\n[ ] 被邀请方自行承担",
        },
        {
          title: "Invitation Guarantee",
          content:
            "We hereby guarantee that [GUEST_NAME] will comply with Chinese laws and regulations during their stay in China and will leave the country before the expiration of their authorized stay.\n\n我们特此担保，[GUEST_NAME]在华期间将遵守中国法律法规，并在授权停留期满前离境。",
        },
      ],
      closing:
        "We look forward to welcoming [GUEST_NAME] and are happy to provide any additional information needed.\n\n我们期待[GUEST_NAME]的到来，并乐于提供任何所需的补充信息。\n\nSincerely,\n[HOST_SIGNATURE]\n[HOST_TITLE]\n[HOST_COMPANY]\n\n此致\n敬礼\n\n[HOST_SIGNATURE]\n[HOST_TITLE]\n[HOST_COMPANY]\n\nCompany Seal / 公司盖章",
    },
    fields: [
      {
        key: "guest_name",
        label: "Guest Full Name",
        labelCn: "来宾姓名",
        placeholder: "John Smith",
        placeholderCn: "约翰·史密斯",
        required: true,
      },
      {
        key: "passport_number",
        label: "Passport Number",
        labelCn: "护照号码",
        placeholder: "AB1234567",
        placeholderCn: "AB1234567",
        required: true,
      },
      {
        key: "position",
        label: "Position / Title",
        labelCn: "职位",
        placeholder: "Chief Executive Officer",
        placeholderCn: "首席执行官",
        required: true,
      },
      {
        key: "guest_company",
        label: "Guest Company Name",
        labelCn: "来宾公司名称",
        placeholder: "ABC International Ltd.",
        placeholderCn: "ABC国际有限公司",
        required: true,
      },
      {
        key: "host_company",
        label: "Your Company Name",
        labelCn: "贵公司名称",
        placeholder: "XYZ China Co., Ltd.",
        placeholderCn: "XYZ中国有限公司",
        required: true,
      },
      {
        key: "reg_number",
        label: "Company Registration No.",
        labelCn: "公司注册号",
        placeholder: "91310000XXXXXXXX",
        placeholderCn: "91310000XXXXXXXX",
        required: true,
      },
      {
        key: "host_address",
        label: "Company Address (China)",
        labelCn: "公司地址（中国）",
        placeholder: "Floor 10, Building A, 123 Business Road, Pudong, Shanghai",
        placeholderCn: "上海市浦东新区商务路123号A栋10楼",
        required: true,
      },
      {
        key: "contact_name",
        label: "Contact Person",
        labelCn: "联系人",
        placeholder: "Li Wei / 李伟",
        placeholderCn: "李伟",
        required: true,
      },
      {
        key: "contact_phone",
        label: "Contact Phone",
        labelCn: "联系电话",
        placeholder: "+86 21 1234 5678",
        placeholderCn: "+86 21 1234 5678",
        required: true,
      },
      {
        key: "contact_email",
        label: "Contact Email",
        labelCn: "联系邮箱",
        placeholder: "liwei@company.cn",
        placeholderCn: "liwei@company.cn",
        required: true,
      },
      {
        key: "city",
        label: "Visit City",
        labelCn: "访问城市",
        placeholder: "Shanghai",
        placeholderCn: "上海",
        required: true,
      },
      {
        key: "start_date",
        label: "Start Date",
        labelCn: "开始日期",
        placeholder: "2026-06-01",
        placeholderCn: "2026-06-01",
        required: true,
      },
      {
        key: "end_date",
        label: "End Date",
        labelCn: "结束日期",
        placeholder: "2026-06-05",
        placeholderCn: "2026-06-05",
        required: true,
      },
      {
        key: "purpose",
        label: "Purpose (short)",
        labelCn: "访问目的（简写）",
        placeholder: "Business Negotiation",
        placeholderCn: "商务洽谈",
        required: true,
      },
      {
        key: "detailed_purpose",
        label: "Purpose (detailed)",
        labelCn: "访问目的（详细）",
        placeholder: "attending the annual supplier summit and negotiating supply agreements",
        placeholderCn: "参加年度供应商峰会并洽谈供货协议",
        required: true,
      },
      {
        key: "accommodation",
        label: "Accommodation",
        labelCn: "住宿安排",
        placeholder: "Will be booked at a 4-star hotel near the office",
        placeholderCn: "将在办公室附近四星级酒店安排住宿",
        required: false,
      },
      {
        key: "expense_arrangement",
        label: "Expense Arrangement",
        labelCn: "费用安排",
        placeholder: "All expenses borne by the hosting company",
        placeholderCn: "全部费用由邀请方承担",
        required: false,
      },
      {
        key: "host_signature",
        label: "Authorizing Signature Name",
        labelCn: "授权签字人姓名",
        placeholder: "Zhang Ming",
        placeholderCn: "张明",
        required: true,
      },
      {
        key: "host_title",
        label: "Authorizing Signature Title",
        labelCn: "授权签字人职位",
        placeholder: "General Manager",
        placeholderCn: "总经理",
        required: true,
      },
      {
        key: "ref_number",
        label: "Reference Number",
        labelCn: "编号",
        placeholder: "INV-2026-0601",
        placeholderCn: "INV-2026-0601",
        required: false,
      },
    ],
  },
  {
    id: "standard-en",
    title: "Standard English Invitation",
    titleCn: "标准英文邀请函",
    description:
      "Clean English-language invitation letter for general business visits and conferences.",
    descriptionCn: "简洁英文邀请函，适用于一般商务访问和会议。",
    language: "en",
    type: "standard",
    content: {
      sections: [
        {
          title: "Header",
          content:
            "[HOST_COMPANY]\n[HOST_ADDRESS]\nTel: [CONTACT_PHONE] | Email: [CONTACT_EMAIL]\n\n[DATE]\n\nDear [GUEST_NAME],\n\nRe: Invitation to Visit [HOST_COMPANY] in [CITY], China\n\nIt is our pleasure to invite you to visit [HOST_COMPANY] from [START_DATE] to [END_DATE].",
        },
        {
          title: "Visit Details",
          content:
            "Purpose of Visit: [PURPOSE]\nYour primary contact during the visit will be [CONTACT_NAME] at [HOST_COMPANY].\n\nPlease find the proposed itinerary below:\n[ITINERARY]",
        },
      ],
      closing:
        "We look forward to your visit and hope your time in [CITY] will be both productive and enjoyable.\n\nPlease confirm your availability by responding to [CONTACT_EMAIL].\n\nBest regards,\n[HOST_SIGNATURE]\n[HOST_TITLE]\n[HOST_COMPANY]",
    },
    fields: [
      {
        key: "guest_name",
        label: "Guest Full Name",
        labelCn: "来宾姓名",
        placeholder: "John Smith",
        placeholderCn: "约翰·史密斯",
        required: true,
      },
      {
        key: "host_company",
        label: "Your Company Name",
        labelCn: "贵公司名称",
        placeholder: "XYZ China Co., Ltd.",
        placeholderCn: "XYZ中国有限公司",
        required: true,
      },
      {
        key: "host_address",
        label: "Company Address",
        labelCn: "公司地址",
        placeholder: "Floor 10, 123 Business Rd, Shanghai",
        placeholderCn: "上海市商务路123号10楼",
        required: true,
      },
      {
        key: "contact_name",
        label: "Contact Person",
        labelCn: "联系人",
        placeholder: "Li Wei",
        placeholderCn: "李伟",
        required: true,
      },
      {
        key: "contact_phone",
        label: "Contact Phone",
        labelCn: "联系电话",
        placeholder: "+86 21 1234 5678",
        placeholderCn: "+86 21 1234 5678",
        required: true,
      },
      {
        key: "contact_email",
        label: "Contact Email",
        labelCn: "联系邮箱",
        placeholder: "liwei@company.cn",
        placeholderCn: "liwei@company.cn",
        required: true,
      },
      {
        key: "city",
        label: "Visit City",
        labelCn: "访问城市",
        placeholder: "Shanghai",
        placeholderCn: "上海",
        required: true,
      },
      {
        key: "start_date",
        label: "Start Date",
        labelCn: "开始日期",
        placeholder: "2026-06-01",
        placeholderCn: "2026-06-01",
        required: true,
      },
      {
        key: "end_date",
        label: "End Date",
        labelCn: "结束日期",
        placeholder: "2026-06-05",
        placeholderCn: "2026-06-05",
        required: true,
      },
      {
        key: "purpose",
        label: "Purpose of Visit",
        labelCn: "访问目的",
        placeholder: "attending the annual business summit and meeting with our management team",
        placeholderCn: "参加年度商务峰会并与管理层会面",
        required: true,
      },
      {
        key: "itinerary",
        label: "Proposed Itinerary",
        labelCn: "建议行程",
        placeholder:
          "Day 1: Company presentation and facility tour\nDay 2: Business negotiations\nDay 3: Wrap-up meeting",
        placeholderCn: "第一天：公司介绍及参观\n第二天：商务洽谈\n第三天：总结会议",
        required: false,
      },
      {
        key: "host_signature",
        label: "Signature Name",
        labelCn: "签字人姓名",
        placeholder: "Zhang Ming",
        placeholderCn: "张明",
        required: true,
      },
      {
        key: "host_title",
        label: "Signature Title",
        labelCn: "签字人职位",
        placeholder: "General Manager",
        placeholderCn: "总经理",
        required: true,
      },
    ],
  },
  {
    id: "urgent-en",
    title: "Urgent Visit Invitation",
    titleCn: "紧急访问邀请函",
    description:
      "Streamlined invitation for last-minute business visits where standard processing time is not available.",
    descriptionCn: "简化版邀请函，适用于无法提前办理标准手续的紧急商务访问。",
    language: "en",
    type: "urgent",
    content: {
      sections: [
        {
          title: "URGENT",
          content:
            "[HOST_COMPANY]\n[HOST_ADDRESS]\n\n[DATE] — URGENT VISIT INVITATION\n\nDear [GUEST_NAME],\n\nWe are writing to urgently invite you to visit [HOST_COMPANY] in [CITY], China, from [START_DATE] to [END_DATE].",
        },
        {
          title: "Reason for Urgency",
          content:
            "Reason for Urgency: [URGENCY_REASON]\n\nPurpose: [PURPOSE]\n\nYour contact: [CONTACT_NAME], [CONTACT_PHONE], [CONTACT_EMAIL]",
        },
      ],
      closing:
        "Please confirm your travel dates at your earliest convenience so we can arrange your itinerary.\n\nBest regards,\n[HOST_SIGNATURE]\n[HOST_TITLE]\n[HOST_COMPANY]",
    },
    fields: [
      {
        key: "guest_name",
        label: "Guest Full Name",
        labelCn: "来宾姓名",
        placeholder: "John Smith",
        placeholderCn: "约翰·史密斯",
        required: true,
      },
      {
        key: "host_company",
        label: "Your Company Name",
        labelCn: "贵公司名称",
        placeholder: "XYZ China Co., Ltd.",
        placeholderCn: "XYZ中国有限公司",
        required: true,
      },
      {
        key: "host_address",
        label: "Company Address",
        labelCn: "公司地址",
        placeholder: "Shanghai",
        placeholderCn: "上海",
        required: true,
      },
      {
        key: "city",
        label: "Visit City",
        labelCn: "访问城市",
        placeholder: "Shanghai",
        placeholderCn: "上海",
        required: true,
      },
      {
        key: "start_date",
        label: "Start Date",
        labelCn: "开始日期",
        placeholder: "2026-06-01",
        placeholderCn: "2026-06-01",
        required: true,
      },
      {
        key: "end_date",
        label: "End Date",
        labelCn: "结束日期",
        placeholder: "2026-06-03",
        placeholderCn: "2026-06-03",
        required: true,
      },
      {
        key: "urgency_reason",
        label: "Reason for Urgency",
        labelCn: "紧急原因",
        placeholder: "critical contract negotiation with deadline approaching",
        placeholderCn: "合同谈判临近截止日期",
        required: true,
      },
      {
        key: "purpose",
        label: "Purpose of Visit",
        labelCn: "访问目的",
        placeholder: "finalizing the supply agreement before the fiscal quarter closes",
        placeholderCn: "在财季结束前敲定供货协议",
        required: true,
      },
      {
        key: "contact_name",
        label: "Contact Person",
        labelCn: "联系人",
        placeholder: "Li Wei",
        placeholderCn: "李伟",
        required: true,
      },
      {
        key: "contact_phone",
        label: "Contact Phone",
        labelCn: "联系电话",
        placeholder: "+86 21 1234 5678",
        placeholderCn: "+86 21 1234 5678",
        required: true,
      },
      {
        key: "contact_email",
        label: "Contact Email",
        labelCn: "联系邮箱",
        placeholder: "liwei@company.cn",
        placeholderCn: "liwei@company.cn",
        required: true,
      },
      {
        key: "host_signature",
        label: "Signature Name",
        labelCn: "签字人姓名",
        placeholder: "Zhang Ming",
        placeholderCn: "张明",
        required: true,
      },
      {
        key: "host_title",
        label: "Signature Title",
        labelCn: "签字人职位",
        placeholder: "General Manager",
        placeholderCn: "总经理",
        required: true,
      },
    ],
  },
];
