// Button component! This is a sample component, make sure you have eslint installed!
// the class parameter should have a red line!
import React from "react";

interface Props {
  label: string;
  onClick: () => void;
}

export default function Button(props: Props) {
  return (
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );
}
