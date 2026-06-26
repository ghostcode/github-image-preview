# github-image-preview

GitHub 页面图片点击放大预览的 Chrome 浏览器扩展。

## 功能

- 自动识别 GitHub 页面上的所有图片，鼠标悬停显示 `zoom-in` 光标
- 点击图片弹出全屏遮罩层，显示高清大图
- 点击遮罩背景 / 关闭按钮 / 按 `Esc` 键关闭预览
- 加载中显示 spinner 动画，加载失败有降级提示
- 通过 `MutationObserver` 兼容 GitHub 的 SPA 无刷新导航

## 安装

1. 克隆仓库
2. 打开 Chrome，进入 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择该项目文件夹

## 文件结构

```
├── manifest.json    # 扩展清单（Manifest V3）
├── content.js       # 核心注入脚本
├── images/          # 扩展图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 技术要点

| 特性 | 实现方式 |
|------|----------|
| 图片选择 | 匹配页面所有 `<img>` 标签，排除 1×1 像素追踪图 |
| 图片源获取 | 优先读 `data-canonical-src` → `data-src` → `src` |
| 遮罩动画 | CSS `opacity + visibility` 过渡，0.2s ease |
| SPA 兼容 | `MutationObserver` 监听 DOM 变化，自动重新初始化 |
| 零依赖 | 纯原生 JS，不引入任何第三方库 |
| 权限最小化 | 仅申请 `activeTab`，无 background service worker |

## 许可证

MIT
