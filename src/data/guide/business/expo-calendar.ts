export interface Expo {
  id: string;
  name: string;
  nameCn: string;
  frequency: string;
  venue: string;
  city: string;
  months: number[];
  description: string;
  descriptionCn: string;
  website?: string;
  category:
    | "comprehensive"
    | "furniture"
    | "electronics"
    | "automotive"
    | "apparel"
    | "trade"
    | "medical"
    | "industrial";
}

export const EXPO_CALENDAR: Expo[] = [
  {
    id: "canton-fair",
    name: "China Import and Export Fair",
    nameCn: "广交会 (中国进出口商品交易会)",
    frequency: "Twice yearly (Spring & Autumn)",
    venue: "Canton Fair Complex",
    city: "Guangzhou",
    months: [4, 10],
    description:
      "The largest trade fair in China, held twice a year in Guangzhou. Features all categories of Chinese exports.",
    descriptionCn: "中国规模最大、成交效果最好的综合性国际贸易盛会，每年在广州举办两届。",
    website: "https://www.cantonfair.org.cn",
    category: "comprehensive",
  },
  {
    id: "ciff-gz",
    name: "China International Furniture Fair (Guangzhou)",
    nameCn: "中国家博会（广州）",
    frequency: "Yearly (March)",
    venue: "Canton Fair Complex / PWTC Expo",
    city: "Guangzhou",
    months: [3],
    description:
      "The world's largest furniture exhibition — Guangzhou edition. Showcases home furniture, office furniture, and outdoor furnishings.",
    descriptionCn: "全球最大家具展览会——广州展区。展示民用家具、办公家具及户外家具。",
    website: "https://www.ciff-gz.com",
    category: "furniture",
  },
  {
    id: "ciff-sh",
    name: "China International Furniture Fair (Shanghai)",
    nameCn: "中国家博会（上海）",
    frequency: "Yearly (September)",
    venue: "National Exhibition and Convention Center (Hongqiao)",
    city: "Shanghai",
    months: [9],
    description:
      "The world's largest furniture exhibition — Shanghai edition. Focuses on design, manufacturing, and home furnishings innovation.",
    descriptionCn: "全球最大家具展览会——上海展区。聚焦设计、制造和家居创新。",
    website: "https://en.ciff-sh.com",
    category: "furniture",
  },
  {
    id: "ciec",
    name: "International Electronic Circuits (Shanghai) Exhibition",
    nameCn: "国际电子电路（上海）展览会",
    frequency: "Yearly (March)",
    venue: "National Exhibition and Convention Center",
    city: "Shanghai",
    months: [3],
    description:
      "One of the most influential PCB and electronic circuit exhibitions globally, covering the entire electronic circuit supply chain from design to manufacturing.",
    descriptionCn: "全球最具影响力的PCB及电子电路展览会之一，覆盖从设计到制造的整个电子电路产业链。",
    website: "https://www.cpcashow.com",
    category: "electronics",
  },
  {
    id: "auto-china",
    name: "Auto China",
    nameCn: "中国国际汽车展",
    frequency: "Every two years (April)",
    venue: "China International Exhibition Center",
    city: "Beijing",
    months: [4],
    description: "One of the top automotive exhibitions globally, held every two years in Beijing.",
    descriptionCn: "全球顶级汽车展会之一，每两年在北京举办一次。",
    website: "https://www.autochinashow.org",
    category: "automotive",
  },
  {
    id: "intertextile",
    name: "Intertextile Shanghai Apparel Fabrics",
    nameCn: "中国国际纺织面料及辅料博览会",
    frequency: "Twice yearly (March & August)",
    venue: "National Exhibition and Convention Center",
    city: "Shanghai",
    months: [3, 8],
    description: "Asia's largest apparel fabric and accessories trade fair.",
    descriptionCn: "亚洲最大规模的纺织面料及辅料博览会。",
    website: "https://www.intertextileapparel.com",
    category: "apparel",
  },
  {
    id: "cmef",
    name: "China International Medical Equipment Fair",
    nameCn: "中国国际医疗器械博览会",
    frequency: "Yearly (April & October)",
    venue: "National Exhibition and Convention Center",
    city: "Shanghai",
    months: [4, 10],
    description: "The largest international medical device exhibition in the Asia-Pacific region.",
    descriptionCn: "亚太地区最大的国际医疗器械博览会。",
    website: "https://www.cmef.com.cn",
    category: "medical",
  },
  {
    id: "bauma-china",
    name: "Bauma China",
    nameCn: "中国国际工程机械、建材机械及矿山机械展",
    frequency: "Every two years (November)",
    venue: "Shanghai New International Expo Centre",
    city: "Shanghai",
    months: [11],
    description:
      "The leading trade fair for construction machinery, building material machines, and mining equipment in China.",
    descriptionCn: "中国及亚洲工程机械行业最重要的专业博览会。",
    website: "https://www.bauma-china.com",
    category: "industrial",
  },
  {
    id: "canton-summit",
    name: "Guangzhou International Investment Summit",
    nameCn: "广州国际投资年会",
    frequency: "Yearly (March)",
    venue: "Canton Tower / Baiyun International Convention Center",
    city: "Guangzhou",
    months: [3],
    description:
      "Annual investment summit attracting global entrepreneurs and investors to explore business opportunities in Guangdong.",
    descriptionCn: "年度投资盛会，吸引全球企业家和投资者发掘广东商业机遇。",
    category: "trade",
  },

  {
    id: "china-coast",
    name: "China International Fair for Trade in Services",
    nameCn: "中国国际服务贸易交易会",
    frequency: "Yearly (September)",
    venue: "China National Convention Center",
    city: "Beijing",
    months: [9],
    description: "China's premier trade in services expo covering digital trade, finance, tourism, and education services.",
    descriptionCn: "中国服务贸易领域的龙头展会，涵盖数字贸易、金融、旅游、教育等服务领域。",
    website: "https://www.ciftis.org",
    category: "trade",
  },
  {
    id: "shanghai-auto",
    name: "Shanghai International Automobile Industry Exhibition",
    nameCn: "上海国际汽车工业展览会",
    frequency: "Every two years (April)",
    venue: "National Exhibition and Convention Center",
    city: "Shanghai",
    months: [4],
    description:
      "One of the top ten auto shows worldwide, focusing on new energy vehicles and intelligent driving.",
    descriptionCn: "全球十大汽车展会之一，重点展示新能源汽车和智能驾驶。",
    category: "automotive",
  },
  {
    id: "yiwu-expo",
    name: "China Yiwu International Procurement Festival",
    nameCn: "中国义乌国际小商品采购节",
    frequency: "Yearly (October)",
    venue: "Yiwu International Expo Center",
    city: "Yiwu",
    months: [10],
    description:
      "The world's largest daily necessities procurement center, with a dedicated trade festival each October.",
    descriptionCn: "全球最大的日用小商品采购中心，每年10月举办专属采购节。",
    website: "https://www.yiwuexpo.com",
    category: "trade",
  },
];

