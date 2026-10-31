import { compile } from 'sass';
import { render } from '@testing-library/vue';
import RadioGroup from './radio-group/RadioGroup.vue';
import Switch from './switch/Switch.vue';
import CheckRow from './check-row/CheckRow.vue';

// jsdom cannot measure layout. Assert the compiled CSS rules here; the Chromium
// script scripts/control-rows/verify.mjs checks token sizes and first-line centres.
function rule(component: string, selector: string) {
  const css = compile(`src/components/${component}/${component}.scss`).css;
  const blocks = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
  return blocks.filter(m => m[1].trim().split(/,\s*/).includes(selector)).map(m => m[2]).join('\n');
}

describe('wrapping control rows', () => {
  it.each([
    ['checkbox', '.ui-checkbox__el'],
    ['radio-group', '.ui-radio__el'],
    ['switch', '.ui-switch__control'],
    ['check-row', '.ui-check-row__state > *'],
  ])('%s explicitly prevents control shrinking', (component, selector) => {
    expect(rule(component, selector)).toMatch(/flex:\s*none/);
  });

  it.each([
    ['radio-group', '.ui-radio--labelled', '.ui-radio__el', '.ui-radio__label', 'radio-label'],
    ['switch', '.ui-switch__wrap--labelled', '.ui-switch__control', '.ui-switch__label', 'switch-label'],
    ['check-row', '.ui-check-row--labelled', '.ui-check-row__state', '.ui-check-row__name', 'check-row-name'],
  ])('%s aligns only labelled controls to their first line', (component, row, control, label, token) => {
    expect(rule(component, row)).toMatch(/align-items:\s*flex-start/);
    expect(rule(component, `${row} ${control}`)).toMatch(/margin-top:\s*calc\(/);
    expect(rule(component, label)).toContain(`line-height: var(--ui-${token}-line-height)`);
    expect(rule(component, label)).toMatch(/min-width:\s*0/);
  });

  it('adds alignment modifiers only for visible labels', () => {
    for (const label of ['', 'A long label']) {
      const radio = render(RadioGroup, { props: { options: [{ label, value: 'one' }] } });
      const toggle = render(Switch, { props: { label } });
      const row = render(CheckRow, { props: { name: label } });
      expect(!!radio.container.querySelector('.ui-radio--labelled')).toBe(!!label);
      expect(!!toggle.container.querySelector('.ui-switch__wrap--labelled')).toBe(!!label);
      expect(!!row.container.querySelector('.ui-check-row--labelled')).toBe(!!label);
    }
  });
});
