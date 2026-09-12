-- ============================================
-- 生日祝福 · 友情回忆站点 Schema
-- 在新的 Supabase 项目中运行此 SQL 来创建所有表
-- ============================================

-- 1. cities 表 - 城市记忆点（一路向哪 · 3D 地球）
CREATE TABLE IF NOT EXISTS cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,               -- 日期范围/一句话描述
    main_image TEXT,                -- 主图 URL
    lng DOUBLE PRECISION NOT NULL,  -- 经度
    lat DOUBLE PRECISION NOT NULL,  -- 纬度
    departure TEXT,                 -- 出发地
    sort_order INT DEFAULT 0,
    color TEXT DEFAULT '#FFFF00',   -- 地图标记颜色
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. city_images 表 - 城市相册
CREATE TABLE IF NOT EXISTS city_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. firsts 表 - "初时"重要时刻记录
CREATE TABLE IF NOT EXISTS firsts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,      -- 支持 JSON（含 text/extra_text/images）
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. app_config 表 - 站点配置
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS 策略 (Row Level Security)
-- 公开版本：允许匿名用户读写
-- ============================================

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE firsts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- cities
CREATE POLICY "Allow all access to cities" ON cities
    FOR ALL USING (true) WITH CHECK (true);

-- city_images
CREATE POLICY "Allow all access to city_images" ON city_images
    FOR ALL USING (true) WITH CHECK (true);

-- firsts
CREATE POLICY "Allow all access to firsts" ON firsts
    FOR ALL USING (true) WITH CHECK (true);

-- app_config
CREATE POLICY "Allow all access to app_config" ON app_config
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Supabase Storage (手动操作)
-- ============================================
-- 1. 在 Supabase Dashboard -> Storage 中创建名为 "firsts-images" 的 Bucket
-- 2. 设置为 Public bucket
-- 3. 添加 RLS 策略允许匿名上传和读取
--
-- 城市图片默认上传到 GitHub 仓库（public/images/cities/），无需 Storage 桶