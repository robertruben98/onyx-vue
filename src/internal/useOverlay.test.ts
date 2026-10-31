import { readFileSync } from 'node:fs';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { defineComponent, ref } from 'vue';
import Dialog from '../components/dialog/Dialog.vue';
import Menu from '../components/menu/Menu.vue';

it.each(['select/Select', 'menu/Menu', 'popover/Popover', 'tooltip/Tooltip'])('%s delegates overlay mechanics', (name) => {
  const source = readFileSync(`src/components/${name}.vue`, 'utf8');
  expect(source).toContain('useOverlay(');
  expect(source).not.toMatch(/getBoundingClientRect|case "Escape"|event.key === "Escape"|window.addEventListener/);
});

it('closes only the newest menu, then the dialog, with Teleport disabled', async () => {
  render(defineComponent({
    components: { Dialog, Menu },
    setup: () => ({ open: ref(true) }),
    template: `<Dialog v-model:open="open" heading="Parent"><Menu :items="[{label: 'Edit'}]">Actions</Menu></Dialog>`,
  }), { global: { stubs: { teleport: true } } });
  const trigger = screen.getByRole('button', { name: 'Actions' });
  await fireEvent.click(trigger);
  const menu = await screen.findByRole('menu');
  expect(screen.getByRole('dialog').contains(menu)).toBe(true);
  await fireEvent.keyDown(menu, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(document.activeElement).toBe(trigger);
  await fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('dismisses by opening order regardless of the event target and removes unmounted entries', async () => {
  const first = render(Menu, { props: { items: [{ label: 'First' }] }, slots: { default: 'One' } });
  const second = render(Menu, { props: { items: [{ label: 'Second' }] }, slots: { default: 'Two' } });
  await fireEvent.click(screen.getByRole('button', { name: 'One' }));
  await fireEvent.click(screen.getByRole('button', { name: 'Two' }));
  await fireEvent.keyDown(screen.getByRole('menuitem', { name: 'First' }), { key: 'Escape' });
  expect(screen.queryByRole('menuitem', { name: 'Second' })).toBeNull();
  expect(screen.getByRole('menuitem', { name: 'First' })).toBeTruthy();
  await fireEvent.click(screen.getByRole('button', { name: 'Two' }));
  second.unmount();
  await fireEvent.keyDown(document.body, { key: 'Escape' });
  expect(screen.queryByRole('menu')).toBeNull();
  first.unmount();
});
