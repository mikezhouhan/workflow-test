import { describe, it, expect } from 'vitest';
import { cn } from '../../../../renderer/utils/classnames';

describe('UI工具函数', () => {
  describe('cn函数', () => {
    it('应该合并多个类名', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('应该处理条件类名', () => {
      const condition = true;
      const result = cn('base', condition ? 'active' : 'inactive');
      expect(result).toBe('base active');
    });

    it('应该处理对象语法', () => {
      const result = cn('base', { active: true, disabled: false });
      expect(result).toBe('base active');
    });

    it('应该处理数组语法', () => {
      const result = cn('base', ['class1', 'class2']);
      expect(result).toBe('base class1 class2');
    });

    it('应该处理复杂嵌套', () => {
      const result = cn(
        'base',
        { active: true, disabled: false },
        ['class1', { nested: true }],
        undefined,
        null,
        false
      );
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).toContain('class1');
      expect(result).toContain('nested');
      expect(result).not.toContain('disabled');
      expect(result).not.toContain('undefined');
      expect(result).not.toContain('null');
      expect(result).not.toContain('false');
    });

    it('应该使用tailwind-merge解决冲突', () => {
      // tailwind-merge会解决类名冲突，保留最后一个
      const result = cn('p-4', 'p-6');
      expect(result).toBe('p-6');
    });

    it('应该处理空输入', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });
});
