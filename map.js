const mapShell = document.getElementById('mapShell');
const currentBasemapName = document.getElementById('currentBasemapName');

const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    minZoom: 6,
    maxZoom: 12,
    preferCanvas: true
});

/* =========================
   图层层级
========================= */
map.createPane('maskPane');
map.getPane('maskPane').style.zIndex = 390;

map.createPane('boundaryPane');
map.getPane('boundaryPane').style.zIndex = 410;

map.createPane('routeGlowPane');
map.getPane('routeGlowPane').style.zIndex = 430;

map.createPane('routePane');
map.getPane('routePane').style.zIndex = 440;

map.createPane('stationHighlightPane');
map.getPane('stationHighlightPane').style.zIndex = 445;

map.createPane('stationPane');
map.getPane('stationPane').style.zIndex = 450;

/* =========================
   底图
========================= */

// 古风底图
const antiqueBaseMap = L.tileLayer(
    'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
    {
        maxZoom: 18,
        opacity: 0.88,
        attribution: '© 高德地图'
    }
);

// 实景影像
const satelliteBaseMap = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        maxZoom: 18,
        opacity: 0.96,
        attribution: 'Tiles © Esri'
    }
);

antiqueBaseMap.addTo(map);

// 比例尺
L.control.scale({
    position: 'bottomright',
    imperial: false
}).addTo(map);

// 云南省边界 GeoJSON
const YUNNAN_GEOJSON_URL =
    'https://geo.datav.aliyun.com/areas_v3/bound/530000_full.json';

