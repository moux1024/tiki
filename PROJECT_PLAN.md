# Tiki - 3D Web Board Game

## 项目概述
基于 Kickstarter "Tiki" by Land of Z 桌游的网页 3D 版本，使用 Three.js 实现在线游玩。

## 游戏规则设计

### 背景
波利尼西亚神话主题的桌面策略游戏，玩家扮演部落的 Tiki 神灵，通过放置和移动 Tiki 图腾来控制岛屿领地。

### 核心机制
1. **游戏人数**: 2-4 人（支持本地多人 + AI 对手）
2. **游戏板**: 六边形网格组成的热带岛屿
3. **Tiki 图腾**: 每个玩家拥有不同颜色的 Tiki 图腾（可叠放的柱状组件）
4. **回合制**: 玩家轮流执行操作

### 玩家操作（每回合选择一种）
- **放置 (Place)**: 在空格或自己图腾上放置一个新的 Tiki 块
- **移动 (Move)**: 将一个 Tiki 块移动到相邻格子
- **提升 (Ascend)**: 将图腾顶部的 Tiki 块提升到更高层（叠放）
- **牺牲 (Sacrifice)**: 移除一个 Tiki 块来获得特殊能力

### 胜利条件
- 控制岛屿上的神圣区域（标记点）
- 当所有神圣区域被占满时，控制最多神圣区域的玩家获胜
- 或者当一位玩家的 Tiki 块用完时游戏结束，最高分获胜

### 得分规则
- 每控制一个神圣区域: +3 分
- 每个 3 层以上的图腾: +2 分
- 每个被自己图腾覆盖的格子: +1 分

## 技术架构

### 前端技术栈
- **框架**: Vite + TypeScript
- **3D 引擎**: Three.js (通过 React Three Fiber / @react-three/fiber)
- **UI**: React + TailwindCSS
- **状态管理**: Zustand
- **动画**: @react-spring/three

### 为什么选择 Three.js (React Three Fiber)
1. **成熟度高**: Three.js 是最广泛使用的 WebGL 库
2. **R3F 生态**: React Three Fiber 提供 React 式的 3D 开发体验
3. **丰富的组件**: @react-three/drei 提供大量现成 3D 组件
4. **性能良好**: 支持实例化渲染、LOD 等优化
5. **社区活跃**: 大量示例和文档

### 项目结构
```
tiki/
├── public/
│   ├── models/          # 3D 模型文件
│   └── textures/        # 贴图资源
├── src/
│   ├── components/      # React 组件
│   │   ├── Board/       # 游戏棋盘组件
│   │   ├── Tiki/        # Tiki 图腾组件
│   │   ├── UI/          # UI 覆盖层组件
│   │   └── Scene/       # 3D 场景组件
│   ├── game/            # 游戏逻辑
│   │   ├── engine.ts    # 游戏引擎
│   │   ├── rules.ts     # 规则系统
│   │   ├── ai.ts        # AI 对手
│   │   └── types.ts     # 类型定义
│   ├── store/           # 状态管理
│   ├── hooks/           # 自定义 hooks
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 开发里程碑

### Phase 1: 项目搭建 (Day 1)
- [x] 创建 GitHub 仓库
- [ ] 初始化 Vite + React + TypeScript 项目
- [ ] 配置 Three.js 和 React Three Fiber
- [ ] 配置 TailwindCSS
- [ ] 创建基础项目结构

### Phase 2: 3D 场景和棋盘 (Day 2)
- [ ] 实现六边形网格棋盘
- [ ] 创建热带岛屿场景（水面、沙滩、植被）
- [ ] 添加光照和阴影
- [ ] 实现摄像机控制（轨道控制）

### Phase 3: Tiki 图腾 (Day 3)
- [ ] 设计 Tiki 图腾的 3D 模型（程序化生成）
- [ ] 实现图腾放置动画
- [ ] 实现图腾叠放效果
- [ ] 添加不同颜色材质

### Phase 4: 游戏逻辑 (Day 4)
- [ ] 实现回合系统
- [ ] 实现放置/移动/提升/牺牲操作
- [ ] 实现得分计算
- [ ] 实现胜利条件判定

### Phase 5: AI 对手 (Day 5)
- [ ] 实现基础 AI（随机策略）
- [ ] 实现 Minimax AI（中等难度）
- [ ] 实现 MCTS AI（困难难度）

### Phase 6: UI 和打磨 (Day 6)
- [ ] 实现游戏开始界面
- [ ] 实现回合信息面板
- [ ] 实现得分面板
- [ ] 添加音效和粒子效果
- [ ] 响应式设计适配

### Phase 7: 部署 (Day 7)
- [ ] 部署到 GitHub Pages
- [ ] 性能优化
- [ ] 编写 README
- [ ] 添加在线多人支持（WebSocket）

## 风险和注意事项
1. **3D 模型**: 程序化生成 Tiki 图腾而非导入外部模型，减少依赖
2. **性能**: 移动端需要降级渲染（减少多边形数、关闭阴影）
3. **网络**: 初版先做本地多人，后续扩展在线多人
