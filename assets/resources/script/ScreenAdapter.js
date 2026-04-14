module.exports = {
    applyCanvasFit:function(canvas){
        if(!canvas || !cc.view || !cc.view.getFrameSize){
            return;
        }
        var frameSize = cc.view.getFrameSize();
        var designResolution = canvas.designResolution;
        if(!frameSize || !frameSize.width || !frameSize.height || !designResolution){
            return;
        }
        var designRatio = designResolution.width / designResolution.height;
        var screenRatio = frameSize.width / frameSize.height;
        canvas.fitHeight = screenRatio >= designRatio;
        canvas.fitWidth = screenRatio < designRatio;
    },

    getWidthScale:function(referenceWidth,maxScale){
        if(!cc.director || !cc.director.getVisibleSize || !referenceWidth){
            return 1;
        }
        var visibleSize = cc.director.getVisibleSize();
        if(!visibleSize || !visibleSize.width){
            return 1;
        }
        var scale = visibleSize.width / referenceWidth;
        if(maxScale != null){
            scale = Math.min(scale,maxScale);
        }
        return scale;
    },
};