/* =========================
   28 个驿站数据
========================= */
const postStations = [
    {
        name: "云南驿",
        pos: [25.39156, 100.68458],
        route: "west",
        location: "大理州祥云县云南驿镇",
        history: "与“云南”之名的形成密切相关。西汉元封二年在此设云南县，明代县治迁移后逐渐转为驿站。",
        dynasty: "西汉设县，明代成为正式驿站，清代为茶马古道重要集散地。",
        duty: "接待官员、传递公文军情、服务马帮商队；二战时期又与“驼峰航线”相关。"
    },
    {
        name: "炼象关",
        pos: [25.043, 102.154],
        route: "west",
        location: "楚雄州禄丰市炼象关一带",
        history: "唐称“龙和馆”，明代因关隘地势险要而称“炼象关”，有“扼九郡之咽喉”之称。",
        dynasty: "唐代设馆驿，明洪武十六年正式设关。",
        duty: "兼具官道驿传、军事防御和盐运转输功能。"
    },
    {
        name: "那柯里驿站",
        pos: [22.91187, 101.03713],
        route: "south",
        location: "普洱市宁洱县那柯里",
        history: "原名“马哭里”，后更名“那柯里”，是古普洱府茶马古道上的重要驿站。",
        dynasty: "驿站历史可追溯至唐代。",
        duty: "供马帮商队歇脚、食宿、交换货物与信息，是普洱茶外运的重要节点。"
    },
    {
        name: "平坡铺",
        pos: [25.215, 99.230],
        route: "west",
        location: "保山市隆阳区水寨乡平坡村",
        history: "位于澜沧江西岸，是古道进入保山地区的第一个驿铺。",
        dynasty: "汉晋时期已开辟，明代扩建。",
        duty: "管理兰津渡口、保障渡江安全，并承担马帮翻山后的休整接待。"
    },
    {
        name: "鲁史古镇",
        pos: [24.84435, 99.99616],
        route: "south",
        location: "临沧市凤庆县鲁史镇",
        history: "原称“阿鲁司”，是滇南通往下关、昆明、丽江、西藏乃至印度的重要驿站。",
        dynasty: "明万历年间已设“阿鲁司巡检”。",
        duty: "负责地方治安、驿道管理、接待往来，并发展为商贸转运重镇。"
    },
    {
        name: "沙桥驿",
        pos: [25.18, 101.23],
        route: "west",
        location: "楚雄州南华县沙桥镇",
        history: "汉代以来称“沙却驿”，明代称“沙桥驿”，位于滇池—洱海交通线上。",
        dynasty: "汉代设驿，明清继续沿用。",
        duty: "转运物资、接待使团，是“八郡通衢”的重要节点。"
    },
    {
        name: "吕阁驿",
        pos: [25.14643, 101.37298],
        route: "west",
        location: "楚雄市吕合镇一带",
        history: "属滇洱道沿线驿站，与沙桥驿、路甸驿共同构成东西向主干官道节点。",
        dynasty: "元明清时期持续发挥驿传作用。",
        duty: "保障官道通行、文书传递、官员接待和后勤补给。"
    },
    {
        name: "路甸驿",
        pos: [25.28, 101.82],
        route: "west",
        location: "楚雄州禄丰市广通镇",
        history: "滇洱道上的著名站点之一，连接滇中与滇西。",
        dynasty: "元明清时期的重要驿站。",
        duty: "承担官方交通、物资补给和旅客中转。"
    },
    {
        name: "多罗驿",
        pos: [25.67, 104.25],
        route: "east",
        location: "曲靖市富源县境内",
        history: "为进出云南的东路要驿。",
        dynasty: "元代设置，明代继续发挥交通枢纽作用。",
        duty: "为官员与信使提供食宿、更换马匹，并传递文书军情。"
    },
    {
        name: "和曲驿",
        pos: [25.54, 102.37],
        route: "north",
        location: "楚雄州武定县一带",
        history: "川滇官道上的重要驿站。",
        dynasty: "元代为加强川滇交通而设置。",
        duty: "官员接待、换马补给、公文和军情传递。"
    },
    {
        name: "虚仁驿",
        pos: [25.75, 102.15],
        route: "north",
        location: "楚雄州武定县虚仁村附近",
        history: "与和曲驿同属川滇要驿。",
        dynasty: "元代设置。",
        duty: "维系昆明—武定—四川方向驿道运行。"
    },
    {
        name: "白崖堡",
        pos: [25.34, 100.42],
        route: "west",
        location: "大理州弥渡县红岩一带",
        history: "滇西交通枢纽之一，在地区“无驿”背景下，以军堡形式承担驿传功能。",
        dynasty: "明洪武年间设置。",
        duty: "物资运输、接待使客、飞报军情、转运军需。"
    },
    {
        name: "石岑堡",
        pos: [25.68, 104.27],
        route: "east",
        location: "曲靖市富源县境内",
        history: "又名多罗堡，与多罗驿关系密切。",
        dynasty: "明代设置。",
        duty: "兼具防御、屯田和递运功能。"
    },
    {
        name: "杨林驿",
        pos: [25.27, 103.12],
        route: "east",
        location: "昆明市嵩明县杨林镇",
        history: "滇东要道上的重要站点，素有“滇东锁钥”之称。",
        dynasty: "元代设立，明清沿用。",
        duty: "传递文书、接待商旅；明代兰茂曾在当地行医济世。"
    },
    {
        name: "板桥驿",
        pos: [25.05639, 102.87502],
        route: "east",
        location: "昆明市官渡区大板桥街道",
        history: "旧时从昆明东行的第一站。",
        dynasty: "明代设立。",
        duty: "接待出入省城官员、传递公文，是东行商旅的重要补给点。"
    },
    {
        name: "茶庵塘",
        pos: [23.15981, 101.13938],
        route: "south",
        location: "普洱市宁洱县北部茶庵塘古道遗址一带",
        history: "因茶庵庙与军事关卡“汛塘”而得名，驿道崎岖险峻，被称作“茶庵鸟道”。",
        dynasty: "清代设置，元明以来即为重要关哨区域。",
        duty: "设茶站、庙堂、马店，并向马帮施茶解乏，兼具军事驻守功能。"
    },
    {
        name: "碧鸡关",
        pos: [25.00609, 102.62586],
        route: "west",
        location: "昆明市西山区碧鸡关垭口",
        history: "滇中通向滇西的重要关隘。",
        dynasty: "明代正式设关。",
        duty: "盘查行旅货物，守护省城西大门，是明清时期昆明西出的关键门户。"
    },
    {
        name: "胜境关",
        pos: [25.65167, 104.32639],
        route: "east",
        location: "曲靖市富源县滇黔交界地带",
        history: "云南东大门，素有“入滇第一关”之称。",
        dynasty: "元代开辟驿道，明代正式设关驻守。",
        duty: "接待官员、传递军政文书，并承担边境交通防御功能。"
    },
    {
        name: "江苴古驿",
        pos: [25.27094, 98.65234],
        route: "west",
        location: "保山市腾冲市曲石镇江苴一带",
        history: "高黎贡山古道翻山后的重要节点，属西南丝绸之路体系。",
        dynasty: "汉代起兴起，明清时期更为繁盛。",
        duty: "接待翻越高黎贡山的马帮与商旅，提供休整补给。"
    },
    {
        name: "可渡关驿道",
        pos: [26.63074, 104.28616],
        route: "east",
        location: "曲靖市宣威市杨柳镇可渡村一带",
        history: "古代由黔入滇的咽喉要道，前身可追溯到秦代“五尺道”。",
        dynasty: "秦汉以来持续使用，明清仍为重要驿道。",
        duty: "军政文书传递、关防驻守、联系中原与云南。"
    },
    {
        name: "杉阳驿",
        pos: [25.31977, 99.38881],
        route: "west",
        location: "大理州永平县杉阳镇",
        history: "位于澜沧江东岸，是翻越博南山前后与兰津古渡相关的重要集散点。",
        dynasty: "明代设立。",
        duty: "承担渡江口岸补给和物资转运。"
    },
    {
        name: "老鸦关",
        pos: [25.10, 102.03],
        route: "west",
        location: "楚雄州禄丰市境内",
        history: "滇西“九关十八铺”之一。",
        dynasty: "明清时期的重要关口。",
        duty: "商旅稽查、官员接待、保障古道安全。"
    },
    {
        name: "回蹬关",
        pos: [25.08, 101.97],
        route: "west",
        location: "楚雄州禄丰市境内",
        history: "同属滇西“九关十八铺”，其名与地方传说相关。",
        dynasty: "明清时期。",
        duty: "关口驻防和官道秩序维护。"
    },
    {
        name: "蒙七铺",
        pos: [25.06, 101.92],
        route: "west",
        location: "楚雄州禄丰市一平浪镇附近",
        history: "连接炼象关与回蹬关之间的重要铺递。",
        dynasty: "明清时期。",
        duty: "食宿补给、井盐外运转运。"
    },
    {
        name: "蛮英驿站",
        pos: [25.85, 98.86],
        route: "west",
        location: "怒江州泸水市高黎贡山灰坡古道旁",
        history: "古道西渡怒江后的第一站，名称沿用时间很长。",
        dynasty: "战国古道沿线，正式设驿可追溯至东汉。",
        duty: "提供渡江补给、歇脚住宿和商旅中转。"
    },
    {
        name: "脚底莫驿站",
        pos: [24.06, 101.82],
        route: "south",
        location: "玉溪市新平县境内",
        history: "清代因地理位置特殊，由过往商旅逐步自发建成。",
        dynasty: "清道光六年后发展明显。",
        duty: "成为新平通往元江、墨江、镇沅方向的重要民间驿站。"
    },
    {
        name: "犀牛街驿站",
        pos: [24.68, 100.12],
        route: "south",
        location: "大理州巍山县与临沧凤庆交界区域",
        history: "茶马古道上的重要驿站，连接巍山、凤庆等地商贸往来。",
        dynasty: "明清时期。",
        duty: "接待马帮、转运货物，是区域物资集散点。"
    },
    {
        name: "施甸驿",
        pos: [24.73, 99.18],
        route: "south",
        location: "保山市施甸县",
        history: "位于保山至临沧的古道上。",
        dynasty: "明清时期。",
        duty: "为商旅与官员提供食宿、换马服务，促进滇西内部联通。"
    }
];

