/**
 * MahjongData - 麻将牌数据定义模块
 * 
 * 将麻将牌的静态数据（名称、类型映射等）从MahjongMgr组件中解耦，
 * 使得纯数据逻辑可以独立测试和复用。
 */

// 麻将牌名称映射表
var TILE_NAMES = [];

// 筒 (Dots) - ID: 0-8
for (var i = 1; i < 10; ++i) {
    TILE_NAMES.push("dot_" + i);
}

// 条 (Bamboo) - ID: 9-17
for (var i = 1; i < 10; ++i) {
    TILE_NAMES.push("bamboo_" + i);
}

// 万 (Characters) - ID: 18-26
for (var i = 1; i < 10; ++i) {
    TILE_NAMES.push("character_" + i);
}

// 中、发、白 (Dragons)
TILE_NAMES.push("red");
TILE_NAMES.push("green");
TILE_NAMES.push("white");

// 东西南北风 (Winds)
TILE_NAMES.push("wind_east");
TILE_NAMES.push("wind_west");
TILE_NAMES.push("wind_south");
TILE_NAMES.push("wind_north");

// 牌类型常量
var TILE_TYPE = {
    TONG: 0,      // 筒
    TIAO: 1,      // 条
    WAN: 2,       // 万
    HONOR: 3,     // 字牌
};

// 视角前缀映射
var SIDE_NAMES = ["myself", "right", "up", "left"];
var SIDE_PREFIXES = ["M_", "R_", "B_", "L_"];
var FOLD_PREFIXES = ["B_", "R_", "B_", "L_"];

var MahjongData = {
    TILE_NAMES: TILE_NAMES,
    TILE_TYPE: TILE_TYPE,
    SIDE_NAMES: SIDE_NAMES,
    SIDE_PREFIXES: SIDE_PREFIXES,
    FOLD_PREFIXES: FOLD_PREFIXES,
    
    /**
     * 根据牌ID获取牌名称
     * @param {number} id - 牌ID
     * @returns {string} 牌名称
     */
    getTileNameByID: function(id) {
        return TILE_NAMES[id];
    },
    
    /**
     * 根据牌ID获取牌类型
     * @param {number} id - 牌ID
     * @returns {number} 类型 (0=筒, 1=条, 2=万, 3=字)
     */
    getTileType: function(id) {
        if (id >= 0 && id < 9) {
            return TILE_TYPE.TONG;
        } else if (id >= 9 && id < 18) {
            return TILE_TYPE.TIAO;
        } else if (id >= 18 && id < 27) {
            return TILE_TYPE.WAN;
        }
        return TILE_TYPE.HONOR;
    },
    
    /**
     * 根据牌ID获取音频URL
     * @param {number} id - 牌ID
     * @returns {string} 音频路径
     */
    getAudioURLByTileID: function(id) {
        var realId = 0;
        if (id >= 0 && id < 9) {
            realId = id + 21;
        } else if (id >= 9 && id < 18) {
            realId = id - 8;
        } else if (id >= 18 && id < 27) {
            realId = id - 7;
        }
        return "nv/" + realId + ".mp3";
    },
    
    /**
     * 对麻将牌排序（支持定缺）
     * @param {number[]} mahjongs - 牌ID数组
     * @param {number} dingque - 定缺类型（-1表示未定缺）
     */
    sortTiles: function(mahjongs, dingque) {
        var self = this;
        mahjongs.sort(function(a, b) {
            if (dingque >= 0) {
                var t1 = self.getTileType(a);
                var t2 = self.getTileType(b);
                if (t1 !== t2) {
                    if (dingque === t1) {
                        return 1;
                    } else if (dingque === t2) {
                        return -1;
                    }
                }
            }
            return a - b;
        });
    },
    
    /**
     * 获取视角名称
     * @param {number} localIndex - 本地索引
     * @returns {string} 视角名称
     */
    getSide: function(localIndex) {
        return SIDE_NAMES[localIndex];
    },
    
    /**
     * 获取视角前缀
     * @param {number} localIndex - 本地索引
     * @returns {string} 前缀
     */
    getPrefix: function(localIndex) {
        return SIDE_PREFIXES[localIndex];
    },
    
    /**
     * 获取折叠视角前缀
     * @param {number} localIndex - 本地索引
     * @returns {string} 前缀
     */
    getFoldPrefix: function(localIndex) {
        return FOLD_PREFIXES[localIndex];
    }
};

module.exports = MahjongData;
