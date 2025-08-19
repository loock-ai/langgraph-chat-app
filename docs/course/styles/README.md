---
marp: true
theme: gaia
paginate: true
header: 'Marp 主题样式使用指南'
style: '@import url("marp-theme.css")'
---

<!-- _class: gradient-bg -->

# 🎨 Marp 主题样式使用指南

## 完整的样式系统解决方案

**让每个演示文稿都拥有专业的外观**

---

## 📋 目录概览

### 本指南将介绍

- 🎯 **样式系统概述** - 了解整体架构
- 🚀 **快速开始** - 立即上手使用
- 🧩 **组件库** - 丰富的预定义样式
- 🎨 **自定义指南** - 个性化你的主题
- 🔧 **工具和脚本** - 提高工作效率
- ❓ **常见问题** - 解决使用难题

---

## 🎯 样式系统概述

### 为什么选择我们的样式系统？

<div class="two-column">

<div class="text-content">

#### ✨ 核心优势

- **模块化设计** - 样式与内容分离
- **高度可复用** - 一次定义，处处使用
- **专业外观** - 基于现代设计原则
- **响应式支持** - 适配各种设备
- **易于维护** - 集中管理，统一更新

#### 🏗️ 技术架构

- 基于 gaia 主题扩展
- CSS Grid 和 Flexbox 布局
- 现代化的 CSS 特性
- 优雅的降级处理

</div>

<div class="image-content">

