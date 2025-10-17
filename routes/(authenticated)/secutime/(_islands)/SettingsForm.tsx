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
  selectedAccountId?: string;
};

export function SettingsForm(
  { clockifyServices, currentServiceId, currentWorkspaceId, selectedAccountId }:
    Props,
) {
  const handleAccountChange = (e: Event) => {
    console.log("handleAccountChange called");
    const target = e.target as HTMLSelectElement;
    const serviceId = target.value;
    if (serviceId) {
      // Reload page with account query param
      globalThis.location.href = `/secutime/settings?account=${serviceId}`;
    }
  };

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
          onChange={handleAccountChange}
        >
          <option value="">Select a Clockify account</option>
          {clockifyServices.map((service) => (
            <option
              key={service.id}
              value={service.id}
              selected={service.id === (selectedAccountId || currentServiceId)}
            >
              {service.service_label}
            </option>
          ))}
        </select>
      </FormFieldWithLabel>

      {selectedAccountId && (
        <FormFieldWithLabel label="Workspace" forId="workspace_id">
          <WorkspaceSelector
            connectedServiceId={selectedAccountId}
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
