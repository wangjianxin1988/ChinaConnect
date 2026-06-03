#!/usr/bin/env python3
"""
Step 1: Verify known working Unsplash photo IDs by testing them with curl.
"""
import subprocess
import json

# Known Unsplash photo IDs that should be valid - many different categories
TEST_PHOTOS = [
    # Landmarks/Architecture
    "photo-1547981609-4b6bfe67ca0b",
    "photo-1548013146-72479768bada",
    "photo-1524492412937-b28074a5d7da",
    "photo-1508804185872-d7badad00f7d",
    "photo-1545569341-9eb8b30979d9",
    "photo-1504214208698-ea1916a2195a",
    "photo-1533929736458-ca588d08c8be",
    "photo-1518639192441-8fce0a09e07d",
    "photo-1519415510236-718bdfcd89c8",
    "photo-1562774053-701939374585",
    "photo-1514539079130-25950c84af65",
    "photo-1486406146926-c627a92ad1ab",
    "photo-1519681393784-d120267933ba",
    "photo-1507003211169-0a1dd7228f2d",
    "photo-1563245372-f21724e3856d",
    "photo-1555396273-367ea4eb4db5",
    "photo-1569718212165-3a8278d5f624",
    "photo-1534567153574-2b12153a87f0",
    "photo-1585320806297-9794b3e4eeae",
    "photo-1513415756790-2ac1db1297d0",
    "photo-1522383225653-ed111181a951",
    "photo-1439066615861-d1af74d74000",
    "photo-1464822759023-fed622ff2c3b",
    "photo-1474557157379-8aa74a6ef581",
    "photo-1513889961551-628c1e5e2ee9",
    "photo-1472745942893-4b9f730c7668",
    "photo-1500382017468-9049fed747ef",
    "photo-1591123120675-6f7f1aae0e5b",
    "photo-1565715367074-4497ee5ae532",
    "photo-1548550023-2bdb3c5beed7",
    # Wuhan/China specific
    "photo-1583168803160-cb95a8ee9e56",
    "photo-1544551763-46a013bb70d5",
    "photo-1500382017468-9049fed747ef",
    "photo-1518676590629-3dcbd9c5a5c9",
    "photo-1555041469-a586c61ea9bc",
    "photo-1519567241046-7f570eee3ce6",
    "photo-1452570053594-1b985d6ea890",
    "photo-1449824913935-59a10b8d2000",
    # More varied photos
    "photo-1587474260584-136574528ed5",
    "photo-1537531383496-f4749b8032cf",
    "photo-1566127444979-b3d2b654e3d7",
    "photo-1651076242276-971b12872930",
    "photo-1717643543235-e2812d10a0e1",
    "photo-1720017004624-47bf3b8f1b5f",
    "photo-1779893776545-f7d4362443b1",
    "photo-1777171491750-dbdba2cafe15",
    "photo-1773371053652-7c5dc4483b49",
    "photo-1682082286090-0c8651b52004",
    # More photos to try
    "photo-1516490658263-ac14ac84c5ca",
    "photo-1609949887579-f5ab3c4d51c8",
    "photo-1546083715-6f2d8a4e8481",
    "photo-1590077424544-b8fc8c7e4c52",
    "photo-1569562210099-fd2c65c1a91c",
    "photo-1530866495591-2e7ef5f3d2f5",
    "photo-1544620347-c4fd4a3d5957",
    "photo-1470004914212-5527e49370b",
    "photo-1470004914212-250457992478",
    "photo-1501785888041-af3ef285b470",
    "photo-1518639192441-8fce0a09e07d",
    # Very popular, widely-used Unsplash photos
    "photo-1506905925346-21bda4d32df4",
    "photo-1469474968028-56623f02e42e",
    "photo-1433086966358-54859d0ed716",
    "photo-1470071459604-3b5ec3a7fe05",
    "photo-1441974231531-c6227db76b6e",
    "photo-1472214103451-9374bd1c798e",
    "photo-1507525428034-b723cf961d3e",
    "photo-1519046904884-53103b34b206",
    "photo-1501854140801-50d01698950b",
    "photo-1414609245224-afa02bfb3fda",
    "photo-1476611338391-6f395a0ebc7b",
    "photo-1494500764479-0c8f2919a3d8",
    "photo-1465146344425-f00d5f5c8f07",
    "photo-1457530378978-8bac673b8062",
    "photo-1505765050516-f72dcac9c60e",
    "photo-1529245019870-59b1455f80c4",
    "photo-1518495973542-4542c06a5843",
    "photo-1425913397330-cf8af2ff40a1",
    "photo-1493976040374-85c8e12f0c0e",
    "photo-1531804056423-2337236b2e24",
    "photo-1558618666-fcd25c85f82e",
    "photo-1559825481-12a05cc00344",
    "photo-1513622470522-26c3c8a854bc",
    "photo-1503614472-8c93d56e92ce",
    "photo-1560179304-6fc1d3d8337a",
    "photo-1480714378408-67cf0d13bc1b",
    "photo-1444723121867-7a241cacace9",
    "photo-1480796927426-f609979314bd",
    "photo-1519681393784-d120267933ba",
    "photo-1506744038136-46273834b3fb",
    "photo-1431794062232-2a99a5431c6c",
    "photo-1516026672322-bc52d61a55d5",
    "photo-1518098268026-4e89f1a2cd8e",
    "photo-1473496169904-658ba7c44d8a",
    "photo-1464822759023-fed622ff2c3b",
    "photo-1490682143684-14369e18dce8",
    "photo-1497436072909-60f360e1d4b1",
    "photo-1469854523086-cc02fe5d8800",
    "photo-1494783367193-149034c05e8f",
    "photo-1502082553048-f009c37129b9",
    "photo-1465056836900-8f1e940b3e57",
    "photo-1498354136128-58f790194fa7",
    "photo-1508739773434-c26b3d09e071",
    "photo-1482192505345-5655af888cc4",
    "photo-1532274402911-5a369e4c4bb5",
    "photo-1509023464722-18d996393ca8",
    "photo-1548959902-523e60ae5ce8",
    "photo-1510936111840-65e151ad71bb",
    # Chinese/china themed
    "photo-1547981609-4b6bfe67ca0b",
    "photo-1508804185872-d7badad00f7d",
    "photo-1474181628823-6056c00b7348",
    "photo-1517483000871-1dbf64a6e1c6",
    "photo-1537531383496-f4749b8032cf",
    "photo-1545569341-9eb8b30979d9",
    # More nature/garden/park
    "photo-1558618666-fcd25c85f82e",
    "photo-1416879595882-3373a0480b5b",
    "photo-1588392382834-f8543b1d5a35",
    "photo-1551893478-d726eaf0442c",
    "photo-1487958449943-2429e8be8625",
    # Zoo/animals
    "photo-1535241749838-299277b6305f",
    "photo-1474511320723-9a56873571b7",
    # Food
    "photo-1555396273-367ea4eb4db5",
    "photo-1504674900247-0877df9cc836",
    "photo-1567620905732-2d1ec7ab7445",
    "photo-1540189549336-e6e99c3679fe",
    # Night/city
    "photo-1519681393784-d120267933ba",
    "photo-1514565131-fce0801e5785",
    "photo-1480714378408-67cf0d13bc1b",
    "photo-1477959858617-67f85cf4f1df",
    # Science/museum
    "photo-1507003211169-0a1dd7228f2d",
    "photo-1518998053901-5348d3961a04",
    "photo-1581093458791-9d42e3c7e117",
    # Subway/metro
    "photo-1544620347-c4fd4a3d5957",
    "photo-1556122071-e404eaedb77f",
    # Art museum
    "photo-1513364776144-60967b0f800f",
    "photo-1544967082-d9d25d867d66",
    # River/bridge
    "photo-1504714146340-959ca07e1f38",
    "photo-1513622470522-26c3c8a854bc",
    # Bamboo
    "photo-1448375240586-882707db888b",
    # Lotus/flower
    "photo-1490750967868-88aa4f44baee",
    "photo-1455659817273-f96807779a8a",
    # Streets/colonial
    "photo-1524492412937-b28074a5d7da",
    "photo-1520342868574-5fa3804e551c",
    # Pagoda/tower
    "photo-1504214208698-ea1916a2195a",
    "photo-1533929736458-ca588d08c8be",
    # Rafting/adventure
    "photo-1530866495591-2e7ef5f3d2f5",
    "photo-1504280390367-361c6d9f38f4",
    # Farm/countryside  
    "photo-1464226184884-fa280b87c399",
    "photo-1500382017468-9049fed747ef",
    # Mountain lake
    "photo-1439066615861-d1af74d74000",
    "photo-1470071459604-3b5ec3a7fe05",
    # University campus
    "photo-1562774053-701939374585",
    "photo-1541339907198-e08756dedf3f",
    # Amusement park
    "photo-1513889961551-628c1e5e2ee9",
    "photo-1563861826100-9cb868fdbe1c",
    # More temple
    "photo-1548013146-72479768bada",
    "photo-1553913861-c0fddf2619ee",
    "photo-1572264523807-e048431b9970",
    # Harbor/cranes
    "photo-1494412574643-ff11b0a5eb19",
    "photo-1529525000471-fb347d1e0992",
    # Waterfall
    "photo-1433086966358-54859d0ed716",
    "photo-1432405972618-c6b0cfba5421",
    # Flag/building
    "photo-1493976040374-85c8e12f0c0e",
    "photo-1504714146340-959ca07e1f38",
    # Gate/metal
    "photo-1513415564515-763d91423bdd",
    "photo-1509023464722-18d996393ca8",
    # statue park
    "photo-1547981609-4b6bfe67ca0b",
    "photo-1569839333583-7375336cde4b",
]

# Remove duplicates
seen = set()
unique_photos = []
for p in TEST_PHOTOS:
    if p not in seen:
        seen.add(p)
        unique_photos.append(p)

print(f"Testing {len(unique_photos)} unique photo IDs...")

# Test each photo
working = []
for photo_id in unique_photos:
    url = f"https://images.unsplash.com/{photo_id}?w=800&q=85"
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-L", "--max-time", "8", url],
            capture_output=True, text=True, timeout=12
        )
        code = result.stdout.strip()
        if code == "200":
            working.append(photo_id)
            print(f"  ✓ {photo_id} -> {code}")
        else:
            print(f"  ✗ {photo_id} -> {code}")
    except:
        print(f"  ✗ {photo_id} -> TIMEOUT")

print(f"\n=== Results: {len(working)} working out of {len(unique_photos)} tested ===")
print("\nWorking photo IDs:")
for p in working:
    print(f"  https://images.unsplash.com/{p}?w=800&q=85")

# Save results
with open("D:/suoyouxiangmu/chinaconnect/working_photos.json", "w") as f:
    json.dump(working, f, indent=2)