![样式系统架构](https://via.placeholder.com/400x300/3498db/FFFFFF?text=样式系统架构)

_模块化设计，易于维护_

</div>

</div>

---

## 🚀 快速开始

### 第一步：引用样式文件

在你的 Marp 文件头部添加：

```markdown
---
marp: true
theme: gaia
paginate: true
header: '你的标题'
style: '@import url("../../styles/marp-theme.css")'
---
```

---

### 第二步：选择正确的路径

<div class="info-box">

#### 📁 路径说明

- **章节级别文件**：`../../styles/marp-theme.css`
- **课程根目录文件**：`./styles/marp-theme.css`
- **样式目录内文件**：`marp-theme.css`

</div>

---

## 🧩 组件库 - 布局组件

### 两列布局

<div class="two-column">

<div class="text-content">

#### 使用方法

```markdown
<div class="two-column">
  <div class="text-content">
    左侧文字内容
  </div>
  <div class="image-content">
    右侧图片内容
  </div>
</div>
```

<div class="two-column">
  <div class="text-content">
    左侧文字内容
  </div>
  <div class="image-content">
    右侧图片内容
  </div>
</div>

#### 适用场景

- 文字与图片并排
- 对比内容展示
- 步骤说明

</div>

<div class="image-content">

![两列布局示例](https://via.placeholder.com/400x300/27ae60/FFFFFF?text=两列布局)

_自动响应式设计_

</div>

</div>

---

## 🧩 组件库 - 三列布局

### 三列等宽布局

<div class="three-column">

<div class="custom-card">

#### 🎯 第一列

- 功能特点
- 使用说明
- 注意事项

</div>

<div class="custom-card">

#### 🔧 第二列

- 技术实现
- 配置选项
- 最佳实践

</div>

<div class="custom-card">

#### 📚 第三列

- 相关文档
- 示例代码
- 常见问题

</div>

</div>

---

## 🧩 组件库 - 卡片组件

### 自定义卡片

<div class="custom-card">

#### ✨ 卡片特性

- **圆角设计** - 现代化的视觉风格
- **阴影效果** - 增强层次感
- **悬停动画** - 提升交互体验
- **左侧边框** - 品牌色彩标识

#### 使用代码

```markdown
<div class="custom-card">
  ### 卡片标题
  卡片内容描述
</div>
```

</div>

---

## 🧩 组件库 - 提示框组件

### 信息提示框

<div class="info-box">

#### 💡 信息提示

用于展示：

- 重要提示信息
- 操作说明指导
- 注意事项提醒

</div>

### 警告提示框

<div class="warning-box">

#### ⚠️ 警告信息

需要特别注意：

- 操作风险提醒
- 数据备份建议
- 权限要求说明

</div>

---

## 🧩 组件库 - 更多提示框

### 错误提示框

<div class="error-box">

#### ❌ 错误信息

出现问题时：

- 错误原因说明
- 解决方案建议
- 联系支持方式

</div>

### 高亮提示框

<div class="highlight-box">

#### 🌟 重要内容

需要强调的：

- 关键信息点
- 核心概念
- 重点提醒

</div>

---

## 🧩 组件库 - 特殊效果

### 渐变背景

<!-- _class: gradient-bg -->

#### 🌈 渐变背景页面

这个页面使用了渐变背景效果：

- **视觉效果**：更加美观和现代
- **内容对比**：白色文字在深色背景上更清晰
- **品牌一致性**：统一的视觉风格

---

## 🧩 组件库 - 动画效果

### 淡入动画

<div class="fade-in">

#### 🎬 动画效果展示

这个内容具有淡入动画效果：

- **平滑过渡** - 从透明到可见
- **向上移动** - 从下方滑入
- **时间控制** - 1 秒完成动画

</div>

---

### 徽章样式

#### 🏷️ 不同类型的徽章

- <span class="badge">默认徽章</span> - 一般标签
- <span class="badge badge-success">成功徽章</span> - 成功状态
- <span class="badge badge-warning">警告徽章</span> - 警告信息
- <span class="badge badge-danger">危险徽章</span> - 危险操作

---

## 🧩 组件库 - 表格样式

### 数据展示表格

#### 📊 功能状态表

| 功能模块 | 开发状态  | 优先级 | 负责人 | 预计完成   |
| -------- | --------- | ------ | ------ | ---------- |
| 用户登录 | ✅ 已完成 | 🔴 高  | 张三   | 2024-01-15 |
| 数据导出 | 🔄 进行中 | 🟡 中  | 李四   | 2024-01-20 |
| 报表生成 | ⏳ 待开始 | 🟢 低  | 王五   | 2024-01-25 |
| 权限管理 | ❌ 已暂停 | 🔴 高  | 赵六   | 待定       |

---

## 🧩 组件库 - 代码样式

### 代码块展示

#### 💻 JavaScript 示例

```javascript
// 用户创建函数
function createUser(userData) {
  const user = {
    id: generateId(),
    name: userData.name,
    email: userData.email,
    createdAt: new Date(),
    status: 'active',
  };

  return saveUser(user);
}

// 使用示例
const newUser = createUser({
  name: '张三',
  email: 'zhangsan@example.com',
});

console.log('用户创建成功:', newUser);
```

---

## 🧩 组件库 - 引用样式

### 引用内容展示

#### 📝 重要引用

> 这是一个引用块，用于展示：
>
> - **重要引用** - 权威观点和理论
> - **名人名言** - 经典语录和格言
> - **参考文献** - 学术引用和来源
> - **外部观点** - 第三方评价和看法

引用内容通常具有特殊的样式设计，让重要信息更加突出和易于识别。

---

## 🎨 自定义指南

### 修改颜色主题

<div class="custom-card">

#### 🎨 颜色定制

在 `marp-theme.css` 文件中找到并修改：

```css
:root {
  --primary-color: #3498db; /* 主色调 */
  --secondary-color: #2c3e50; /* 次要色调 */
  --accent-color: #e74c3c; /* 强调色 */
  --success-color: #27ae60; /* 成功色 */
  --warning-color: #f39c12; /* 警告色 */
  --danger-color: #e74c3c; /* 危险色 */
}
```

</div>

---

## 🎨 自定义指南

### 添加新的样式类

<div class="highlight-box">

#### 🔧 扩展样式

在文件末尾添加你的自定义样式：

```css
/* 自定义样式类 */
.my-custom-class {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 1.5em;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.my-custom-class h3 {
  color: #ffd700;
  text-align: center;
}
```

</div>

---

## 🔧 工具和脚本

### 主题切换脚本

<div class="info-box">

#### 🎭 快速切换主题

使用内置的主题切换脚本：

```bash
cd docs/course/styles
node switch-theme.js dark      # 切换到深色主题
node switch-theme.js academic  # 切换到学术主题
node switch-theme.js corporate # 切换到企业主题
node switch-theme.js default   # 切换回默认主题
```

</div>

### 主题配置文件

#### 📋 可用主题列表

- **default** - 默认主题（基于 gaia）
- **dark** - 深色现代风格
- **academic** - 学术简洁风格
- **corporate** - 企业专业风格

---

## 🔧 工具和脚本

### 批量更新脚本

<div class="warning-box">

#### ⚠️ 使用注意事项

- 脚本会自动查找所有 `.ppt.md` 文件
- 自动计算相对路径并更新样式引用
- 建议在运行前备份重要文件
- 支持 Windows 和 Unix 路径格式

</div>

---

## ❓ 常见问题

### 样式未生效

<div class="error-box">

#### 🔍 排查步骤

1. **检查文件路径** - 确认相对路径是否正确
2. **验证 Marp 版本** - 确认支持 `@import` 语法
3. **检查 CSS 语法** - 验证样式文件是否有语法错误
4. **清除缓存** - 重新加载演示文稿

</div>

### 多列布局不生效

<div class="warning-box">

#### 🚨 常见问题

**问题描述：** 两列或三列布局没有按预期显示

**解决方案：**

1. **检查样式引用** - 确保正确引用了样式文件
2. **验证类名** - 确认使用了正确的 CSS 类名
3. **清除缓存** - 重新加载或重启编辑器
4. **检查浏览器** - 某些浏览器可能需要刷新

**备用方案：**
如果 Grid 布局不工作，可以使用备用类：

- `two-column-fallback` 替代 `two-column`
- `three-column-fallback` 替代 `three-column`

</div>

---

## ❓ 常见问题

### 样式冲突解决

<div class="info-box">

#### 🛠️ 解决方案

1. **检查内联样式** - 是否有 `style:` 属性覆盖
2. **确认选择器优先级** - CSS 选择器权重问题
3. **使用 `!important`** - 强制应用样式（谨慎使用）
4. **调整加载顺序** - 确保自定义样式最后加载

</div>

---

## 📱 响应式设计

### 移动端适配

<div class="two-column">

<div class="text-content">

#### 📱 响应式特性

- **自动布局调整** - 小屏幕下自动堆叠
- **字体大小优化** - 移动端友好的字号
- **触摸操作支持** - 优化触摸交互体验
- **性能优化** - 减少不必要的动画效果

</div>

<div class="image-content">

![响应式设计](https://via.placeholder.com/400x300/f39c12/FFFFFF?text=响应式设计)

_自动适配各种设备_

</div>

</div>

---

## 🖨️ 打印优化

### 打印样式支持

<div class="custom-card">

#### 🖨️ 打印特性

- **自动分页** - 每个 section 自动分页
- **移除阴影** - 打印时移除阴影效果
- **优化边框** - 使用打印友好的边框样式
- **颜色适配** - 确保黑白打印的可读性

</div>

---

## 🎯 最佳实践

### 设计原则

<div class="three-column">

<div>

#### 🎨 视觉一致性

- 使用统一的颜色方案
- 保持字体风格一致
- 统一间距和布局

</div>

<div>

#### 📱 用户体验

- 确保内容可读性
- 优化交互反馈
- 考虑不同设备

</div>

<div>

#### 🔧 技术实现

- 适度使用动画效果
- 优化性能表现
- 保持代码简洁

</div>

</div>

---

## 🎯 最佳实践

### 使用建议

<div class="highlight-box">

#### 💡 实用建议

1. **保持一致性** - 在整个演示中使用统一的样式类
2. **内容优先** - 样式应该增强内容，而不是掩盖内容
3. **适度使用** - 不要过度使用特效和动画
4. **测试验证** - 在不同设备和环境下测试效果

</div>

---

## 🚀 下一步行动

### 开始使用

<div class="info-box">

#### 🎯 立即开始

1. **选择样式文件** - 复制 `marp-theme.css` 到你的项目
2. **引用样式** - 在 PPT 文件中添加 `@import` 语句
3. **应用样式类** - 使用预定义的样式类美化内容
4. **自定义调整** - 根据需要修改颜色和样式

</div>

---

## 🎉 总结

### 样式系统特点

✅ **模块化设计** - 样式分离，便于维护  
✅ **丰富组件** - 多种预定义样式类  
✅ **响应式支持** - 自动适配各种设备  
✅ **易于使用** - 简单的类名引用  
✅ **高度可定制** - 支持个性化调整  
✅ **专业外观** - 现代化的设计风格

---

## 🎉 总结

### 核心价值

<div class="gradient-bg">

#### 🌟 为什么选择我们？

- **提高效率** - 专注于内容创作，而不是样式调整
- **专业外观** - 每个演示都拥有专业级的外观
- **易于维护** - 集中管理，统一更新
- **团队协作** - 统一的视觉风格，提升团队形象

</div>

---

## 📞 支持与反馈

### 获取帮助

<div class="custom-card">

#### 🤝 支持渠道

- **文档参考** - 查看 `example-demo.md` 示例
- **问题反馈** - 提交样式改进建议
- **功能请求** - 提出新的样式需求
- **Bug 报告** - 报告样式问题

</div>

---

## 🎊 结语

### 开始你的专业演示之旅

<div class="highlight-box">

#### 🚀 现在就开始

> **每一个专业的演示文稿都始于正确的样式选择！**

让我们携手打造更加专业、美观的演示文稿！

</div>

---

<!-- _class: gradient-bg -->

## 🎯 感谢使用

### Marp 主题样式系统

**让每个演示都成为艺术品**

---

_样式使用指南结束 - 祝你演示愉快！_ 🎉
