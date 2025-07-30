import { getAllTools, getTool, toolManager } from './app/agent/tools';

async function testToolsConfiguration() {
  console.log('=== 测试工具配置系统 ===\n');

  try {
    // 1. 测试获取所有工具
    console.log('1. 获取所有工具:');
    const allTools = getAllTools();
    console.log(`找到 ${allTools.length} 个工具`);
    allTools.forEach((tool) => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });
    console.log();

    // 2. 测试计算器工具
    console.log('2. 测试计算器工具:');
    const calculator = getTool('calculator');
    const calcResult = await calculator.invoke({ expression: '2 + 3 * 4' });
    console.log('计算结果:', calcResult);
    console.log();

    // 3. 测试天气工具
    console.log('3. 测试天气工具:');
    const weather = getTool('weather');
    const weatherResult = await weather.invoke({ city: '北京' });
    console.log('天气查询结果:', weatherResult);
    console.log();

    // 4. 测试时间工具
    console.log('4. 测试时间工具:');
    const timeTool = getTool('current_time');
    const timeResult = await timeTool.invoke({});
    console.log('时间查询结果:', timeResult);
    console.log();

    // 5. 测试搜索工具
    console.log('5. 测试搜索工具:');
    const searchTool = getTool('search');
    const searchResult = await searchTool.invoke({ query: 'LangGraph' });
    console.log('搜索结果:', searchResult);
    console.log();

    // 6. 测试工具管理器
    console.log('6. 测试工具管理器:');
    const toolsList = toolManager.listTools();
    console.log('工具列表:');
    toolsList.forEach((tool) => {
      console.log(
        `- ${tool.name}: ${tool.description} (启用: ${tool.enabled})`
      );
    });

    console.log('\n✅ 所有工具测试通过！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testToolsConfiguration();
