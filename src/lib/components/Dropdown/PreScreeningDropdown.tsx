"use client";

import { useState } from "react";
import styles from "../../styles/commonV2/preScreeningDropdown.module.scss";

interface DropdownProps {
  value?: string;
  placeholder?: string;
  options: { name: string }[];
  onValueChange(value: string): void;
}

export default function PreScreeningDropdown({
  value,
  placeholder = "Select an option...",
  options,
  onValueChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: { name: string }) => {
    onValueChange(option.name);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Use first option as default if no value selected
  const displayValue = value || (options.length > 0 ? options[0].name : "");
  const displayOptions = options;
  const isPlaceholder = !value && options.length > 0;

  return (
    <div className={styles.dropdownContainer}>
      <div
        className={styles.dropdownButton}
        onClick={handleToggle}
      >
        <span className={`${styles.value} ${isPlaceholder ? styles.placeholder : ''}`}>{displayValue}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.chevron}
        >
          <path
            d="M5 7.85693L10 12.8569L15 7.85693"
            stroke="#717680"
            strokeWidth="1.67"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {displayOptions.map((option, index) => (
            <div
              key={index}
              className={`${styles.dropdownItem} ${
                option.name === displayValue ? styles.selected : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
