import { useRef, useState } from "react";

interface TranslatedDish {
  name: string;
  nameEn: string;
  price?: number;
  recommended?: boolean;
  allergens?: string[];
}

interface DishAssistantProps {
  cityName?: string;
}

const CITY_MENUS: Record<
  string,
  { name: string; nameEn: string; price?: number; recommended?: boolean; allergens?: string[] }[]
> = {
  北京: [
    { name: "北京烤鸭", nameEn: "Peking Duck", price: 288, recommended: true, allergens: ["麸质"] },
    {
      name: "卤煮火烧",
      nameEn: "Lu Zhu Huo Shao",
      price: 35,
      recommended: true,
      allergens: ["大豆"],
    },
    {
      name: "豆汁",
      nameEn: "Fermented Soybean Milk",
      price: 15,
      recommended: false,
      allergens: ["大豆"],
    },
    {
      name: "炸酱面",
      nameEn: "Noodles with Soy Bean Paste",
      price: 28,
      recommended: true,
      allergens: ["麸质", "大豆"],
    },
    {
      name: "爆肚",
      nameEn: "Stir-fried Beef Offal",
      price: 48,
      recommended: true,
      allergens: ["羊肉"],
    },
  ],
  上海: [
    {
      name: "红烧肉",
      nameEn: "Braised Pork Belly",
      price: 88,
      recommended: true,
      allergens: ["猪肉"],
    },
    {
      name: "小笼包",
      nameEn: "Xiao Long Bao",
      price: 68,
      recommended: true,
      allergens: ["猪肉", "麸质"],
    },
    {
      name: "生煎包",
      nameEn: "Pan-fried Pork Buns",
      price: 48,
      recommended: true,
      allergens: ["猪肉"],
    },
    {
      name: "响油鳝丝",
      nameEn: "Eel in Hot Oil",
      price: 128,
      recommended: false,
      allergens: ["鱼"],
    },
    {
      name: "醉蟹",
      nameEn: "Drunken Crab",
      price: 168,
      recommended: true,
      allergens: ["蟹", "酒精"],
    },
  ],
  成都: [
    { name: "火锅", nameEn: "Hot Pot", price: 150, recommended: true, allergens: ["辣椒", "花椒"] },
    {
      name: "麻婆豆腐",
      nameEn: "Mapo Tofu",
      price: 32,
      recommended: true,
      allergens: ["大豆", "辣椒"],
    },
    {
      name: "夫妻肺片",
      nameEn: "Fu Qi Fei Pian",
      price: 78,
      recommended: true,
      allergens: ["牛肉", "辣椒", "花椒"],
    },
    { name: "龙抄手", nameEn: "Long Chao Shou", price: 25, recommended: true, allergens: ["猪肉"] },
    {
      name: "串串香",
      nameEn: "Chuan Chuan Xiang",
      price: 60,
      recommended: false,
      allergens: ["辣椒"],
    },
  ],
  广州: [
    {
      name: "白切鸡",
      nameEn: "White Cut Chicken",
      price: 98,
      recommended: true,
      allergens: ["鸡肉"],
    },
    {
      name: "虾饺",
      nameEn: "Shrimp Dumplings",
      price: 58,
      recommended: true,
      allergens: ["虾", "麸质"],
    },
    { name: "叉烧", nameEn: "Char Siu", price: 68, recommended: true, allergens: ["猪肉"] },
    { name: "煲仔饭", nameEn: "Clay Pot Rice", price: 48, recommended: true, allergens: ["海鲜"] },
    { name: "肠粉", nameEn: "Rice Noodle Rolls", price: 30, recommended: false, allergens: ["虾"] },
  ],
  杭州: [
    { name: "东坡肉", nameEn: "Dong Po Pork", price: 128, recommended: true, allergens: ["猪肉"] },
    {
      name: "西湖醋鱼",
      nameEn: "West Lake Fish in Vinegar",
      price: 98,
      recommended: true,
      allergens: ["鱼"],
    },
    {
      name: "龙井虾仁",
      nameEn: "Longjing Shrimp",
      price: 168,
      recommended: true,
      allergens: ["虾", "茶叶"],
    },
    {
      name: "叫化鸡",
      nameEn: "Beggar's Chicken",
      price: 188,
      recommended: false,
      allergens: ["鸡肉"],
    },
    {
      name: "片儿川",
      nameEn: "Pian Er Chuan Noodles",
      price: 35,
      recommended: true,
      allergens: ["猪肉"],
    },
  ],
  西安: [
    {
      name: "肉夹馍",
      nameEn: "Chinese Hamburger",
      price: 15,
      recommended: true,
      allergens: ["麸质"],
    },
    { name: "羊肉泡馍", nameEn: "Pao Mo", price: 40, recommended: true, allergens: ["羊肉"] },
    { name: "凉皮", nameEn: "Liang Pi", price: 12, recommended: true, allergens: ["麸质", "辣椒"] },
    {
      name: "Biangbiang面",
      nameEn: "Biangbiang Noodles",
      price: 25,
      recommended: true,
      allergens: ["麸质"],
    },
    { name: "甑糕", nameEn: "Zeng Gao", price: 18, recommended: false, allergens: ["糯米", "枣"] },
  ],
};

