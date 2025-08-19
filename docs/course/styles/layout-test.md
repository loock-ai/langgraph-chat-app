---
marp: true
theme: gaia
paginate: true
header: '布局测试'
style: '@import url("marp-theme.css")'
---

# 🧪 布局测试页面

## 测试多列布局是否正常工作

---

## 📱 两列布局测试

<div class="two-column">

<div class="text-content">

### 左侧文字内容

这是左侧的文字内容区域，用于测试两列布局是否正常工作。

#### 功能特点

- **响应式设计** - 自动适配不同屏幕
- **内容对齐** - 文字和图片完美对齐
- **间距控制** - 合理的列间距和内容间距

#### 技术实现

使用 CSS Grid 布局，确保：

- 两列等宽分布
- 内容垂直对齐
- 移动端自动堆叠

</div>

<div class="image-content">

![测试图片](https://via.placeholder.com/400x300/3498db/FFFFFF?text=两列布局测试)

_这是右侧的图片内容_

</div>

</div>

---

## 📱 三列布局测试

<div class="three-column">

<div class="custom-card">

#### 🎯 第一列

**功能特点**

- 响应式设计
- 自动适配
- 内容对齐

**使用场景**

- 功能对比
- 步骤说明
- 选项展示

</div>

<div class="custom-card">

#### 🔧 第二列

**技术实现**

- CSS Grid 布局
- Flexbox 备用方案
- 媒体查询优化

**优势**

- 高度灵活
- 易于维护
- 性能优秀

</div>

<div class="custom-card">

#### 📚 第三列

**最佳实践**

- 保持一致性
- 内容优先
- 适度使用

**注意事项**

- 避免过度设计
- 确保可读性
- 测试兼容性

</div>

</div>

---

## 🔄 备用布局方案测试

### Flexbox 两列布局

<div class="two-column-fallback">

<div class="text-content">

#### 左侧内容

这是使用 Flexbox 作为备用方案的两列布局。

**优势：**

- 更好的浏览器兼容性
- 灵活的宽度控制
- 自动换行支持

</div>

<div class="image-content">

![备用布局](https://via.placeholder.com/400x300/27ae60/FFFFFF?text=Flexbox布局)

_Flexbox 备用方案_

</div>

</div>

---

## 📊 布局对比测试

### Grid vs Flexbox

<div class="two-column">

<div class="text-content">

#### CSS Grid 布局

**特点：**

- 二维布局系统
- 精确的网格控制
- 现代浏览器支持

**适用场景：**

- 复杂的页面布局
- 需要精确对齐
- 响应式设计

</div>

<div class="text-content">

#### Flexbox 布局

**特点：**

- 一维布局系统
- 灵活的弹性布局
- 更好的兼容性

**适用场景：**

- 简单的行/列布局
- 需要自动换行
- 旧浏览器支持

</div>

</div>

---

## 🎨 样式组合测试

### 卡片 + 布局

<div class="three-column">

<div class="highlight-box">

#### 🌟 高亮卡片

这个卡片使用了高亮样式，展示样式组合的效果。

- 高亮背景
- 圆角边框
- 阴影效果

</div>

<div class="info-box">

#### 💡 信息卡片

信息提示框与布局结合，提供清晰的视觉层次。

- 信息背景
- 绿色边框
- 专业外观

</div>

<div class="warning-box">

#### ⚠️ 警告卡片

警告提示框用于重要提醒，确保用户注意。

- 警告背景
- 黄色边框
- 醒目提醒

</div>

</div>

---

## 📱 响应式测试

### 不同屏幕尺寸下的表现

<div class="two-column">

<div class="text-content">

#### 响应式特性

**大屏幕 (>768px)：**

- 两列并排显示
- 标准间距和字体
- 完整功能展示

**中等屏幕 (≤768px)：**

- 自动切换为单列
- 调整间距和字体
- 优化触摸操作

**小屏幕 (≤480px)：**

- 进一步优化间距
- 图片尺寸调整
- 确保可读性

</div>

<div class="image-content">

![响应式测试](https://via.placeholder.com/400x300/f39c12/FFFFFF?text=响应式设计)

_自动适配各种设备_

</div>

</div>

---

## ✅ 测试结果

### 布局功能验证

<div class="custom-card">

#### 🎯 测试项目

- ✅ **两列布局** - CSS Grid 实现
- ✅ **三列布局** - 等宽分布
- ✅ **备用方案** - Flexbox 支持
- ✅ **响应式设计** - 媒体查询
- ✅ **样式组合** - 多种组件
- ✅ **内容对齐** - 垂直居中

#### 🔧 技术特点

- 使用 `!important` 确保样式优先级
- 提供多种布局方案
- 优化移动端体验
- 支持各种内容类型

</div>

---

## 🚀 使用建议

### 最佳实践

<div class="three-column">

<div>

#### 🎨 设计原则

- 保持视觉一致性
- 内容优先于样式
- 适度使用特效

</div>

<div>

#### 📱 用户体验

- 确保内容可读性
- 优化触摸操作
- 考虑不同设备

</div>

<div>

#### 🔧 技术实现

- 使用语义化类名
- 测试兼容性
- 性能优化

</div>

</div>

---

## 🎉 测试完成

### 多列布局正常工作！

<div class="gradient-bg">

#### 🌟 总结

通过这个测试页面，我们验证了：

- **两列布局** ✅ 正常工作
- **三列布局** ✅ 正常工作
- **响应式设计** ✅ 正常工作
- **样式组合** ✅ 正常工作
- **备用方案** ✅ 正常工作

现在你可以在其他 PPT 文件中放心使用这些布局样式了！

</div>

---

_布局测试完成 - 所有功能正常！_ 🎉