document.getElementById('stationCount').textContent = postStations.length;

/* =========================
   路线样式
========================= */
const routeStyle = {
    west: {
        name: '滇西古驿道',
        color: '#b85c38'
    },
    south: {
        name: '滇南茶马道',
        color: '#5f8d4e'
    },
    east: {
        name: '滇东入滇道',
        color: '#416b9a'
    },
    north: {
        name: '川滇联络道',
        color: '#8b5aa6'
    }
};

/* =========================
   原始路线顺序
========================= */
const routePlan = {
    west: [
        '碧鸡关',
        '炼象关',
        '老鸦关',
        '蒙七铺',
        '回蹬关',
        '路甸驿',
        '吕阁驿',
        '沙桥驿',
        '云南驿',
        '白崖堡',
        '杉阳驿',
        '平坡铺',
        '江苴古驿',
        '蛮英驿站'
    ],
    south: [
        '云南驿',
        '犀牛街驿站',
        '鲁史古镇',
        '施甸驿',
        '脚底莫驿站',
        '茶庵塘',
        '那柯里驿站'
    ],
    east: [
        '板桥驿',
        '杨林驿',
        '多罗驿',
        '石岑堡',
        '胜境关',
        '可渡关驿道'
    ],
    north: [
        '虚仁驿',
        '和曲驿'
    ]
};

