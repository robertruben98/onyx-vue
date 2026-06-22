<script setup lang="ts">
import type { Component } from "vue";

import { UiAccordion, accordionDemos } from "../src/components/accordion";
import { UiAlert, alertDemos } from "../src/components/alert";
import { UiAvatar, avatarDemos } from "../src/components/avatar";
import { UiBadge, badgeDemos } from "../src/components/badge";
import { UiButton, buttonDemos } from "../src/components/button";
import { UiCard, cardDemos } from "../src/components/card";
import { UiCheckbox, checkboxDemos } from "../src/components/checkbox";
import { UiDataTable, dataTableDemos } from "../src/components/data-table";
import { UiDialog, dialogDemos } from "../src/components/dialog";
import { UiDivider, dividerDemos } from "../src/components/divider";
import { UiInput, inputDemos } from "../src/components/input";
import { UiMenu, menuDemos } from "../src/components/menu";
import { UiPopover, popoverDemos } from "../src/components/popover";
import { UiProgressBar, progressBarDemos } from "../src/components/progress-bar";
import { UiRadioGroup, radioGroupDemos } from "../src/components/radio-group";
import { UiSelect, selectDemos } from "../src/components/select";
import { UiSpinner, spinnerDemos } from "../src/components/spinner";
import { UiSwitch, switchDemos } from "../src/components/switch";
import { UiTabs, tabsDemos } from "../src/components/tabs";
import { UiTag, tagDemos } from "../src/components/tag";
import { UiTextarea, textareaDemos } from "../src/components/textarea";
import { UiTooltip, tooltipDemos } from "../src/components/tooltip";

interface Demo {
  title: string;
  description?: string;
  props?: Record<string, unknown>;
  slot: string;
}

const groups: { name: string; comp: Component; demos: Demo[] }[] = [
  { name: "Accordion", comp: UiAccordion, demos: accordionDemos },
  { name: "Alert", comp: UiAlert, demos: alertDemos },
  { name: "Avatar", comp: UiAvatar, demos: avatarDemos },
  { name: "Badge", comp: UiBadge, demos: badgeDemos },
  { name: "Button", comp: UiButton, demos: buttonDemos },
  { name: "Card", comp: UiCard, demos: cardDemos },
  { name: "Checkbox", comp: UiCheckbox, demos: checkboxDemos },
  { name: "Data table", comp: UiDataTable, demos: dataTableDemos },
  { name: "Dialog", comp: UiDialog, demos: dialogDemos },
  { name: "Divider", comp: UiDivider, demos: dividerDemos },
  { name: "Input", comp: UiInput, demos: inputDemos },
  { name: "Menu", comp: UiMenu, demos: menuDemos },
  { name: "Popover", comp: UiPopover, demos: popoverDemos },
  { name: "Progress bar", comp: UiProgressBar, demos: progressBarDemos },
  { name: "Radio group", comp: UiRadioGroup, demos: radioGroupDemos },
  { name: "Select", comp: UiSelect, demos: selectDemos },
  { name: "Spinner", comp: UiSpinner, demos: spinnerDemos },
  { name: "Switch", comp: UiSwitch, demos: switchDemos },
  { name: "Tabs", comp: UiTabs, demos: tabsDemos },
  { name: "Tag", comp: UiTag, demos: tagDemos },
  { name: "Textarea", comp: UiTextarea, demos: textareaDemos },
  { name: "Tooltip", comp: UiTooltip, demos: tooltipDemos },
];
</script>

<template>
  <main class="wrap">
    <h1>Onyx Vue</h1>
    <p class="sub">Accessible, token-themed Vue 3 components — {{ groups.length }} components.</p>
    <section v-for="g in groups" :key="g.name" class="group">
      <h2>{{ g.name }}</h2>
      <div v-for="(d, i) in g.demos" :key="i" class="demo">
        <h3>{{ d.title }}</h3>
        <p v-if="d.description" class="desc">{{ d.description }}</p>
        <div class="row">
          <component :is="g.comp" v-bind="d.props || {}">{{ d.slot }}</component>
        </div>
      </div>
    </section>
  </main>
</template>

<style>
.wrap { max-width: 960px; margin: 0 auto; padding: 2rem 1.25rem; font-family: system-ui, sans-serif; }
.sub { opacity: 0.7; margin-top: 0; }
.group { margin: 2.5rem 0; }
.group h2 { border-bottom: 1px solid rgba(128, 128, 128, 0.25); padding-bottom: 0.35rem; }
.demo { margin: 1.25rem 0; }
.demo h3 { font-size: 0.95rem; opacity: 0.75; font-weight: 600; }
.desc { opacity: 0.6; font-size: 0.85rem; }
.row { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
</style>
