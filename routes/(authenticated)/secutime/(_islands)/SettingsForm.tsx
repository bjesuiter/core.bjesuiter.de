import { useState } from "preact/hooks";
import { FormFieldWithLabel } from "@/components/FormFieldWithLabel.tsx";
import { WorkspaceSelector } from "./WorkspaceSelector.tsx";

type Service = {
  id: string;
  service_label: string;
};

type Props = {
  clockifyServices: Service[];
  currentServiceId?: string;
  currentWorkspaceId?: string;
};

export function SettingsForm(
  { clockifyServices, currentServiceId, currentWorkspaceId }: Props,
) {
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >(
    currentServiceId,
  );

  return (
    <form
      method="POST"
      class="flex flex-col gap-4"
      id="settings-form"
    >
      <FormFieldWithLabel label="Account" forId="connected_service">
        <select
          name="connected_service"
          id="connected_service"
          required
          class="border border-gray-300 rounded-md p-2"
          onChange={(e) => {
            const target = e.target as HTMLSelectElement;
            setSelectedServiceId(target.value || undefined);
          }}
        >
          <option value="">Select a Clockify account</option>
          {clockifyServices.map((service) => (
            <option
              key={service.id}
              value={service.id}
              selected={service.id === currentServiceId}
            >
              {service.service_label}
            </option>
          ))}
        </select>
      </FormFieldWithLabel>

      {selectedServiceId && (
        <FormFieldWithLabel label="Workspace" forId="workspace_id">
          <WorkspaceSelector
            connectedServiceId={selectedServiceId}
            currentWorkspaceId={currentWorkspaceId}
          />
        </FormFieldWithLabel>
      )}

      <button
        type="submit"
        class="primary-btn"
      >
        Save
      </button>
    </form>
  );
}
