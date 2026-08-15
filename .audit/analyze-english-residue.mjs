import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const ASCII_WORD = /[A-Za-z]{2,}/;
// tokens that are OK in a ja page (brands, codes, units)
const OK_TOKEN = /^(WeChat|Alipay|Pay|Didi|Mobike|Hello|Meituan|12306|Uber|Google|Apple|SIM|eSIM|WiFi|Wi-Fi|QR|GPS|LTE|PEK|PKX|SHA|PVG|CAN|CTU|HGH|KWL|SZX|XIY|CKG|DLC|TAO|TNA|WUH|XMN|NGB|FOC|CSX|TSN|URC|HET|YNT|WEH|LJG|XNN|CNY|RMB|RMB|Visa|Mastercard|UnionPay|Metro|Airport|Express|Line|Station|Train|Bus|Taxi|Didi|Alipay|China|Beijing|Shanghai|English|Japanese|UTC|AM|PM|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Open|Closed|Hotel|Restaurant|Tourist|Budget|Luxury|Standard|Deluxe|Suite|Room|Night|Day|Week|Month|Year|Min|Max|Per|From|To|No|Yes|All|None|Total|Free|Park|Temple|Street|River|Lake|Mountain|Island|Tower|Beach|Garden|Museum|St|Rd|Ave|Floor|Level|Exit|Entrance|North|South|East|West|Central|Downtown|Old|New|First|Last|Next|Previous|Round|Trip|One-way|Direct|Express|Local|Booking|Check-in|Check-out|Cancel|Refund|Departure|Arrival|Terminal|Gate|Platform|Seat|Ticket|Pass|Card|App|Online|Offline|Required|Optional|Included|Extra|Only|Plus|Prime|VIP|Emergency|Police|Ambulance|Fire|Hospital|Embassy|Luggage|Baggage|Customs|Visa|Passport|Money|Cash|Currency|Exchange|Rate|Tip|Service|Charge|Fee|Tax|Price|Cost|Amount|Balance|Receipt|Invoice|Order|Menu|Dish|Food|Drink|Water|Tea|Coffee|Beer|Wine|Rice|Noodle|Soup|Spicy|Sweet|Sour|Bitter|Salty|Fresh|Local|Organic|Vegetarian|Halal|Breakfast|Lunch|Dinner|Snack|Dessert|Menu|Course|Taste|Flavor|Portion|Share|Popular|Famous|Best|Top|Great|Good|Nice|Beautiful|Amazing|Wonderful|Excellent|Perfect|Clean|Quiet|Safe|Easy|Simple|Fast|Slow|Cheap|Expensive|Comfortable|Convenient|Helpful|Friendly|Kind|Honest|Trustworthy|Reliable|Worth|Value|Must|Recommended|Suggested|Available|Unavailable|Reserved|Confirmed|Cancelled|Completed|Pending|Processing|Success|Failed|Error|Loading|Saving|Deleting|Updating|Adding|Removing|Search|Filter|Sort|Browse|View|Show|Hide|More|Less|All|Any|Each|Every|Some|Most|Other|Another|Same|Different|Various|Multiple|Several|Total|Average|Maximum|Minimum|Current|Previous|Following|Upcoming|Past|Future|Today|Tomorrow|Yesterday|Tonight|Now|Later|Soon|Immediately|Regular|Special|Seasonal|Annual|Monthly|Weekly|Daily|Hourly|Nightly|Weekend|Weekday|Holiday|Festival|Event|Activity|Attraction|Sight|Scenery|View|Scene|Spot|Place|Location|Area|Region|District|Zone|Section|Part|Side|Corner|Center|Middle|Edge|Top|Bottom|Front|Back|Left|Right|Near|Far|Close|Adjacent|Opposite|Across|Around|Beyond|Inside|Outside|Above|Below|Under|Over|Between|Among|During|Before|After|Within|Without|Through|Throughout|Across|Along|Beside|Behind|Ahead|Below|Beneath|Beside|Beyond|Inside|Outside|Under|Within|By|For|With|Without|About|Around|At|In|On|Of|To|From|Into|Out|Up|Down|Off|On|Over|Under|Again|Then|Now|Here|There|Where|When|Why|How|What|Which|Who|Whom|Whose|This|That|These|Those|It|Its|He|She|They|We|You|I|Me|Us|Them|His|Her|Their|Our|Your|My|Mine|Yours|Ours|Theirs|His|Hers|Its|Was|Were|Is|Are|Am|Be|Been|Being|Has|Have|Had|Do|Does|Did|Done|Will|Would|Shall|Should|Can|Could|May|Might|Must|Ought|Need|Dare|Used|Go|Gone|Going|Come|Came|Coming|Take|Took|Taken|Taking|Get|Got|Gotten|Getting|Make|Made|Making|Find|Found|Finding|See|Saw|Seen|Seeing|Look|Looked|Looking|Watch|Watched|Watching|Show|Showed|Shown|Showing|Tell|Told|Telling|Ask|Asked|Asking|Give|Gave|Given|Giving|Use|Used|Using|Need|Needed|Needing|Help|Helped|Helping|Try|Tried|Trying|Keep|Kept|Keeping|Put|Put|Putting|Call|Called|Calling|Start|Started|Starting|Stop|Stopped|Stopping|Run|Ran|Running|Walk|Walked|Walking|Ride|Rode|Ridden|Riding|Drive|Drove|Driven|Driving|Fly|Flew|Flown|Flying|Book|Booked|Booking|Pay|Paid|Paying|Buy|Bought|Buying|Sell|Sold|Selling|Eat|Ate|Eaten|Eating|Drink|Drank|Drunk|Drinking|Sleep|Slept|Sleeping|Stay|Stayed|Staying|Leave|Left|Leaving|Return|Returned|Returning|Arrive|Arrived|Arriving|Depart|Departed|Departing|Check|Checked|Checking|Visit|Visited|Visiting|Explore|Explored|Exploring|Travel|Traveled|Traveling|Enjoy|Enjoyed|Enjoying|Recommend|Recommended|Recommending|Suggest|Suggested|Suggesting|Reserve|Reserved|Reserving|Cancel|Cancelled|Canceling|Confirm|Confirmed|Confirming|Share|Shared|Sharing|Save|Saved|Saving|Load|Loaded|Loading|Send|Sent|Sending|Receive|Received|Receiving|Message|Message|Messages|Email|Emails|Phone|Numbers?|Numbers|Address|Addresses|Name|Names|Title|Titles|Text|Texts|Language|Languages|Country|Countries|City|Cities|Province|Provinces|State|States|Region|Regions|World|Earth|Map|Maps|Weather|Forecast|Temperature|Humidity|Wind|Rain|Snow|Sun|Sunny|Cloud|Cloudy|Storm|Stormy|Fog|Foggy|Clear|Cold|Cool|Warm|Hot|Mild|Chilly|Temperature|Degrees|Celsius|Fahrenheit)$/;
function isEnglishChunk(t) {
  if (!t || t.length < 3) return false;
  if (CJK.test(t)) return false;
  const words = t.split(/[\s,.;:!?()"'/–—-]+/).filter((w) => /[A-Za-z]/.test(w));
  if (!words.length) return false;
  const asciiLetters = (t.match(/[A-Za-z]/g) || []).length;
  const letters = (t.match(/[A-Za-z]/g) || []).length + (t.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g) || []).length;
  if (letters > 0 && asciiLetters / letters < 0.6) return false;
  const meaningful = words.filter((w) => w.length >= 3 && !OK_TOKEN.test(w));
  return meaningful.length >= 2 && asciiLetters >= 6;
}
const rows = [];
let errorPages = 0;
for (const [url, p] of Object.entries(d)) {
  if (!p.text && !p.title) { errorPages++; continue; }
  if (p.title === "TypeError" || /Error|error/.test(p.title)) { errorPages++; }
  const text = (p.title || "") + "\n" + (p.text || "");
  const chunks = text.split(/\n/).map((c) => c.trim()).filter((c) => c.length >= 2);
  const dirty = chunks.filter((c) => isEnglishChunk(c));
  if (dirty.length) rows.push({ url, count: dirty.length, samples: dirty.slice(0, 6) });
}
rows.sort((a, b) => b.count - a.count);
console.log("pages with english residue:", rows.length, "| error pages:", errorPages);
for (const r of rows) {
  console.log(r.count + "  " + r.url);
  for (const s of r.samples) console.log("    " + s.slice(0, 140));
}