export default function DishAssistant({ cityName = "上海" }: DishAssistantProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [translatedDishes, setTranslatedDishes] = useState<TranslatedDish[]>([]);
  const [activeTab, setActiveTab] = useState<"scan" | "recommend">("scan");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setIsScanning(true);
        setTimeout(() => {
          const menu = CITY_MENUS[cityName] || CITY_MENUS.上海;
          setTranslatedDishes(menu as TranslatedDish[]);
          setIsScanning(false);
          setShowResult(true);
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => fileInputRef.current?.click();
  const allergenWarnings = [
    { icon: "🥜", label: "花生", color: "bg-amber-100 text-amber-800" },
    { icon: "🐟", label: "鱼", color: "bg-blue-100 text-blue-800" },
    { icon: "🥚", label: "鸡蛋", color: "bg-yellow-100 text-yellow-800" },
    { icon: "🌾", label: "麸质", color: "bg-orange-100 text-orange-800" },
    { icon: "🫘", label: "大豆", color: "bg-green-100 text-green-800" },
    { icon: "🌶️", label: "辣椒", color: "bg-red-100 text-red-800" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">点菜助手</h2>
        <p className="text-sm text-gray-500 mt-1">拍照翻译菜单，智能推荐菜品</p>
      </div>

      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "scan" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          📷 拍照翻译
        </button>
        <button
          onClick={() => setActiveTab("recommend")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "recommend" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          ✨ 智能推荐
        </button>
      </div>

      <div className="p-4">
        {activeTab === "scan" ? (
          <>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploadedImage ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedImage ? (
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded" className="max-h-64 mx-auto rounded-lg" />
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <div className="text-white text-center">
                        <div className="animate-spin text-3xl mb-2">⏳</div>
                        <p className="text-sm">正在识别菜单...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-5xl mb-3">📸</div>
                  <p className="text-gray-600 mb-2">拍摄或上传菜单图片</p>
                  <p className="text-xs text-gray-400 mb-4">支持中英文菜单自动翻译</p>
                  <button
                    onClick={handleCapture}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    拍照上传
                  </button>
                </>
              )}
            </div>

            {showResult && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 mb-3">翻译结果</h3>
                <div className="space-y-2">
                  {translatedDishes.map((dish, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-all ${dish.recommended ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{dish.name}</p>
                          <p className="text-sm text-gray-500">{dish.nameEn}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-orange-600">¥{dish.price}</p>
                          {dish.recommended && (
                            <span className="text-xs text-green-600">✨ 推荐</span>
                          )}
                        </div>
                      </div>
                      {dish.allergens && dish.allergens.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {dish.allergens.map((allergen) => (
                            <span
                              key={allergen}
                              className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded"
                            >
                              ⚠️ 含{allergen}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🤖</div>
              <h3 className="font-bold text-gray-900 mb-2">智能点菜推荐</h3>
              <p className="text-sm text-gray-500 mb-4">
                根据您的口味偏好、过敏原和季节推荐最佳菜品组合
              </p>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                开始智能推荐
              </button>
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-gray-900 mb-3">常见过敏原提示</h3>
              <div className="grid grid-cols-3 gap-2">
                {allergenWarnings.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 p-2 rounded-lg ${item.color}`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">💰 价格透明参考</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">老外价 (Tourist Price)</span>
                  <span className="font-medium text-red-600">¥128</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">本地价 (Local Price)</span>
                  <span className="font-medium text-green-600">¥68</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">差价</span>
                  <span className="font-medium text-gray-900">¥60 (88%)</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * 使用本地语言点餐可避免老外价，这是正常的市场行为
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
