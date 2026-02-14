// ToggleSwitch.tsx
import React from "react";
import "./ToggleSwitch.css"
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) => {
  return (
      <label className="switch">
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span className="slider round"></span>
      </label>
  );
};

export default ToggleSwitch;
 