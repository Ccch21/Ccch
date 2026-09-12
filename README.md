# 生日祝福 · 友情回忆站点

> A birthday gift for my dear college friend — Hakuna Matata.

一个基于 React 的互动记忆档案网站，把一起走过的城市、值得纪念的"第一次"变成可探索的 3D 空间。灵感来自 ToWhere Online（原作者的作品），在保留其核心交互骨架的基础上，重构为友情与生日祝福主题。

## 两大板块

### 一路向哪（3D 地球 + 城市）

主视图是 Cesium 3D 地球，城市的记忆变成地球上的发光点。点击城市进入专属详情页：主图、描述、相册瀑布流、全屏看图。

### 初时（重要时刻时间线）

记录值得纪念的第一次：第一次见面、第一次一起过生日、第一次旅行……支持日期、文字、分类 emoji 与多图上传（拍照或本地选图）。

## 入口

- **生日入口页**：开场 "Hakuna Matata" 花体祝福，点击进入主站
- **结尾页**：友情向祝福收尾

## 技术栈

- React 18 + Vite 5
- Cesium / Resium（3D 地球）
- Supabase（数据库 + Storage）
- GitHub Contents API（城市图片仓库管理）
- Framer Motion

## 开始使用

```bash
npm install
npm run dev        # 本地开发
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

### 环境变量（.env）

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_GITHUB_OWNER=Ccch21
VITE_GITHUB_REPO=Ccch
VITE_GITHUB_BRANCH=main
```

### Supabase 设置

1. 在 [supabase.com](https://supabase.com) 新建项目
2. 在 SQL Editor 中运行 [`supabase-schema.sql`](./supabase-schema.sql) 创建 4 张表
3. 创建 Storage Bucket：`firsts-images`（Public，用于"初时"图片上传）
4. 城市图片由管理员在站点内上传，自动写入 GitHub 仓库（`public/images/cities/`）

### 部署（GitHub Pages）

项目已配置 GitHub Actions（`.github/workflows/deploy.yml`），推送到 `main` 分支自动构建部署。

仓库 Settings → Secrets and variables → Actions 中配置：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 管理员入口

在地球页面连续点击标题 3 次，可打开管理面板（地点管理 / 邀请码配置）。

## 隐私说明

本站点包含私人照片、文字与音乐。请勿未经许可转载或复用其中任何个人内容。