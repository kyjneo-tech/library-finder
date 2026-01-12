/**
 * 도서관정보나루 API 지역 코드 데이터
 * 3계층 구조 지원 (광역시도 -> 시/군 -> 구)
 */

export interface District {
  code: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface SubRegion {
  code: string;
  name: string;
  districts?: District[]; // 구(區) 정보가 있는 경우
  latitude?: number;
  longitude?: number;
}

export interface RegionData {
  code: string;
  name: string;
  subRegions?: SubRegion[];
  latitude?: number;
  longitude?: number;
}

/**
 * 전역 지역 데이터 (좌표 포함)
 */
export const REGIONS: RegionData[] = [
  { code: "11", name: "서울특별시", latitude: 37.5665, longitude: 126.9780, subRegions: [
    { code: "11010", name: "종로구", latitude: 37.5730, longitude: 126.9794 },
    { code: "11020", name: "중구", latitude: 37.5637, longitude: 126.9976 },
    { code: "11030", name: "용산구", latitude: 37.5326, longitude: 126.9904 },
    { code: "11040", name: "성동구", latitude: 37.5635, longitude: 127.0365 },
    { code: "11050", name: "광진구", latitude: 37.5385, longitude: 127.0823 },
    { code: "11060", name: "동대문구", latitude: 37.5744, longitude: 127.0396 },
    { code: "11070", name: "중랑구", latitude: 37.6063, longitude: 127.0927 },
    { code: "11080", name: "성북구", latitude: 37.5891, longitude: 127.0182 },
    { code: "11090", name: "강북구", latitude: 37.6396, longitude: 127.0257 },
    { code: "11100", name: "도봉구", latitude: 37.6688, longitude: 127.0471 },
    { code: "11110", name: "노원구", latitude: 37.6542, longitude: 127.0568 },
    { code: "11120", name: "은평구", latitude: 37.6027, longitude: 126.9291 },
    { code: "11130", name: "서대문구", latitude: 37.5791, longitude: 126.9368 },
    { code: "11140", name: "마포구", latitude: 37.5663, longitude: 126.9016 },
    { code: "11150", name: "양천구", latitude: 37.5169, longitude: 126.8660 },
    { code: "11160", name: "강서구", latitude: 37.5510, longitude: 126.8495 },
    { code: "11170", name: "구로구", latitude: 37.4954, longitude: 126.8874 },
    { code: "11180", name: "금천구", latitude: 37.4573, longitude: 126.8954 },
    { code: "11190", name: "영등포구", latitude: 37.5264, longitude: 126.8962 },
    { code: "11200", name: "동작구", latitude: 37.5124, longitude: 126.9393 },
    { code: "11210", name: "관악구", latitude: 37.4784, longitude: 126.9517 },
    { code: "11220", name: "서초구", latitude: 37.4837, longitude: 127.0324 },
    { code: "11230", name: "강남구", latitude: 37.5172, longitude: 127.0473 },
    { code: "11240", name: "송파구", latitude: 37.5145, longitude: 127.1066 },
    { code: "11250", name: "강동구", latitude: 37.5301, longitude: 127.1238 },
  ]},
  { code: "31", name: "경기도", latitude: 37.4138, longitude: 127.5183, subRegions: [
    { code: "31010", name: "수원시", latitude: 37.2636, longitude: 127.0286, districts: [
        { code: "31011", name: "장안구", latitude: 37.3041, longitude: 127.0104 },
        { code: "31012", name: "권선구", latitude: 37.2572, longitude: 126.9723 },
        { code: "31013", name: "팔달구", latitude: 37.2820, longitude: 127.0197 },
        { code: "31014", name: "영통구", latitude: 37.2596, longitude: 127.0514 }
    ]},
    { code: "31020", name: "성남시", latitude: 37.4200, longitude: 127.1265, districts: [
        { code: "31021", name: "수정구", latitude: 37.4475, longitude: 127.1408 },
        { code: "31022", name: "중원구", latitude: 37.4367, longitude: 127.1690 },
        { code: "31023", name: "분당구", latitude: 37.3827, longitude: 127.1189 }
    ]},
    { code: "31040", name: "안양시", latitude: 37.3943, longitude: 126.9568, districts: [
        { code: "31041", name: "만안구", latitude: 37.4040, longitude: 126.9157 },
        { code: "31042", name: "동안구", latitude: 37.3908, longitude: 126.9610 }
    ]},
    { code: "31050", name: "부천시", latitude: 37.5034, longitude: 126.7660, districts: [
        { code: "31051", name: "원미구", latitude: 37.4860, longitude: 126.7820 },
        { code: "31052", name: "소사구", latitude: 37.4820, longitude: 126.7950 },
        { code: "31053", name: "오정구", latitude: 37.5250, longitude: 126.7780 }
    ]},
    { code: "31090", name: "안산시", latitude: 37.3217, longitude: 126.8309, districts: [
        { code: "31091", name: "상록구", latitude: 37.3060, longitude: 126.8510 },
        { code: "31092", name: "단원구", latitude: 37.3197, longitude: 126.8115 }
    ]},
    { code: "31100", name: "고양시", latitude: 37.6580, longitude: 126.8329, districts: [
        { code: "31101", name: "덕양구", latitude: 37.6393, longitude: 126.8327 },
        { code: "31103", name: "일산동구", latitude: 37.6585, longitude: 126.7865 },
        { code: "31104", name: "일산서구", latitude: 37.6835, longitude: 126.7570 }
    ]},
    { code: "31190", name: "용인시", latitude: 37.2410, longitude: 127.1775, districts: [
        { code: "31191", name: "처인구", latitude: 37.2343, longitude: 127.2013 },
        { code: "31192", name: "기흥구", latitude: 37.2798, longitude: 127.1147 },
        { code: "31193", name: "수지구", latitude: 37.3298, longitude: 127.0940 }
    ]},
    { code: "31030", name: "의정부시", latitude: 37.7381, longitude: 127.0337 },
    { code: "31060", name: "광명시", latitude: 37.4784, longitude: 126.8647 },
    { code: "31070", name: "평택시", latitude: 36.9921, longitude: 127.1129 },
    { code: "31080", name: "동두천시", latitude: 37.9036, longitude: 127.0604 },
    { code: "31110", name: "과천시", latitude: 37.4292, longitude: 126.9877 },
    { code: "31120", name: "구리시", latitude: 37.5943, longitude: 127.1296 },
    { code: "31130", name: "남양주시", latitude: 37.6360, longitude: 127.2165 },
    { code: "31140", name: "오산시", latitude: 37.1498, longitude: 127.0771 },
    { code: "31150", name: "시흥시", latitude: 37.3801, longitude: 126.8029 },
    { code: "31160", name: "군포시", latitude: 37.3614, longitude: 126.9352 },
    { code: "31170", name: "의왕시", latitude: 37.3447, longitude: 126.9682 },
    { code: "31180", name: "하남시", latitude: 37.5393, longitude: 127.2148 },
    { code: "31200", name: "파주시", latitude: 37.7600, longitude: 126.7798 },
    { code: "31210", name: "이천시", latitude: 37.2806, longitude: 127.4429 },
    { code: "31220", name: "안성시", latitude: 37.0080, longitude: 127.2797 },
    { code: "31230", name: "김포시", latitude: 37.6152, longitude: 126.7157 },
    { code: "31240", name: "화성시", latitude: 37.1995, longitude: 126.8315 },
    { code: "31250", name: "광주시", latitude: 37.4294, longitude: 127.2551 },
    { code: "31260", name: "양주시", latitude: 37.7853, longitude: 127.0458 },
    { code: "31270", name: "포천시", latitude: 37.8949, longitude: 127.2003 },
    { code: "31280", name: "여주시", latitude: 37.2983, longitude: 127.6373 },
    { code: "31310", name: "연천군", latitude: 38.0964, longitude: 127.0749 },
    { code: "31320", name: "가평군", latitude: 37.8315, longitude: 127.5097 },
    { code: "31330", name: "양평군", latitude: 37.4918, longitude: 127.4875 },
  ]},
  { code: "21", name: "부산광역시", latitude: 35.1796, longitude: 129.0756, subRegions: [
    { code: "21010", name: "중구", latitude: 35.1062, longitude: 129.0324 },
    { code: "21020", name: "서구", latitude: 35.0979, longitude: 129.0240 },
    { code: "21030", name: "동구", latitude: 35.1294, longitude: 129.0453 },
    { code: "21040", name: "영도구", latitude: 35.0912, longitude: 129.0678 },
    { code: "21050", name: "부산진구", latitude: 35.1629, longitude: 129.0532 },
    { code: "21060", name: "동래구", latitude: 35.2048, longitude: 129.0747 },
    { code: "21070", name: "남구", latitude: 35.1365, longitude: 129.0842 },
    { code: "21080", name: "북구", latitude: 35.1973, longitude: 128.9905 },
    { code: "21090", name: "해운대구", latitude: 35.1631, longitude: 129.1636 },
    { code: "21100", name: "사하구", latitude: 35.1044, longitude: 128.9749 },
    { code: "21110", name: "금정구", latitude: 35.2429, longitude: 129.0921 },
    { code: "21120", name: "강서구", latitude: 35.2122, longitude: 128.9806 },
    { code: "21130", name: "연제구", latitude: 35.1765, longitude: 129.0795 },
    { code: "21140", name: "수영구", latitude: 35.1456, longitude: 129.1131 },
    { code: "21150", name: "사상구", latitude: 35.1526, longitude: 128.9912 },
    { code: "21310", name: "기장군", latitude: 35.2447, longitude: 129.2223 },
  ]},
  { code: "22", name: "대구광역시", latitude: 35.8714, longitude: 128.6014, subRegions: [
    { code: "22010", name: "중구", latitude: 35.8693, longitude: 128.6062 },
    { code: "22020", name: "동구", latitude: 35.8865, longitude: 128.6355 },
    { code: "22030", name: "서구", latitude: 35.8717, longitude: 128.5593 },
    { code: "22040", name: "남구", latitude: 35.8460, longitude: 128.5977 },
    { code: "22050", name: "북구", latitude: 35.8856, longitude: 128.5830 },
    { code: "22060", name: "수성구", latitude: 35.8580, longitude: 128.6306 },
    { code: "22070", name: "달서구", latitude: 35.8298, longitude: 128.5326 },
    { code: "22310", name: "달성군", latitude: 35.7745, longitude: 128.4314 },
  ]},
  { code: "23", name: "인천광역시", latitude: 37.4563, longitude: 126.7052, subRegions: [
    { code: "23010", name: "중구", latitude: 37.4738, longitude: 126.6217 },
    { code: "23020", name: "동구", latitude: 37.4739, longitude: 126.6328 },
    { code: "23030", name: "남구", latitude: 37.4635, longitude: 126.6502 }, // 미추홀구
    { code: "23040", name: "연수구", latitude: 37.4097, longitude: 126.6782 },
    { code: "23050", name: "남동구", latitude: 37.4473, longitude: 126.7313 },
    { code: "23060", name: "부평구", latitude: 37.5070, longitude: 126.7219 },
    { code: "23070", name: "계양구", latitude: 37.5374, longitude: 126.7377 },
    { code: "23080", name: "서구", latitude: 37.5454, longitude: 126.6760 },
    { code: "23310", name: "강화군", latitude: 37.7464, longitude: 126.4879 },
    { code: "23320", name: "옹진군", latitude: 37.4468, longitude: 126.6368 },
  ]},
  { code: "24", name: "광주광역시", latitude: 35.1595, longitude: 126.8526, subRegions: [
    { code: "24010", name: "동구", latitude: 35.1458, longitude: 126.9234 },
    { code: "24020", name: "서구", latitude: 35.1520, longitude: 126.8900 },
    { code: "24030", name: "남구", latitude: 35.1329, longitude: 126.9025 },
    { code: "24040", name: "북구", latitude: 35.1741, longitude: 126.9120 },
    { code: "24050", name: "광산구", latitude: 35.1395, longitude: 126.7937 },
  ]},
  { code: "25", name: "대전광역시", latitude: 36.3504, longitude: 127.3845, subRegions: [
    { code: "25010", name: "동구", latitude: 36.3120, longitude: 127.4549 },
    { code: "25020", name: "중구", latitude: 36.3250, longitude: 127.4208 },
    { code: "25030", name: "서구", latitude: 36.3553, longitude: 127.3840 },
    { code: "25040", name: "유성구", latitude: 36.3622, longitude: 127.3563 },
    { code: "25050", name: "대덕구", latitude: 36.3466, longitude: 127.4155 },
  ]},
  { code: "26", name: "울산광역시", latitude: 35.5384, longitude: 129.3114, subRegions: [
    { code: "26010", name: "중구", latitude: 35.5695, longitude: 129.3328 },
    { code: "26020", name: "남구", latitude: 35.5437, longitude: 129.3301 },
    { code: "26030", name: "동구", latitude: 35.5048, longitude: 129.4166 },
    { code: "26040", name: "북구", latitude: 35.5828, longitude: 129.3610 },
    { code: "26310", name: "울주군", latitude: 35.5524, longitude: 129.1158 },
  ]},
  { code: "29", name: "세종특별자치시", latitude: 36.4801, longitude: 127.2892, subRegions: [
    { code: "29010", name: "세종시", latitude: 36.4801, longitude: 127.2892 },
  ]},
  { code: "32", name: "강원특별자치도", latitude: 37.8228, longitude: 128.1555, subRegions: [
    { code: "32010", name: "춘천시", latitude: 37.8813, longitude: 127.7298 },
    { code: "32020", name: "원주시", latitude: 37.3422, longitude: 127.9202 },
    { code: "32030", name: "강릉시", latitude: 37.7519, longitude: 128.8761 },
    { code: "32040", name: "동해시", latitude: 37.5247, longitude: 129.1143 },
    { code: "32050", name: "태백시", latitude: 37.1641, longitude: 128.9856 },
    { code: "32060", name: "속초시", latitude: 38.2070, longitude: 128.5918 },
    { code: "32070", name: "삼척시", latitude: 37.4498, longitude: 129.1658 },
    { code: "32310", name: "홍천군", latitude: 37.6970, longitude: 127.8887 },
    { code: "32320", name: "횡성군", latitude: 37.4916, longitude: 127.9850 },
    { code: "32330", name: "영월군", latitude: 37.1836, longitude: 128.4619 },
    { code: "32340", name: "평창군", latitude: 37.3705, longitude: 128.3902 },
    { code: "32350", name: "정선군", latitude: 37.3806, longitude: 128.6608 },
    { code: "32360", name: "철원군", latitude: 38.1468, longitude: 127.3134 },
    { code: "32370", name: "화천군", latitude: 38.1062, longitude: 127.7082 },
    { code: "32380", name: "양구군", latitude: 38.1096, longitude: 127.9897 },
    { code: "32390", name: "인제군", latitude: 38.0697, longitude: 128.1704 },
    { code: "32400", name: "고성군", latitude: 38.3806, longitude: 128.4678 },
    { code: "32410", name: "양양군", latitude: 38.0754, longitude: 128.6189 },
  ]},
  { code: "33", name: "충청북도", latitude: 36.6356, longitude: 127.4913, subRegions: [
    { code: "33010", name: "청주시", latitude: 36.6421, longitude: 127.4891, districts: [
        { code: "33011", name: "상당구", latitude: 36.643, longitude: 127.506 },
        { code: "33012", name: "서원구", latitude: 36.632, longitude: 127.486 },
        { code: "33013", name: "흥덕구", latitude: 36.634, longitude: 127.433 },
        { code: "33014", name: "청원구", latitude: 36.666, longitude: 127.476 }
    ]},
    { code: "33020", name: "충주시", latitude: 36.9916, longitude: 127.9258 },
    { code: "33030", name: "제천시", latitude: 37.1326, longitude: 128.1910 },
    { code: "33310", name: "보은군", latitude: 36.4894, longitude: 127.7291 },
    { code: "33320", name: "옥천군", latitude: 36.3063, longitude: 127.5714 },
    { code: "33330", name: "영동군", latitude: 36.1750, longitude: 127.7770 },
    { code: "33340", name: "진천군", latitude: 36.8553, longitude: 127.4357 },
    { code: "33350", name: "괴산군", latitude: 36.8153, longitude: 127.7960 },
    { code: "33360", name: "음성군", latitude: 36.9403, longitude: 127.6905 },
    { code: "33370", name: "단양군", latitude: 36.9846, longitude: 128.3655 },
    { code: "33380", name: "증평군", latitude: 36.7853, longitude: 127.5815 },
  ]},
  { code: "34", name: "충청남도", latitude: 36.6588, longitude: 126.6730, subRegions: [
    { code: "34010", name: "천안시", latitude: 36.8151, longitude: 127.1139, districts: [
        { code: "34011", name: "동남구", latitude: 36.7766, longitude: 127.1512 },
        { code: "34012", name: "서북구", latitude: 36.8456, longitude: 127.1068 }
    ]},
    { code: "34020", name: "공주시", latitude: 36.4556, longitude: 127.1185 },
    { code: "34030", name: "보령시", latitude: 36.3333, longitude: 126.6129 },
    { code: "34040", name: "아산시", latitude: 36.7898, longitude: 127.0019 },
    { code: "34050", name: "서산시", latitude: 36.7845, longitude: 126.4503 },
    { code: "34060", name: "논산시", latitude: 36.1872, longitude: 127.0987 },
    { code: "34070", name: "계룡시", latitude: 36.2743, longitude: 127.2485 },
    { code: "34080", name: "당진시", latitude: 36.8906, longitude: 126.6293 },
    { code: "34310", name: "금산군", latitude: 36.1087, longitude: 127.4878 },
    { code: "34330", name: "부여군", latitude: 36.2755, longitude: 126.9095 },
    { code: "34340", name: "서천군", latitude: 36.0803, longitude: 126.6914 },
    { code: "34350", name: "청양군", latitude: 36.4588, longitude: 126.8028 },
    { code: "34360", name: "홍성군", latitude: 36.6013, longitude: 126.6608 },
    { code: "34370", name: "예산군", latitude: 36.6885, longitude: 126.8436 },
    { code: "34380", name: "태안군", latitude: 36.7547, longitude: 126.2974 },
  ]},
  { code: "35", name: "전북특별자치도", latitude: 35.7175, longitude: 127.1530, subRegions: [
    { code: "35010", name: "전주시", latitude: 35.8242, longitude: 127.1480, districts: [
        { code: "35011", name: "완산구", latitude: 35.8078, longitude: 127.1352 },
        { code: "35012", name: "덕진구", latitude: 35.8427, longitude: 127.1278 }
    ]},
    { code: "35020", name: "군산시", latitude: 35.9676, longitude: 126.7369 },
    { code: "35030", name: "익산시", latitude: 35.9483, longitude: 126.9578 },
    { code: "35040", name: "정읍시", latitude: 35.5699, longitude: 126.8577 },
    { code: "35050", name: "남원시", latitude: 35.4164, longitude: 127.3904 },
    { code: "35060", name: "김제시", latitude: 35.8036, longitude: 126.8809 },
    { code: "35310", name: "완주군", latitude: 35.9048, longitude: 127.1622 },
    { code: "35320", name: "진안군", latitude: 35.7915, longitude: 127.4248 },
    { code: "35330", name: "무주군", latitude: 36.0068, longitude: 127.6603 },
    { code: "35340", name: "장수군", latitude: 35.6475, longitude: 127.5215 },
    { code: "35350", name: "임실군", latitude: 35.6178, longitude: 127.2890 },
    { code: "35360", name: "순창군", latitude: 35.3744, longitude: 127.1374 },
    { code: "35370", name: "고창군", latitude: 35.4358, longitude: 126.7020 },
    { code: "35380", name: "부안군", latitude: 35.7317, longitude: 126.7334 },
  ]},
  { code: "36", name: "전라남도", latitude: 34.8679, longitude: 126.9910, subRegions: [
    { code: "36010", name: "목포시", latitude: 34.8118, longitude: 126.3922 },
    { code: "36020", name: "여수시", latitude: 34.7604, longitude: 127.6622 },
    { code: "36030", name: "순천시", latitude: 34.9507, longitude: 127.4872 },
    { code: "36040", name: "나주시", latitude: 35.0158, longitude: 126.7108 },
    { code: "36060", name: "광양시", latitude: 34.9407, longitude: 127.6959 },
    { code: "36310", name: "담양군", latitude: 35.3212, longitude: 126.9882 },
    { code: "36320", name: "곡성군", latitude: 35.2820, longitude: 127.2920 },
    { code: "36330", name: "구례군", latitude: 35.2025, longitude: 127.4628 },
    { code: "36350", name: "고흥군", latitude: 34.6111, longitude: 127.2851 },
    { code: "36360", name: "보성군", latitude: 34.7715, longitude: 127.0797 },
    { code: "36370", name: "화순군", latitude: 35.0645, longitude: 126.9863 },
    { code: "36380", name: "장흥군", latitude: 34.6817, longitude: 126.9070 },
    { code: "36390", name: "강진군", latitude: 34.6421, longitude: 126.7672 },
    { code: "36400", name: "해남군", latitude: 34.5735, longitude: 126.5991 },
    { code: "36410", name: "영암군", latitude: 34.8002, longitude: 126.6968 },
    { code: "36420", name: "무안군", latitude: 34.9903, longitude: 126.4817 },
    { code: "36430", name: "함평군", latitude: 35.0658, longitude: 126.5164 },
    { code: "36440", name: "영광군", latitude: 35.2773, longitude: 126.5120 },
    { code: "36450", name: "장성군", latitude: 35.3018, longitude: 126.7849 },
    { code: "36460", name: "완도군", latitude: 34.3109, longitude: 126.7550 },
    { code: "36470", name: "진도군", latitude: 34.4868, longitude: 126.2635 },
    { code: "36480", name: "신안군", latitude: 34.8256, longitude: 126.1118 },
  ]},
  { code: "37", name: "경상북도", latitude: 36.4919, longitude: 128.8889, subRegions: [
    { code: "37010", name: "포항시", latitude: 36.0190, longitude: 129.3435, districts: [
        { code: "37011", name: "남구", latitude: 35.9934, longitude: 129.3557 },
        { code: "37012", name: "북구", latitude: 36.0423, longitude: 129.3644 }
    ]},
    { code: "37020", name: "경주시", latitude: 35.8562, longitude: 129.2248 },
    { code: "37030", name: "김천시", latitude: 36.1398, longitude: 128.1136 },
    { code: "37040", name: "안동시", latitude: 36.5684, longitude: 128.7294 },
    { code: "37050", name: "구미시", latitude: 36.1195, longitude: 128.3443 },
    { code: "37060", name: "영주시", latitude: 36.8056, longitude: 128.6239 },
    { code: "37070", name: "영천시", latitude: 35.9733, longitude: 128.9385 },
    { code: "37080", name: "상주시", latitude: 36.4109, longitude: 128.1591 },
    { code: "37090", name: "문경시", latitude: 36.5865, longitude: 128.1866 },
    { code: "37100", name: "경산시", latitude: 35.8251, longitude: 128.7413 },
    { code: "37310", name: "군위군", latitude: 36.2428, longitude: 128.5728 },
    { code: "37320", name: "의성군", latitude: 36.3527, longitude: 128.6971 },
    { code: "37330", name: "청송군", latitude: 36.4363, longitude: 129.0573 },
    { code: "37340", name: "영양군", latitude: 36.6669, longitude: 129.1124 },
    { code: "37350", name: "영덕군", latitude: 36.4109, longitude: 129.3654 },
    { code: "37360", name: "청도군", latitude: 35.6474, longitude: 128.7340 },
    { code: "37370", name: "고령군", latitude: 35.7250, longitude: 128.2629 },
    { code: "37380", name: "성주군", latitude: 35.9190, longitude: 128.2830 },
    { code: "37390", name: "칠곡군", latitude: 35.9958, longitude: 128.4016 },
    { code: "37400", name: "예천군", latitude: 36.6547, longitude: 128.4528 },
    { code: "37410", name: "봉화군", latitude: 36.8931, longitude: 128.7323 },
    { code: "37420", name: "울진군", latitude: 36.9931, longitude: 129.4004 },
    { code: "37430", name: "울릉군", latitude: 37.4844, longitude: 130.9056 },
  ]},
  { code: "38", name: "경상남도", latitude: 35.4606, longitude: 128.2132, subRegions: [
    { code: "38110", name: "창원시", latitude: 35.2279, longitude: 128.6819, districts: [
        { code: "38111", name: "의창구", latitude: 35.2530, longitude: 128.6397 },
        { code: "38112", name: "성산구", latitude: 35.2158, longitude: 128.6830 },
        { code: "38113", name: "마산합포구", latitude: 35.1848, longitude: 128.5647 },
        { code: "38114", name: "마산회원구", latitude: 35.2223, longitude: 128.5835 },
        { code: "38115", name: "진해구", latitude: 35.1509, longitude: 128.7202 }
    ]},
    { code: "38030", name: "진주시", latitude: 35.1802, longitude: 128.1076 },
    { code: "38050", name: "통영시", latitude: 34.8544, longitude: 128.4332 },
    { code: "38060", name: "사천시", latitude: 35.0038, longitude: 128.0642 },
    { code: "38070", name: "김해시", latitude: 35.2285, longitude: 128.8893 },
    { code: "38080", name: "밀양시", latitude: 35.5038, longitude: 128.7466 },
    { code: "38090", name: "거제시", latitude: 34.8806, longitude: 128.6211 },
    { code: "38100", name: "양산시", latitude: 35.3385, longitude: 129.0264 },
    { code: "38310", name: "의령군", latitude: 35.3221, longitude: 128.2618 },
    { code: "38320", name: "함안군", latitude: 35.2725, longitude: 128.4065 },
    { code: "38330", name: "창녕군", latitude: 35.5446, longitude: 128.4922 },
    { code: "38340", name: "고성군", latitude: 34.9757, longitude: 128.3235 },
    { code: "38350", name: "남해군", latitude: 34.8377, longitude: 127.8924 },
    { code: "38360", name: "하동군", latitude: 35.0672, longitude: 127.7513 },
    { code: "38370", name: "산청군", latitude: 35.4156, longitude: 127.8735 },
    { code: "38380", name: "함양군", latitude: 35.5205, longitude: 127.7252 },
    { code: "38390", name: "거창군", latitude: 35.6867, longitude: 127.9095 },
    { code: "38400", name: "합천군", latitude: 35.5666, longitude: 128.1658 },
  ]},
  { code: "39", name: "제주특별자치도", latitude: 33.4890, longitude: 126.4983, subRegions: [
    { code: "39010", name: "제주시", latitude: 33.4996, longitude: 126.5312 },
    { code: "39020", name: "서귀포시", latitude: 33.2541, longitude: 126.5601 },
  ]},
];

/**
 * 지역코드로 지역 정보 찾기
 */
export function findRegionByCode(regionCode: string): RegionData | undefined {
  return REGIONS.find((r) => r.code === regionCode);
}

/**
 * 세부지역코드로 정보 찾기
 */
export function findSubRegionByCode(dtlRegionCode: string): { region: RegionData; subRegion: SubRegion; district?: District } | undefined {
  for (const region of REGIONS) {
    if (region.subRegions) {
      for (const subRegion of region.subRegions) {
        if (subRegion.code === dtlRegionCode) {
          return { region, subRegion };
        }
        if (subRegion.districts) {
          const district = subRegion.districts.find(d => d.code === dtlRegionCode);
          if (district) {
            return { region, subRegion, district };
          }
        }
      }
    }
  }
  return undefined;
}

/**
 * [자동 검증 로직] 
 * 구(Gu) 단위 정보가 반드시 있어야 하는 주요 시 목록
 * 이 목록에 있는 도시가 districts를 가지고 있지 않으면 경고/에러를 발생시킵니다.
 */
const REQUIRED_DISTRICTS = [
  { code: "31010", name: "수원시" },
  { code: "31020", name: "성남시" },
  { code: "31040", name: "안양시" },
  { code: "31050", name: "부천시" },
  { code: "31090", name: "안산시" },
  { code: "31100", name: "고양시" },
  { code: "31190", name: "용인시" },
  { code: "33010", name: "청주시" },
  { code: "34010", name: "천안시" },
  { code: "35010", name: "전주시" },
  { code: "37010", name: "포항시" },
  { code: "38110", name: "창원시" },
];

export function validateRegions(): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  REQUIRED_DISTRICTS.forEach((target) => {
    let found = false;
    for (const region of REGIONS) {
      const sub = region.subRegions?.find(s => s.code === target.code);
      if (sub) {
        if (!sub.districts || sub.districts.length === 0) {
          errors.push(`${target.name}(${target.code})에 구(Gu) 단위 정보가 없습니다.`);
        }
        found = true;
        break;
      }
    }
    if (!found) {
      errors.push(`${target.name}(${target.code}) 지역 데이터 자체가 존재하지 않습니다.`);
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}

// 개발 모드에서 데이터 자동 검증 실행
if (process.env.NODE_ENV === "development") {
  const validation = validateRegions();
  if (!validation.success) {
    console.error("❌ [Region Data Error] 지역 데이터에 결함이 발견되었습니다:");
    validation.errors.forEach(err => console.error(`  - ${err}`));
  }
}
