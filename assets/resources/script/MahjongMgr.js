var MahjongData = require('MahjongData');

/**
 * MahjongMgr - 麻将精灵管理组件
 * 
 * 负责管理麻将牌的精灵图集和UI展示。
 * 纯数据逻辑已解耦到MahjongData模块中，此组件仅处理
 * 与Cocos Creator渲染相关的功能。
 */
cc.Class({
    extends: cc.Component,

    properties: {
        leftAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        rightAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        bottomAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        bottomFoldAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        pengPrefabSelf:{
            default:null,
            type:cc.Prefab
        },
        
        pengPrefabLeft:{
            default:null,
            type:cc.Prefab
        },
        
        emptyAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        holdsEmpty:{
            default:[],
            type:[cc.SpriteFrame]
        },
    },
    
    onLoad:function(){
        if(cc.vv == null){
            return;
        }
        cc.vv.mahjongmgr = this; 
    },
    
    getMahjongSpriteByID:function(id){
        return MahjongData.getTileNameByID(id);
    },
    
    getMahjongType:function(id){
        return MahjongData.getTileType(id);
    },
    
    getSpriteFrameByMJID:function(pre,mjid){
        var spriteFrameName = this.getMahjongSpriteByID(mjid);
        spriteFrameName = pre + spriteFrameName;
        if(pre == "M_"){
            return this.bottomAtlas.getSpriteFrame(spriteFrameName);            
        }
        else if(pre == "B_"){
            return this.bottomFoldAtlas.getSpriteFrame(spriteFrameName);
        }
        else if(pre == "L_"){
            return this.leftAtlas.getSpriteFrame(spriteFrameName);
        }
        else if(pre == "R_"){
            return this.rightAtlas.getSpriteFrame(spriteFrameName);
        }
    },
    
    getAudioURLByMJID:function(id){
        return MahjongData.getAudioURLByTileID(id);
    },
    
    getEmptySpriteFrame:function(side){
        if(side == "up"){
            return this.emptyAtlas.getSpriteFrame("e_mj_b_up");
        }   
        else if(side == "myself"){
            return this.emptyAtlas.getSpriteFrame("e_mj_b_bottom");
        }
        else if(side == "left"){
            return this.emptyAtlas.getSpriteFrame("e_mj_b_left");
        }
        else if(side == "right"){
            return this.emptyAtlas.getSpriteFrame("e_mj_b_right");
        }
    },
    
    getHoldsEmptySpriteFrame:function(side){
        if(side == "up"){
            return this.emptyAtlas.getSpriteFrame("e_mj_up");
        }   
        else if(side == "myself"){
            return null;
        }
        else if(side == "left"){
            return this.emptyAtlas.getSpriteFrame("e_mj_left");
        }
        else if(side == "right"){
            return this.emptyAtlas.getSpriteFrame("e_mj_right");
        }
    },
    
    sortMJ:function(mahjongs,dingque){
        MahjongData.sortTiles(mahjongs, dingque);
    },
    
    getSide:function(localIndex){
        return MahjongData.getSide(localIndex);
    },
    
    getPre:function(localIndex){
        return MahjongData.getPrefix(localIndex);
    },
    
    getFoldPre:function(localIndex){
        return MahjongData.getFoldPrefix(localIndex);
    }
});
