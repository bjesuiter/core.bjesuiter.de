export default function Home() {
  const denoDeploymentId = Deno.env.get("DENO_DEPLOYMENT_ID");
  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <p>DENO_DEPLOYMENT_ID: {denoDeploymentId}</p>
    </div>
  );
}
