# 表格预览图片遮挡问题修复

## 问题描述

在原始代码中,当用户将鼠标悬停在动漫表格单元格上时,会显示包含封面图片的预览 tooltip。但是这个预览图片会被年份表格行之间的黑色边框线遮挡,影响用户体验。

## 问题原因

z-index 层级冲突导致的遮挡问题:

### 第一次修复(不完整)
- 顶部导航栏: `z-[100]` (App.tsx 第180行)
- 主题选择器和导出按钮下拉菜单: `z-[60]` (App.tsx 第218、242行)
- 预览图片 tooltip: `z-20` → `z-[150]` ✅ 已修复

### 第二次修复(真正的问题)
**根本原因:** 每个年份行底部都有一个绝对定位的黑色边框线(GridRow.tsx 第42行),其 z-index 为 `z-10`。虽然这个值低于预览图片的 `z-[150]`,但由于每一行都是独立的容器,当预览图片向上显示时,会被**上方行的边框线**遮挡。

**层级结构分析:**
```
┌─────────────────────────────────┐
│  2024年行 (relative container)   │
│  └─ 黑色底部边框 (z-10) ← 遮挡!  │ 
└─────────────────────────────────┘
     ↑ 预览图片 (z-[150])
┌─────────────────────────────────┐
│  2023年行 (relative container)   │
│  └─ 动漫单元格 (hover 触发)      │
└─────────────────────────────────┘
```

由于预览图片使用 `bottom-full mb-2` 定位在单元格上方,它会进入上一行的容器空间。即使预览图片的 z-index 很高,但上一行的边框线在其自己的堆叠上下文中仍然会覆盖来自下方的元素。

## 解决方案

将年份行底部边框线的 z-index 从 `z-10` 降低到 `z-[5]`,确保预览图片(z-[150])能够显示在边框线之上。

### 修改内容

**文件:** `components/GridRow.tsx`

#### 修改1: 提升预览图片层级(第75行)
**修改前:**
```tsx
<div className="absolute z-20 bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-black text-white p-2 rounded text-xs w-32 shadow-xl pointer-events-none">
```

**修改后:**
```tsx
<div className="absolute z-[150] bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-black text-white p-2 rounded text-xs w-32 shadow-xl pointer-events-none">
```

#### 修改2: 降低边框线层级(第42行)
**修改前:**
```tsx
<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black z-10 pointer-events-none" />
```

**修改后:**
```tsx
<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black z-[5] pointer-events-none" />
```

## 层级结构

修复后的 z-index 层级结构:
- 预览图片 tooltip: `z-[150]` ✅ **最高层级**
- 顶部导航栏: `z-[100]`
- 主题选择器和导出按钮下拉菜单: `z-[60]`
- 年份行底部边框线: `z-[5]` ✅ **降低层级,不再遮挡预览图片**

## 效果

修复后,无论用户悬停在哪个位置的表格单元格上,预览图片都能正常显示在最上层,不会被年份行的黑色边框线、导航栏、下拉菜单或其他 UI 元素遮挡。

## 技术说明

这个问题的关键在于理解 CSS 堆叠上下文(Stacking Context)。每个设置了 `position: relative` 的年份行都创建了一个新的堆叠上下文。当预览图片向上延伸到上一行的空间时,需要确保其 z-index 足够高,同时上一行的边框线 z-index 足够低,才能避免遮挡。

---

**修复日期:** 2026-01-26  
**修复人员:** Manus AI Agent  
**修复版本:** v2 (完整修复)
