// Button component! 
import React from "react";
import Image from 'next/image';

interface Props {
  label: string;
  onClick?: () => void;
  leftIconPath?: string;
  rightIconPath?: string;
  altStyle?: string;
  altTextStyle?: string;
  disabled?: boolean;
  type?: HTMLButtonElement["type"];
}

const Button: React.FC<Props> = (props) => {
  return (
    <button onClick={props.onClick} disabled={props.disabled} className={props.altStyle ?  props.altStyle : "text-white-600 bg-[#234254] font-medium rounded text-sm px-5.5 py-3 text-center hover:bg-[#4B7B96]-600 focus:outline-[#1a91d6] focus:bg-[#234254] active:bg-[#071823] disabled:opacity-75 disabled:bg-[#6D808B]"}>
    
      {props.leftIconPath ? <Image src={props.leftIconPath} alt={props.altTextStyle ? props.altTextStyle:""}/>:null}
      {props.label}
      {props.rightIconPath ? <Image src={props.rightIconPath} alt=""/>:null}
    </button>
  );
};

export default Button;