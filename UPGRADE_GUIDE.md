# Cocos Creator 3.x 升级指南

## 概述

本文档提供了将本项目从 Cocos Creator 1.x/2.x 迁移到 Cocos Creator 3.x 的详细指南。

> **注意：** Cocos Creator 3.x 是一个重大版本变更，包含架构层面的改动。完整迁移需要使用 Cocos Creator 3.x 编辑器重新导入项目。

## 当前版本

- **Cocos Creator**: 1.x/2.x (JavaScript engine)
- **Node.js**: >=18.0.0 (已升级)
- **服务端依赖**: 已更新至现代版本

## 迁移步骤

### 1. 安装 Cocos Creator 3.x

从 [Cocos 官网](https://www.cocos.com/creator-download) 下载最新版 Cocos Creator 3.x。

### 2. 创建新项目并迁移

Cocos Creator 3.x 提供了内置的 2.x 项目迁移工具：

1. 打开 Cocos Creator 3.x
2. 选择"导入 Cocos Creator 2.x 项目"
3. 选择本项目根目录
4. 按向导完成迁移

### 3. 脚本迁移

#### 3.1 组件系统变更

**旧版 (cc.Class):**
```javascript
cc.Class({
    extends: cc.Component,
    properties: {
        label: cc.Label,
        text: 'hello',
    },
    onLoad: function() { },
});
```

**新版 (TypeScript Decorator):**
```typescript
import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MyComponent')
export class MyComponent extends Component {
    @property(Label)
    label: Label = null;

    @property
    text: string = 'hello';

    onLoad() { }
}
```

#### 3.2 API 变更对照表

| 旧版 API | 新版 API | 说明 |
|----------|---------|------|
| `cc.Class({extends: cc.Component})` | `@ccclass class extends Component` | 组件定义 |
| `cc.loader.loadRes()` | `resources.load()` | 资源加载 |
| `cc.loader.loadResDir()` | `resources.loadDir()` | 目录加载 |
| `cc.loader.getXMLHttpRequest()` | `new XMLHttpRequest()` | HTTP请求 (已在本次更新中解耦) |
| `cc.url.raw()` | `resources.load()` / `assetManager` | 原始URL |
| `cc.director.loadScene()` | `director.loadScene()` | 场景切换 |
| `cc.find()` | `find()` | 节点查找 |
| `cc.audioEngine` | `AudioSource` 组件 | 音频播放 |
| `cc.sys.localStorage` | `sys.localStorage` | 本地存储 |
| `cc.game.EVENT_HIDE` | `game.EVENT_HIDE` | 游戏事件 |
| `node.on('touchstart')` | `node.on(Node.EventType.TOUCH_START)` | 触摸事件 |
| `cc.SpriteAtlas` | `SpriteAtlas` | 图集 |
| `cc.Prefab` | `Prefab` | 预制体 |
| `cc.Component.EventHandler` | `EventHandler` | 事件处理 |

#### 3.3 需要迁移的文件清单

##### 资源脚本 (`assets/resources/script/`)
- [ ] `Global.js` → `Global.ts`
- [ ] `UserMgr.js` → `UserMgr.ts`
- [ ] `HTTP.js` → `HTTP.ts`
- [ ] `MahjongMgr.js` → `MahjongMgr.ts`
- [ ] `MahjongData.js` → `MahjongData.ts` (纯数据，变更最少)
- [ ] `AudioMgr.js` → `AudioMgr.ts`
- [ ] `VoiceMgr.js` → `VoiceMgr.ts`
- [ ] `Utils.js` → `Utils.ts`
- [ ] `Net.js` → `Net.ts`
- [ ] `GameNetMgr.js` → `GameNetMgr.ts`
- [ ] `ReplayMgr.js` → `ReplayMgr.ts`
- [ ] `EventBus.js` → `EventBus.ts` (纯逻辑，变更最少)
- [ ] `EventConstants.js` → `EventConstants.ts` (纯常量，变更最少)

##### 场景模块 (`assets/module/`)
- [ ] `loading/script/Lodinglogin.js` → `Lodinglogin.ts`
- [ ] `login/script/login.js` → `login.ts`
- [ ] `createruser/script/createrole.js` → `createrole.ts`
- [ ] `hall/srcipts/hall.js` → `hall.ts`
- [ ] `hall/srcipts/CreateRoom.js` → `CreateRoom.ts`
- [ ] `hall/srcipts/JoinGameInput.js` → `JoinGameInput.ts`
- [ ] `hall/srcipts/setting.js` → `setting.ts`
- [ ] `hall/srcipts/CheckBox.js` → `CheckBox.ts`
- [ ] `mjgame/scripts/MJGame.js` → `MJGame.ts`
- [ ] `mjgame/scripts/MJRoom.js` → `MJRoom.ts`
- [ ] `mjgame/scripts/GameOver.js` → `GameOver.ts`

### 4. 场景文件迁移

所有 `.fire` 场景文件需要在 Cocos Creator 3.x 编辑器中重新导入，它们会自动转换为 `.scene` 格式。

### 5. 资源迁移

- **图集文件**: 需要重新导入
- **Spine 动画**: 需要检查兼容性
- **声音文件**: 格式兼容，但加载方式需要更新
- **预制体**: 需要在编辑器中重新导入

### 6. 本次优化已完成的迁移准备

以下改动已在当前 PR 中完成，为 Cocos Creator 3.x 迁移做准备：

1. **✅ EventBus 模块** - 纯 JavaScript 事件系统，可直接迁移到 TypeScript
2. **✅ EventConstants 模块** - 事件常量集中管理，迁移为 TypeScript enum
3. **✅ MahjongData 模块** - 纯数据逻辑从组件中解耦，迁移时无需改动渲染逻辑
4. **✅ HTTP.js 解耦** - 不再依赖 `cc.loader.getXMLHttpRequest()`，使用标准 `XMLHttpRequest`
5. **✅ Global.js 重构** - 添加了 `setState` 方法和事件通知机制

### 7. Socket.IO 客户端升级

当前客户端使用 Socket.IO 客户端库进行 WebSocket 通信。服务端已升级到 Socket.IO v4，客户端库也需要相应更新：

```html
<!-- 旧版 -->
<script src="socket.io-client/dist/socket.io.js"></script>

<!-- 新版 -->
<script src="socket.io-client@4.x/dist/socket.io.js"></script>
```

## 服务端 Node.js 升级详情

### 已完成的变更

| 变更项 | 旧版本 | 新版本 | 说明 |
|--------|--------|--------|------|
| Node.js 最低版本 | 未指定 | >=18.0.0 | 在 package.json engines 中指定 |
| express | ^4.16.2 | ^4.21.2 | Web 框架更新 |
| socket.io | ^2.0.4 | ^4.8.1 | WebSocket 库大版本更新 |
| mysql | ^2.15.0 | mysql2 ^3.12.0 | 支持 Promise，性能更好 |
| log4js | ^2.4.1 | ^6.9.1 | 日志库更新 |
| fibers | ^2.0.0 | **已移除** | 不兼容现代 Node.js，改用 async/await |

### 关键代码变更

1. **`dealerdb.js`**: 所有函数从同步 Fiber 模式转换为 `async/await` 模式
2. **`crypto.js`**: `new Buffer()` → `Buffer.from()`
3. **`db.js`**: `require('mysql')` → `require('mysql2')`
4. **`socket_service.js`**: Socket.IO v4 API (`new Server()` 构造函数 + CORS 配置)

## 注意事项

1. **数据库兼容性**: `mysql2` 完全兼容 `mysql` 包的 API，无需修改数据库查询代码
2. **Socket.IO 协议**: v4 的传输协议与 v2 不兼容，客户端和服务端必须使用同一大版本
3. **测试**: 建议在迁移后进行完整的功能测试，特别是网络通信和数据库操作相关功能
