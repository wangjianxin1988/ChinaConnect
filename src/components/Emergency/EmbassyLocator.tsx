import React, { useState, useCallback } from "react";

interface Embassy {
  id: string;
  country: string;
  countryCn: string;
  flag: string;
  city: string;
  address: string;
  addressCn?: string;
  phone: string;
  phoneCn?: string;
  website: string;
  services: string[];
}

const EMBASSIES: Embassy[] = [
  {
    id: "us",
    country: "United States",
    countryCn: "美国",
    flag: "🇺🇸",
    city: "Beijing",
    address: "55 An Jia Lou, Chaoyang District, Beijing 100600",
    addressCn: "北京市朝阳区安家楼路55号",
    phone: "+86-10-8531-3000",
    phoneCn: "010-85313000",
    website: "https://china.usembassy.gov/",
    services: ["Emergency passport", "Prisoner welfare", "Notarial services"],
  },
  {
    id: "uk",
    country: "United Kingdom",
    countryCn: "英国",
    flag: "🇬🇧",
    city: "Beijing",
    address: "11 Guanghua Road, Chaoyang District, Beijing 100600",
    addressCn: "北京市朝阳区光华路11号",
    phone: "+86-10-8529-6600",
    phoneCn: "010-85296600",
    website: "https://www.gov.uk/world/china",
    services: ["Emergency travel documents", "Notarial services", "Translation services"],
  },
  {
    id: "ca",
    country: "Canada",
    countryCn: "加拿大",
    flag: "🇨🇦",
    city: "Beijing",
    address: "19 Dongzhimenwai Street, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区东直门外大街19号",
    phone: "+86-10-5139-4000",
    phoneCn: "010-51394000",
    website: "https://www.canada.ca/en/consular-services.html",
    services: ["Emergency passport", "Notarial services", "Travel advice"],
  },
  {
    id: "au",
    country: "Australia",
    countryCn: "澳大利亚",
    flag: "🇦🇺",
    city: "Beijing",
    address: "No. 21 Dongzhimenwai Street, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区东直门外大街21号",
    phone: "+86-10-5140-4000",
    phoneCn: "010-51404000",
    website: "https://www.dfat.gov.au/foreign/countries/china",
    services: ["Emergency passport", "Notarial services", "Consular assistance"],
  },
  {
    id: "de",
    country: "Germany",
    countryCn: "德国",
    flag: "🇩🇪",
    city: "Beijing",
    address: "9 Yongwumei, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区永武麦9号",
    phone: "+86-10-8532-9000",
    phoneCn: "010-85329000",
    website: "https://www.auswaertiges-amt.de/de/aussenpolitik/laender/china-node",
    services: ["Emergency passport", "Legal assistance", "Notarial services"],
  },
  {
    id: "fr",
    country: "France",
    countryCn: "法国",
    flag: "🇫🇷",
    city: "Beijing",
    address: "No. 3 Xiu San Shi, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区秀山石3号",
    phone: "+86-10-8532-8000",
    phoneCn: "010-85328000",
    website: "https://www.ambafrance-cn.org/",
    services: ["Emergency passport", "Notarial services", "Emergency aid"],
  },
  {
    id: "jp",
    country: "Japan",
    countryCn: "日本",
    flag: "🇯🇵",
    city: "Beijing",
    address: "1 Liangmaqiao, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区亮马桥1号",
    phone: "+86-10-8531-9800",
    phoneCn: "010-85319800",
    website: "https://www.cn.emb-japan.go.jp/",
    services: ["Emergency passport", "Notarial services", "Emergency assistance"],
  },
  {
    id: "kr",
    country: "South Korea",
    countryCn: "韩国",
    flag: "🇰🇷",
    city: "Beijing",
    address: "No. 1 Xiu Ye, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区秀业1号",
    phone: "+86-10-8531-0700",
    phoneCn: "010-85310700",
    website: "https://overseas.mofa.go.kr/cn-zh/index.do",
    services: ["Emergency passport", "Notarial services", "Emergency aid"],
  },
  {
    id: "sg",
    country: "Singapore",
    countryCn: "新加坡",
    flag: "🇸🇬",
    city: "Beijing",
    address: "No. 1 Xi Xiao, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区西小口1号",
    phone: "+86-10-8451-5390",
    phoneCn: "010-84515390",
    website: "https://www.mfa.gov.sg/beijing",
    services: ["Emergency passport", "Notarial services", "Consular assistance"],
  },
  {
    id: "nl",
    country: "Netherlands",
    countryCn: "荷兰",
    flag: "🇳🇱",
    city: "Beijing",
    address: "4 Xiu, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区秀4号",
    phone: "+86-10-8532-0200",
    phoneCn: "010-85320200",
    website: "https://www.netherlandsworldwide.nl/countries/china",
    services: ["Emergency passport", "Notarial services", "Legal assistance"],
  },
  {
    id: "it",
    country: "Italy",
    countryCn: "意大利",
    flag: "🇮🇹",
    city: "Beijing",
    address: "2 Sanlitun, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区三里屯2号",
    phone: "+86-10-8532-7600",
    phoneCn: "010-85327600",
    website: "https://ambpechino.esteri.it/ambasciata_pechino",
    services: ["Emergency passport", "Notarial services", "Emergency aid"],
  },
  {
    id: "es",
    country: "Spain",
    countryCn: "西班牙",
    flag: "🇪🇸",
    city: "Beijing",
    address: "Sanlitun, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区三里屯",
    phone: "+86-10-6532-3780",
    phoneCn: "010-65323780",
    website: "https://www.exteriores.gob.es/embajadas/pekin",
    services: ["Emergency passport", "Notarial services", "Consular assistance"],
  },
];

