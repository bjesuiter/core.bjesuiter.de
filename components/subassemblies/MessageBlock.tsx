import { Card } from "@/components/Card.tsx";
import { Toolbar } from "../Toolbar.tsx";
import { NavButton } from "../NavButton.tsx";
import { JSX } from "preact";

export function MessageBlock(
  props: {
    title: string;
    backUrl: string;
    children?: JSX.Element | JSX.Element[];
  },
) {
  return (
    <Card class="flex flex-col gap-4 mx-auto w-125">
      <Toolbar
        title={props.title}
        actionsSlotLeft={<NavButton href={props.backUrl}>Back</NavButton>}
      />
      <div>
        {props.children}
      </div>
    </Card>
  );
}