/* =========================
   视觉路线方案
   在原来驿站顺序基础上加入少量过渡点
   让线路更接近道路走向，而不是直连
========================= */
const routeVisualPlan = {
    west: [
        '碧鸡关',
        [25.03, 102.40],
        '炼象关',
        [25.08, 102.08],
        '老鸦关',
        [25.09, 101.99],
        '蒙七铺',
        [25.11, 101.95],
        '回蹬关',
        [25.17, 101.88],
        '路甸驿',
        [25.22, 101.58],
        '吕阁驿',
        '沙桥驿',
        [25.23, 100.98],
        '云南驿',
        [25.36, 100.54],
        '白崖堡',
        [25.35, 100.02],
        '杉阳驿',
        [25.30, 99.30],
        '平坡铺',
        [25.31, 98.98],
        '江苴古驿',
        [25.50, 98.78],
        '蛮英驿站'
    ],
    south: [
        '云南驿',
        [25.14, 100.52],
        '犀牛街驿站',
        [24.86, 100.03],
        '鲁史古镇',
        [24.77, 99.55],
        '施甸驿',
        [24.58, 100.30],
        [24.31, 101.18],
        '脚底莫驿站',
        [23.58, 101.36],
        '茶庵塘',
        [23.02, 101.08],
        '那柯里驿站'
    ],
    east: [
        '板桥驿',
        [25.14, 102.98],
        '杨林驿',
        [25.37, 103.42],
        [25.53, 103.84],
        '多罗驿',
        '石岑堡',
        [25.66, 104.30],
        '胜境关',
        [25.92, 104.29],
        [26.22, 104.29],
        '可渡关驿道'
    ],
    north: [
        '虚仁驿',
        [25.67, 102.28],
        '和曲驿'
    ]
};

