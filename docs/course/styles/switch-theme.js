#!/usr/bin/env node

/**
 * Marp 主题切换脚本
 * 使用方法: node switch-theme.js [主题名称]
 */

const fs = require('fs');
const path = require('path');

// 主题配置
const themes = {
    default: 'marp-theme.css',
    dark: 'marp-theme-dark.css',
    academic: 'marp-theme-academic.css',
    corporate: 'marp-theme-corporate.css'
};

// 获取命令行参数
const themeName = process.argv[2] || 'default';

if (!themes[themeName]) {
    console.log('❌ 无效的主题名称');
    console.log('可用的主题:');
    Object.keys(themes).forEach(name => {
        console.log(`  - ${name}`);
    });
    process.exit(1);
}

// 查找所有 PPT 文件
function findPptFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...findPptFiles(fullPath));
        } else if (item.endsWith('.ppt.md')) {
            files.push(fullPath);
        }
    });

    return files;
}

// 更新 PPT 文件中的样式引用
function updateStyleReference(filePath, newTheme) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // 查找并替换样式引用
        const styleRegex = /style:\s*'@import\s+url\("([^"]+)"\)'/;
        const match = content.match(styleRegex);

        if (match) {
            // 获取当前文件的相对路径
            const currentDir = path.dirname(filePath);
            const stylesDir = path.join(__dirname);
            const relativePath = path.relative(currentDir, stylesDir);

            // 构建新的样式路径
            const newStylePath = path.join(relativePath, themes[newTheme]).replace(/\\/g, '/');

            // 替换样式引用
            content = content.replace(
                styleRegex,
                `style: '@import url("${newStylePath}")'`
            );

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 已更新: ${filePath}`);
            return true;
        } else {
            console.log(`⚠️  未找到样式引用: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ 更新失败: ${filePath}`, error.message);
        return false;
    }
}

// 主函数
function main() {
    console.log(`🎨 切换到主题: ${themeName}`);
    console.log(`📁 样式文件: ${themes[themeName]}`);
    console.log('');

    // 检查样式文件是否存在
    const styleFile = path.join(__dirname, themes[themeName]);
    if (!fs.existsSync(styleFile)) {
        console.log(`❌ 样式文件不存在: ${styleFile}`);
        console.log('请先创建对应的样式文件');
        process.exit(1);
    }

    // 查找所有 PPT 文件
    const courseDir = path.join(__dirname, '..');
    const pptFiles = findPptFiles(courseDir);

    console.log(`📚 找到 ${pptFiles.length} 个 PPT 文件`);
    console.log('');

    let updatedCount = 0;
    let errorCount = 0;

    // 更新每个文件
    pptFiles.forEach(file => {
        const success = updateStyleReference(file, themeName);
        if (success) {
            updatedCount++;
        } else {
            errorCount++;
        }
    });

    console.log('');
    console.log('📊 更新结果:');
    console.log(`  ✅ 成功: ${updatedCount} 个文件`);
    console.log(`  ❌ 失败: ${errorCount} 个文件`);
    console.log('');
    console.log(`🎉 主题切换完成！现在使用 ${themeName} 主题`);
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = { themes, findPptFiles, updateStyleReference };
