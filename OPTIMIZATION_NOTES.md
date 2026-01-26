# 表格预览图片遮挡问题修复

## 问题描述

在原始代码中,当用户将鼠标悬停在动漫表格单元格上时,会显示包含封面图片的预览 tooltip。但是这个预览图片会被页面顶部的导航栏和下拉菜单遮挡,影响用户体验。

## 问题原因

z-index 层级冲突:
- 顶部导航栏: `z-[100]` (App.tsx 第180行)
- 主题选择器和导出按钮下拉菜单: `z-[60]` (App.tsx 第218、242行)
- 预览图片 tooltip: `z-20` (GridRow.tsx 第75行) ❌ **层级过低**

当用户悬停在靠近页面顶部的表格单元格时,预览图片的 z-index 值低于导航栏和下拉菜单,导致被遮挡。

## 解决方案

将预览图片 tooltip 的 z-index 从 `z-20` 提升到 `z-[150]`,确保其显示在所有其他 UI 元素之上。

### 修改内容

**文件:** `components/GridRow.tsx`

**修改位置:** 第75行

**修改前:**
```tsx
<div className="absolute z-20 bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-black text-white p-2 rounded text-xs w-32 shadow-xl pointer-events-none">
```

**修改后:**
```tsx
<div className="absolute z-[150] bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-black text-white p-2 rounded text-xs w-32 shadow-xl pointer-events-none">
```

## 层级结构

修复后的 z-index 层级结构:
- 预览图片 tooltip: `z-[150]` ✅ **最高层级**
- 顶部导航栏: `z-[100]`
- 主题选择器和导出按钮下拉菜单: `z-[60]`
- GridRow 底部边框: `z-10`

## 效果

修复后,无论用户悬停在哪个位置的表格单元格上,预览图片都能正常显示在最上层,不会被任何其他 UI 元素遮挡。

---

**修复日期:** 2026-01-26  
**修复人员:** Manus AI Agent
