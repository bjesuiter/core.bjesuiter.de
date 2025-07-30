import Menu from "../components/menu.tsx";

/**
 * Contains the sidebar and the floating toolbar to toggle it
 * Might include other icons in the toolbar too, like search
 *
 * @requires the surrounding component to have position: relative,
 * so the absolute toolbar can be positioned correctly
 */
export function Sidebar(props: { url: URL }) {
  return (
    <>
      {/* Small floating toolbar */}
      <div class="absolute top-8 left-5 p-1 bg-primary/20 rounded-md">
        {/* This div below builds the frame around the icon, not around the toolbar itself */}
        <div class="hover:rounded-md hover:bg-primary/20 p-1 hover:text-black aspect-square h-8 w-8">
          <span class="text-2xl icon-[mynaui--sidebar]"></span>
        </div>
      </div>

      {/* Left Sidebar */}
      <div class="">
        <h1 class="text-2xl font-bold mb-4 mt-4 text-center">
          coresvc
        </h1>
        <Menu class="" currentPath={props.url.pathname} />
      </div>
    </>
  );
}