/* =========================
   工具函数
========================= */
function escapeHtml(text) {
    return String(text ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function buildPopupHtml(station) {
    const route = routeStyle[station.route];

    return `
        <div class="popup-inner">
            <h4>📍 ${escapeHtml(station.name)}</h4>

            <span class="route-badge" style="--badge-color:${route.color}">
                ${escapeHtml(route.name)}
            </span>

            <span class="section-title">具体位置</span>
            <p class="section-content">${escapeHtml(station.location)}</p>

            <span class="section-title">地点与历史沿革</span>
            <p class="section-content">${escapeHtml(station.history)}</p>

            <span class="section-title">设置朝代</span>
            <p class="section-content">${escapeHtml(station.dynasty)}</p>

            <span class="section-title">主要工作与职能</span>
            <p class="section-content">${escapeHtml(station.duty)}</p>
        </div>
    `;
}

function getStationPosition(name) {
    const station = postStations.find(item => item.name === name);
    return station ? station.pos : null;
}

/* =========================
   重点驿站圈层
========================= */
const highlightedStations = new Set([
    '云南驿',
    '炼象关',
    '那柯里驿站',
    '碧鸡关',
    '胜境关',
    '江苴古驿'
]);

/* =========================
   驿站点
========================= */
postStations.forEach(station => {
    const route = routeStyle[station.route];

    if (highlightedStations.has(station.name)) {
        L.circleMarker(station.pos, {
            pane: 'stationHighlightPane',
            radius: 15,
            color: route.color,
            weight: 2.6,
            opacity: 0.92,
            fillColor: route.color,
            fillOpacity: 0.06,
            interactive: false
        }).addTo(map);
    }

    const marker = L.circleMarker(station.pos, {
        pane: 'stationPane',
        radius: 8,
        fillColor: route.color,
        color: '#fff0d2',
        weight: 3,
        fillOpacity: 1,
        opacity: 1
    }).addTo(map);

    marker.bindTooltip(station.name, {
        direction: 'top',
        offset: [0, -10],
        className: 'station-tooltip'
    });

    marker.bindPopup(buildPopupHtml(station), {
        className: 'custom-popup',
        maxWidth: 400,
        autoPanPaddingTopLeft: [40, 40],
        autoPanPaddingBottomRight: [430, 40]
    });

    marker.on('mouseover', function () {
        marker.setStyle({
            radius: 11,
            weight: 4
        });
    });

    marker.on('mouseout', function () {
        marker.setStyle({
            radius: 8,
            weight: 3
        });
    });
});

/* =========================
   弯曲路线
========================= */
function buildSmoothRoad(points) {
    if (!points || points.length < 2) return [];

    if (points.length === 2) {
        return buildTwoPointCurve(points[0], points[1]);
    }

    const smoothPoints = [];
    const tension = 0.24;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        for (let t = 0; t <= 1; t += 0.05) {
            const t2 = t * t;
            const t3 = t2 * t;

            const m1Lat = tension * (p2[0] - p0[0]);
            const m1Lng = tension * (p2[1] - p0[1]);
            const m2Lat = tension * (p3[0] - p1[0]);
            const m2Lng = tension * (p3[1] - p1[1]);

            const h00 = 2 * t3 - 3 * t2 + 1;
            const h10 = t3 - 2 * t2 + t;
            const h01 = -2 * t3 + 3 * t2;
            const h11 = t3 - t2;

            const lat =
                h00 * p1[0] +
                h10 * m1Lat +
                h01 * p2[0] +
                h11 * m2Lat;

            const lng =
                h00 * p1[1] +
                h10 * m1Lng +
                h01 * p2[1] +
                h11 * m2Lng;

            smoothPoints.push([lat, lng]);
        }
    }

    smoothPoints.push(points[points.length - 1]);
    return smoothPoints;
}

function buildTwoPointCurve(start, end) {
    const curvePoints = [];

    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;

    const deltaLat = end[0] - start[0];
    const deltaLng = end[1] - start[1];

    const controlPoint = [
        midLat + deltaLng * 0.18,
        midLng - deltaLat * 0.18
    ];

    for (let t = 0; t <= 1; t += 0.04) {
        const lat =
            Math.pow(1 - t, 2) * start[0] +
            2 * (1 - t) * t * controlPoint[0] +
            Math.pow(t, 2) * end[0];

        const lng =
            Math.pow(1 - t, 2) * start[1] +
            2 * (1 - t) * t * controlPoint[1] +
            Math.pow(t, 2) * end[1];

        curvePoints.push([lat, lng]);
    }

    return curvePoints;
}

function drawRoadRoute(points, color) {
    const roadPoints = buildSmoothRoad(points);

    if (!roadPoints || roadPoints.length < 2) return;

    L.polyline(roadPoints, {
        pane: 'routeGlowPane',
        color: color,
        weight: 11,
        opacity: 0.15,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
    }).addTo(map);

    L.polyline(roadPoints, {
        pane: 'routePane',
        color: color,
        weight: 4.2,
        opacity: 0.92,
        dashArray: '12, 10',
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
    }).addTo(map);
}

function resolveVisualRoutePoints(items) {
    return items
        .map(item => {
            if (Array.isArray(item)) {
                return item;
            }
            return getStationPosition(item);
        })
        .filter(Boolean);
}

Object.entries(routeVisualPlan).forEach(([routeKey, routeItems]) => {
    const points = resolveVisualRoutePoints(routeItems);
    drawRoadRoute(points, routeStyle[routeKey].color);
});

/* =========================
   云南边界与遮罩
========================= */
function convertRingToLatLng(ring) {
    return ring.map(([lng, lat]) => [lat, lng]);
}

let yunnanLayer = null;
let maskLayer = null;

function buildIsolationMask(geojson) {
    const worldOuter = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
        [-90, -180]
    ];

    const holes = [];

    geojson.features.forEach(feature => {
        const geometry = feature.geometry;
        if (!geometry) return;

        if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach((ring, index) => {
                if (index === 0) {
                    holes.push(convertRingToLatLng(ring));
                }
            });
        }

        if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygon => {
                polygon.forEach((ring, index) => {
                    if (index === 0) {
                        holes.push(convertRingToLatLng(ring));
                    }
                });
            });
        }
    });

    return L.polygon([worldOuter, ...holes], {
        pane: 'maskPane',
        color: 'transparent',
        fillColor: '#ead8b5',
        fillOpacity: 0.90,
        weight: 0,
        interactive: false
    });
}

