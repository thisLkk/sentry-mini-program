import { Platform } from '../../src/platform/index';

// 扩展 global 对象的类型
declare global {
  var wx: any; // 声明 wx 为 any 类型
}

// 在测试之前设置 wx 对象
beforeAll(() => {
  global.wx = {
    request: jest.fn(),
  };
});


describe('Platform Class 单测', () => {
  beforeEach(() => {
    // 在每个测试之前重置 wx 对象
    jest.clearAllMocks();
  });

  test('只能存在一个实例', () => {
    const platform1 = Platform.getInstance('weapp');
    const platform2 = Platform.getInstance('weapp');

    expect(platform1).toBe(platform2); // 确保两个实例是同一个
  });

  test('appName 正确', () => {
    Platform.getInstance('weapp');
    expect(Platform.getAppName()).toBe('weapp'); // 确保返回的 appName 正确
  });

});