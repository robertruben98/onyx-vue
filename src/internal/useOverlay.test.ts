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

it('closes only the newest menu, then the dialog, in one DOM subtree', async () => {
  render(defineComponent({
    components: { Dialog, Menu },
    setup: () => ({ open: ref(true) }),
    template: `<Dialog v-model:open="open" heading="Parent"><Menu :items="[{label: 'Edit'}]">Actions</Menu></Dialog>`,
  }));
  const trigger = screen.getByRole('button', { name: 'Actions' });
  await fireEvent.click(trigger);
  const menu = await screen.findByRole('menu');
  // Put the real menu under the dialog listener: Escape must not depend on Teleport.
  const originalParent = menu.parentNode!;
  const nextSibling = menu.nextSibling;
  screen.getByRole('dialog').appendChild(menu);
  expect(screen.getByRole('dialog').contains(menu)).toBe(true);
  const dismissal = fireEvent.keyDown(menu, { key: 'Escape' });
  // Restore Vue's fragment before its queued render removes the closed panel.
  originalParent.insertBefore(menu, nextSibling);
  await dismissal;
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

// jsdom does not paint layers; this ties the primitive's kind mapping to the
// existing CSS contract. Real hit testing is covered in browser/demos.browser.mjs.
it('keeps each kind on its existing CSS layer token', async () => {
  const { overlayLayers } = await import('./useOverlay');
  for (const [kind, token] of Object.entries(overlayLayers)) {
    const css = readFileSync(`src/components/${kind}/${kind}.scss`, 'utf8');
    expect(css).toContain(`var(${token})`);
  }
});

it('closes an all-disabled menu and returns focus', async () => {
  render(Menu, { props: { items: [{ label: 'Locked', disabled: true }] }, slots: { default: 'Actions' } });
  const trigger = screen.getByRole('button', { name: 'Actions' });
  await fireEvent.click(trigger);
  await fireEvent.keyDown(await screen.findByRole('menu'), { key: 'Escape' });
  expect(screen.queryByRole('menu')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('removes resize, scroll and Escape listeners when unmounted open', async () => {
  const add = vi.spyOn(window, 'addEventListener');
  const remove = vi.spyOn(window, 'removeEventListener');
  try {
    const { unmount } = render(Menu, { props: { items: [{ label: 'Edit' }] }, slots: { default: 'Actions' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    const registrations = add.mock.calls.filter(([type]) => ['resize', 'scroll', 'keydown'].includes(type));
    expect(registrations).toHaveLength(3);
    unmount();
    for (const registration of registrations) expect(remove.mock.calls).toContainEqual(registration);
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  } finally {
    add.mockRestore();
    remove.mockRestore();
  }
});