export const EXPO_CATEGORIES = [
  { id: "all", label: "All", labelCn: "全部" },
  { id: "comprehensive", label: "Comprehensive", labelCn: "综合" },
  { id: "furniture", label: "Furniture", labelCn: "家具" },
  { id: "electronics", label: "Electronics", labelCn: "电子" },
  { id: "automotive", label: "Automotive", labelCn: "汽车" },
  { id: "apparel", label: "Apparel & Textiles", labelCn: "纺织服装" },
  { id: "medical", label: "Medical", labelCn: "医疗" },
  { id: "industrial", label: "Industrial", labelCn: "工业" },
  { id: "trade", label: "Trade & Investment", labelCn: "贸易投资" },
] as const;

export const YEAR_MONTHS = [
  { month: 1, label: "Jan", labelCn: "一月" },
  { month: 2, label: "Feb", labelCn: "二月" },
  { month: 3, label: "Mar", labelCn: "三月" },
  { month: 4, label: "Apr", labelCn: "四月" },
  { month: 5, label: "May", labelCn: "五月" },
  { month: 6, label: "Jun", labelCn: "六月" },
  { month: 7, label: "Jul", labelCn: "七月" },
  { month: 8, label: "Aug", labelCn: "八月" },
  { month: 9, label: "Sep", labelCn: "九月" },
  { month: 10, label: "Oct", labelCn: "十月" },
  { month: 11, label: "Nov", labelCn: "十一月" },
  { month: 12, label: "Dec", labelCn: "十二月" },
];