/* =========================
   底图切换
========================= */
function updateVisualMode(mode) {
    if (mode === 'satellite') {
        mapShell.classList.add('satellite-mode');
        currentBasemapName.textContent = '实景影像';

        if (maskLayer) {
            maskLayer.setStyle({
                fillOpacity: 0.82
            });
        }

        if (yunnanLayer) {
            yunnanLayer.setStyle({
                color: '#f3d3a4',
                weight: 2,
                opacity: 1,
                fillColor: '#fff1d6',
                fillOpacity: 0.04
            });
        }
    } else {
        mapShell.classList.remove('satellite-mode');
        currentBasemapName.textContent = '古风底图';

        if (maskLayer) {
            maskLayer.setStyle({
                fillOpacity: 0.90
            });
        }

        if (yunnanLayer) {
            yunnanLayer.setStyle({
                color: '#8a6338',
                weight: 1.8,
                opacity: 0.88,
                fillColor: '#ead7ac',
                fillOpacity: 0.10
            });
        }
    }
}

document.querySelectorAll('.basemap-btn').forEach(button => {
    button.addEventListener('click', () => {
        const mode = button.dataset.basemap;

        document.querySelectorAll('.basemap-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        button.classList.add('active');

        if (mode === 'satellite') {
            if (map.hasLayer(antiqueBaseMap)) {
                map.removeLayer(antiqueBaseMap);
            }

            if (!map.hasLayer(satelliteBaseMap)) {
                satelliteBaseMap.addTo(map);
            }

            updateVisualMode('satellite');
        } else {
            if (map.hasLayer(satelliteBaseMap)) {
                map.removeLayer(satelliteBaseMap);
            }

            if (!map.hasLayer(antiqueBaseMap)) {
                antiqueBaseMap.addTo(map);
            }

            updateVisualMode('antique');
        }
    });
});

/* =========================
   加载云南边界
========================= */
fetch(YUNNAN_GEOJSON_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error('云南边界数据加载失败');
        }
        return response.json();
    })
    .then(yunnanGeoJSON => {
        maskLayer = buildIsolationMask(yunnanGeoJSON);
        maskLayer.addTo(map);

        yunnanLayer = L.geoJSON(yunnanGeoJSON, {
            pane: 'boundaryPane',
            style: {
                color: '#8a6338',
                weight: 1.8,
                opacity: 0.88,
                fillColor: '#ead7ac',
                fillOpacity: 0.10
            },
            interactive: false
        }).addTo(map);

        const bounds = yunnanLayer.getBounds();

        map.fitBounds(bounds, {
            paddingTopLeft: [260, 150],
            paddingBottomRight: [430, 120],
            animate: false
        });

        map.setMaxBounds(bounds.pad(0.06));
    })
    .catch(error => {
        console.warn('云南边界数据加载失败：', error);

        const fallbackBounds = L.latLngBounds(
            [21.0, 97.0],
            [29.5, 106.5]
        );

        map.fitBounds(fallbackBounds, {
            paddingTopLeft: [260, 150],
            paddingBottomRight: [430, 120],
            animate: false
        });

        map.setMaxBounds(fallbackBounds.pad(0.06));
    });