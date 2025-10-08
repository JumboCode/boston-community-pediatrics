// Button component! 
import React from "react";

interface Props {
  label: string;
  onClick: () => void;
}

export default function Button(props: Props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
