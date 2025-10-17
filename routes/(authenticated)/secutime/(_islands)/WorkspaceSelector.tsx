import { useEffect, useState } from "preact/hooks";

type Workspace = {
  id: string;
  name: string;
};

type Props = {
  connectedServiceId?: string;
  currentWorkspaceId?: string;
};

export function WorkspaceSelector(
  { connectedServiceId, currentWorkspaceId }: Props,
) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connectedServiceId) {
      setWorkspaces([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/secutime/api/workspaces?connectedServiceId=${connectedServiceId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch workspaces");
        }
        return response.json();
      })
      .then((data) => {
        setWorkspaces(data.workspaces || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [connectedServiceId]);

  if (!connectedServiceId) {
    return null;
  }

  if (loading) {
    return (
      <div class="text-gray-500">
        Loading workspaces...
      </div>
    );
  }

  if (error) {
    return (
      <div class="text-red-600">
        Error loading workspaces: {error}
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div class="text-gray-500">
        No workspaces found
      </div>
    );
  }

  return (
    <select
      name="workspace_id"
      id="workspace_id"
      required
      class="border border-gray-300 rounded-md p-2"
    >
      <option value="">Select a workspace</option>
      {workspaces.map((workspace) => (
        <option
          key={workspace.id}
          value={workspace.id}
          selected={workspace.id === currentWorkspaceId}
        >
          {workspace.name}
        </option>
      ))}
    </select>
  );
}
