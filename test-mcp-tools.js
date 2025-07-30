// 简单测试 MCP 工具初始化
const { initializeMCPToolsForDeepResearch } = require('./app/agent/deepresearch/tools');

async function testMCPTools() {
    try {
        console.log('开始测试 MCP 工具初始化...');

        const { allTools, searchTool, mcpTools } = await initializeMCPToolsForDeepResearch();

        console.log('✅ MCP 工具初始化成功');
        console.log(`- 搜索工具: ${searchTool ? '已加载' : '未加载'}`);
        console.log(`- MCP 工具数量: ${mcpTools.length}`);
        console.log(`- 总工具数量: ${allTools.length}`);

        // 列出工具名称
        console.log('\n工具列表:');
        allTools.forEach((tool, index) => {
            console.log(`${index + 1}. ${tool.name || tool.constructor.name}`);
        });

    } catch (error) {
        console.error('❌ MCP 工具初始化失败:', error.message);
    }
}

testMCPTools();