interface EmbassyLocatorProps {
  className?: string;
  showAll?: boolean;
}

export function EmbassyLocator({ className = "", showAll = false }: EmbassyLocatorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmbassy, setSelectedEmbassy] = useState<Embassy | null>(null);

  const filteredEmbassies = searchQuery
    ? EMBASSIES.filter(
        (e) =>
          e.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.countryCn.includes(searchQuery) ||
          e.city.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : EMBASSIES;

  const displayEmbassies = showAll ? filteredEmbassies : filteredEmbassies.slice(0, 6);

  const handleCall = useCallback((phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, "")}`;
  }, []);

  const handleWebsite = useCallback((website: string) => {
    window.open(website, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>🏛️</span> Embassy & Consulate Locator
        </h2>
        <p className="text-sm opacity-90 mt-1">Find your embassy for emergency assistance</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search country name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Embassy Grid */}
      <div className="p-4">
        {!showAll && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayEmbassies.map((embassy) => (
              <button
                key={embassy.id}
                onClick={() => setSelectedEmbassy(embassy)}
                className="bg-slate-50 hover:bg-slate-100 rounded-xl p-4 text-left transition-colors border border-transparent hover:border-blue-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{embassy.flag}</span>
                  <div>
                    <div className="font-semibold">{embassy.country}</div>
                    <div className="text-sm text-gray-500">{embassy.countryCn}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{embassy.city}</div>
              </button>
            ))}
          </div>
        )}

        {showAll && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {displayEmbassies.map((embassy) => (
              <div
                key={embassy.id}
                className="bg-slate-50 rounded-xl p-4 border border-transparent hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{embassy.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{embassy.country}</h3>
                        <div className="text-sm text-gray-500">{embassy.city}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCall(embassy.phone)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          📞 Call
                        </button>
                        <button
                          onClick={() => handleWebsite(embassy.website)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          🌐 Website
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="text-sm">
                        <div className="text-gray-500 text-xs">Address</div>
                        <div>{embassy.addressCn}</div>
                        <div className="text-gray-500">{embassy.address}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-500 text-xs">Phone</div>
                        <div>
                          {embassy.phoneCn && (
                            <a
                              href={`tel:${embassy.phoneCn.replace(/\D/g, "")}`}
                              className="text-blue-600 hover:underline"
                            >
                              {embassy.phoneCn}
                            </a>
                          )}
                          {embassy.phoneCn && " "}
                          <a
                            href={`tel:${embassy.phone.replace(/\D/g, "")}`}
                            className="text-gray-500 hover:text-blue-600 hover:underline"
                          >
                            {embassy.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredEmbassies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">🔍</span>
            <p>No embassies found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Selected Embassy Modal */}
      {selectedEmbassy && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{selectedEmbassy.flag}</span>
                <div>
                  <h3 className="text-2xl font-bold">{selectedEmbassy.country}</h3>
                  <div className="opacity-90">{selectedEmbassy.countryCn}</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Address</div>
                <div className="font-medium">{selectedEmbassy.addressCn}</div>
                <div className="text-sm text-gray-600">{selectedEmbassy.address}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Phone</div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedEmbassy.phone.replace(/\D/g, "")}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {selectedEmbassy.phone}
                  </a>
                  {selectedEmbassy.phoneCn && (
                    <a
                      href={`tel:${selectedEmbassy.phoneCn.replace(/\D/g, "")}`}
                      className="text-sm text-gray-500 hover:text-blue-600 hover:underline"
                    >
                      ({selectedEmbassy.phoneCn})
                    </a>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Available Services</div>
                <div className="flex flex-wrap gap-2">
                  {selectedEmbassy.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => handleCall(selectedEmbassy.phone)}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>📞</span>
                  <span>Call Now</span>
                </button>
                <button
                  onClick={() => handleWebsite(selectedEmbassy.website)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>🌐</span>
                  <span>Website</span>
                </button>
              </div>
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => setSelectedEmbassy(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmbassyLocator;
