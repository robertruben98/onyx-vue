import type { ComponentDoc } from "../../docs-model";

export const fieldsetDoc: ComponentDoc = {
  id: "fieldset",
  title: "Fieldset",
  description:
    "A group of settings under a caption, with a note slot underneath for what the settings really do. UiFieldRow lays out one setting as label + control and hands the control its label id through the slot, so non-native controls get a name too.",
  imports: ["UiFieldset", "UiFieldRow", "UiCheckbox", "UiSelect"],
  api: [
    { name: "legend", type: "string", default: "—", description: "UiFieldset: the group's caption." },
    { name: "columns", type: "1 | 2 | 3", default: "1", description: "UiFieldset: grid columns for the items (one below 640px)." },
    { name: "#note", type: "slot", default: "—", description: "UiFieldset: the explanation under the group." },
    { name: "label", type: "string", default: "—", description: "UiFieldRow: what the setting is." },
    {
      name: "#default",
      type: "slot { labelId: string }",
      default: "—",
      description: "UiFieldRow: the control; pass labelId as its aria-labelledby.",
    },
  ],
  demos: [
    {
      title: "A settings dialog section",
      setup: () => ({ refresh: "10000", compact: false, cols: { port: true, branch: true, url: false } }),
      code: `<UiFieldset legend="datos">
  <UiFieldRow label="refresco automatico" v-slot="{ labelId }">
    <UiSelect v-model="refresh" :aria-labelledby="labelId"
      :options="[{ value: '0', label: 'apagado' }, { value: '10000', label: '10 s' }]" />
  </UiFieldRow>
  <template #note>Cada refresco hace que svc.sh sondee todos sus puertos.</template>
</UiFieldset>
<UiFieldset legend="columnas" :columns="3">
  <UiCheckbox v-model="cols.port" label="puerto" />
  <UiCheckbox v-model="cols.branch" label="rama" />
  <UiCheckbox v-model="cols.url" label="url" />
  <template #note>Quitar una columna solo deja de pintarla.</template>
</UiFieldset>`,
    },
  ],
};
